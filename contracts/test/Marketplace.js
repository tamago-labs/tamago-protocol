const { expect } = require("chai")
const { ethers } = require("hardhat")
const { MerkleTree } = require('merkletreejs')
const keccak256 = require("keccak256")
const Hash = require('pure-ipfs-only-hash')
const { toUsdc, fromUsdc } = require("./Helpers")

// contracts
let gatewayChainOne
let gatewayChainTwo
let marketplace
let marketplaceChainOne
let marketplaceChainTwo

// mocks
let erc1155
let erc721
let mockUsdc

// accounts
let admin
let alice
let bob
let relayer
let validator
let dev


describe("Marketplace contract - intra-chain swaps", () => {

    beforeEach(async () => {
        [admin, alice, bob, relayer, validator, dev] = await ethers.getSigners()

        const Marketplace = await ethers.getContractFactory("Marketplace")

        const MockERC1155 = await ethers.getContractFactory("MockERC1155")
        const MockERC721 = await ethers.getContractFactory("MockERC721")
        const MockERC20 = await ethers.getContractFactory("MockERC20")
        const Gateway = await ethers.getContractFactory("Gateway")

        const gateway = await Gateway.deploy(1)
        marketplace = await Marketplace.deploy(gateway.address)

        erc1155 = await MockERC1155.deploy(
            "https://api.cryptokitties.co/kitties/{id}"
        )
        erc721 = await MockERC721.deploy("Mock NFT", "MOCK")
        mockUsdc = await MockERC20.deploy("Mock USDC", "USDC", 6)
    })

    it("create an order and fulfill", async () => {

        // mint ERC-1155
        await erc1155.mint(alice.address, 1, 1, "0x00")
        await erc1155.mint(bob.address, 2, 1, "0x00")
        // mint ERC-721
        await erc721.mint(alice.address, 1)
        await erc721.mint(bob.address, 2)

        // make approvals
        await erc1155.connect(alice).setApprovalForAll(marketplace.address, true)
        await erc721.connect(alice).setApprovalForAll(marketplace.address, true)
        await erc1155.connect(bob).setApprovalForAll(marketplace.address, true)
        await erc721.connect(bob).setApprovalForAll(marketplace.address, true)

        const CIDS = await Promise.all(["Order#1", "Order#2"].map(item =>  Hash.of(item)))

        // Alice accepts NFT ID 2 from both ERC721 & ERC1155 contracts
        const leaves = [erc1155, erc721].map((item, index) => ethers.utils.keccak256(ethers.utils.solidityPack([ "string" , "uint256" , "address", "uint256"], [index === 0 ? CIDS[0] : CIDS[1]  , 1, item.address, 2])))
        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })

        const hexRoot = tree.getHexRoot()


        await marketplace.connect(alice).create(CIDS[0], erc1155.address, 1, 2, hexRoot)
        await marketplace.connect(alice).create(CIDS[1], erc721.address, 1, 1, hexRoot)

        // verify
        const firstOrder = await marketplace.orders(CIDS[0])
        expect(firstOrder['assetAddress']).to.equal(erc1155.address)
        expect(firstOrder['tokenId'].toString()).to.equal("1")
        expect(firstOrder['tokenType']).to.equal(2)
        expect(firstOrder['owner']).to.equal(alice.address)

        const secondOrder = await marketplace.orders(CIDS[1])
        expect(secondOrder['assetAddress']).to.equal(erc721.address)
        expect(secondOrder['tokenId'].toString()).to.equal("1")
        expect(secondOrder['tokenType']).to.equal(1)
        expect(secondOrder['owner']).to.equal(alice.address)

        // check whether Bob can swaps
        const proof1 = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack(["string","uint256", "address", "uint256"], [ CIDS[0], 1,  erc1155.address, 2])))

        expect(await marketplace.connect(bob).eligibleToSwap(
            CIDS[0],
            erc1155.address,
            2,
            firstOrder['root'],
            proof1
        )).to.true

        const proof2 = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack([ "string", "uint256",  "address", "uint256"], [ CIDS[1], 1,  erc721.address, 2])))

        expect(await marketplace.connect(bob).eligibleToSwap(
            CIDS[1],
            erc721.address,
            2,
            secondOrder['root'],
            proof2
        )).to.true

        // swap
        // Token 2 -> Token 1
        await marketplace.connect(bob).swap(CIDS[0], erc1155.address, 2, 2, proof1)
        await marketplace.connect(bob).swap(CIDS[1], erc721.address, 2, 1, proof2)

        // Alice should receives Token 2
        expect(await erc1155.balanceOf(alice.address, 2)).to.equal(1)
        expect(await erc721.ownerOf(2)).to.equal(alice.address)
        // Bob should receives Token 1
        expect(await erc1155.balanceOf(bob.address, 1)).to.equal(1)
        expect(await erc721.ownerOf(1)).to.equal(bob.address)
    })

    it("create an order and fulfill /w ERC-20", async () => {

        // mint ERC-721 for Alice
        await erc721.mint(alice.address, 1)
        // Prepare ERC-20 for Bob
        await mockUsdc.connect(bob).faucet()

        // make approvals
        await erc721.connect(alice).setApprovalForAll(marketplace.address, true)
        await mockUsdc.connect(bob).approve(marketplace.address, ethers.constants.MaxUint256)
 
        const cid = await Hash.of("Order#1")

        const leaves = [ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "uint256"], [ cid ,1 , mockUsdc.address, toUsdc(200)]))]

        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })

        const root = tree.getHexRoot()

        // create an order and deposit ERC721 NFT
        await marketplace.connect(alice).create(cid, erc721.address, 1, 1, root)

        const proof = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256","address", "uint256"], [cid , 1 , mockUsdc.address, toUsdc(200)])))

        expect(await marketplace.connect(bob).eligibleToSwap(
            cid,
            mockUsdc.address,
            toUsdc(200),
            (await marketplace.orders(cid))['root'],
            proof
        )).to.true

        const before = await mockUsdc.balanceOf(bob.address)

        // swap 200 USDC for 1 NFT
        await marketplace.connect(bob).swap(cid, mockUsdc.address, toUsdc(200), 0, proof)

        const after = await mockUsdc.balanceOf(bob.address)

        expect(Number(fromUsdc(before)) - Number(fromUsdc(after))).to.equal(200)

        // validate the result
        expect(await erc721.ownerOf(1)).to.equal(bob.address)
        expect(await mockUsdc.balanceOf(alice.address)).to.equal(toUsdc(200))

    })

})


describe("Marketplace contract - cross-chain swaps", () => {

    beforeEach(async () => {
        [admin, alice, bob, relayer, validator, dev] = await ethers.getSigners()

        const Gateway = await ethers.getContractFactory("Gateway")
        const Marketplace = await ethers.getContractFactory("Marketplace")

        const MockERC1155 = await ethers.getContractFactory("MockERC1155")
        const MockERC721 = await ethers.getContractFactory("MockERC721")
        const MockERC20 = await ethers.getContractFactory("MockERC20")

        gatewayChainOne = await Gateway.deploy(1)
        gatewayChainTwo = await Gateway.deploy(2)

        marketplaceChainOne = await Marketplace.deploy(gatewayChainOne.address)
        marketplaceChainTwo = await Marketplace.deploy(gatewayChainTwo.address)

        erc1155 = await MockERC1155.deploy(
            "https://api.cryptokitties.co/kitties/{id}"
        )
        erc721 = await MockERC721.deploy("Mock NFT", "MOCK")
        mockUsdc = await MockERC20.deploy("Mock USDC", "USDC", 6)

        await gatewayChainOne.connect(admin).grant(validator.address, 3)
        await gatewayChainTwo.connect(admin).grant(relayer.address, 2)
        await gatewayChainTwo.connect(admin).grant(validator.address, 3)
    })

    it("Sell NFT#A from Chain#1 to NFT#B from Chain#2", async () => {

        // Mint NFT#A
        await erc721.mint(alice.address, 1)
        // Mint NFT#B
        await erc721.mint(bob.address, 2)

        await erc721.connect(alice).setApprovalForAll(marketplaceChainOne.address, true)
        await erc721.connect(bob).setApprovalForAll(marketplaceChainTwo.address, true)

        // Verify the chain id
        expect(await gatewayChainOne.chainId()).to.equal(1)
        expect(await gatewayChainTwo.chainId()).to.equal(2)

        const cid = await Hash.of("Order#1")

        // Construct the message (Receives NFT#B at Chain#2)
        let leaves = [erc721].map(item => ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "uint256"], [ cid, 2, item.address, 2]))) // Order ID, Chain ID, Asset Address, Token ID
        let tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
        let hexRoot = tree.getHexRoot()

        // Create an entry at the origin chain first
        await marketplaceChainOne.connect(alice).create(cid, erc721.address, 1, 1, hexRoot)

        // Verify
        const entry = await marketplaceChainOne.orders(cid)
        expect(entry['assetAddress']).to.equal(erc721.address)
        expect(entry['tokenId'].toString()).to.equal("1")
        expect(entry['owner']).to.equal(alice.address)

        // Attach a state root
        await gatewayChainTwo.connect(relayer).updateRelayMessage(hexRoot)

        // Check it
        const proof = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "uint256"], [cid, 2, erc721.address, 2])))
        expect(await marketplaceChainTwo.connect(bob).eligibleToPartialSwap(cid, erc721.address, 2, proof)).to.true

        // Deposit NFt on the pair chain
        await marketplaceChainTwo.connect(bob).partialSwap(cid, erc721.address, 2, 1, proof)

        // Validate 
        const partialOrderData = await marketplaceChainTwo.partials(cid)
        expect(partialOrderData['active']).to.true
        expect(partialOrderData['ended']).to.false
        expect(partialOrderData['buyer']).to.equal(bob.address)
        expect(partialOrderData['assetAddress']).to.equal(erc721.address)
        expect(partialOrderData['tokenIdOrAmount']).to.equal(2)
        expect(partialOrderData['tokenType']).to.equal(1)

        // Prepare the claim data
        leaves = [1, 2].map(item => ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "bool"], [cid, item, item === 1 ? bob.address : alice.address, item === 1 ? true : false])))
        tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
        hexRoot = tree.getHexRoot()

        // Attach a state root
        await gatewayChainOne.connect(validator).updateClaimMessage(hexRoot)
        await gatewayChainTwo.connect(validator).updateClaimMessage(hexRoot)

        // Bob claims NFT from Chain#1 and close the order
        const proofBob = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "bool"], [cid, 1, bob.address, true])))
        expect(await marketplaceChainOne.connect(bob).eligibleToClaim(cid, bob.address, true, proofBob)).to.true
        await marketplaceChainOne.connect(bob).claim(cid, true, proofBob)

        // Then Alice claims NFT from Chain#2 and close the order
        const proofAlice = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "bool"], [cid, 2, alice.address, false])))
        expect(await marketplaceChainTwo.connect(alice).eligibleToClaim(cid, alice.address, false, proofAlice)).to.true
        await marketplaceChainTwo.connect(alice).claim(cid, false, proofAlice)

        // Verify the result
        expect(await erc721.ownerOf(1)).to.equal(bob.address)
        expect(await erc721.ownerOf(2)).to.equal(alice.address)

        const finalDataChainOne = await marketplaceChainOne.orders(cid)
        const finalDataChainTwo = await marketplaceChainTwo.partials(cid)

        expect(finalDataChainOne['ended']).to.true
        expect(finalDataChainTwo['ended']).to.true

    })

    it("Sell NFT#A from Chain#1 to 100 USDC from Chain#2", async () => {

        // Mint NFT#A
        await erc721.mint(alice.address, 1)
        // Prepare ERC-20 for Bob
        await mockUsdc.connect(bob).faucet()
        // Set Swap fees to 0%
        await marketplaceChainOne.setSwapFee(0)
        await marketplaceChainTwo.setSwapFee(0)

        await erc721.connect(alice).setApprovalForAll(marketplaceChainOne.address, true)
        await mockUsdc.connect(bob).approve(marketplaceChainTwo.address, ethers.constants.MaxUint256)

        // Verify the chain id
        expect(await gatewayChainOne.chainId()).to.equal(1)
        expect(await gatewayChainTwo.chainId()).to.equal(2)

        const cid = await Hash.of("Order#1")

        // Construct the message (Receives 100 USDC at Chain#2)
        let leaves = [mockUsdc].map(item => ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "uint256"], [cid, 2, item.address, toUsdc(100)]))) // Order ID, Chain ID, Asset Address, Token ID
        let tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
        let hexRoot = tree.getHexRoot()

        // Create an entry at the origin chain first
        await marketplaceChainOne.connect(alice).create(cid, erc721.address, 1, 1, hexRoot)

        // Verify
        const entry = await marketplaceChainOne.orders(cid)
        expect(entry['assetAddress']).to.equal(erc721.address)
        expect(entry['tokenId'].toString()).to.equal("1")
        expect(entry['owner']).to.equal(alice.address)

        // Attach a state root
        await gatewayChainTwo.connect(relayer).updateRelayMessage(hexRoot)

        // Check it
        const proof = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "uint256"], [cid, 2, mockUsdc.address, toUsdc(100)])))
        expect(await marketplaceChainTwo.connect(bob).eligibleToPartialSwap(cid, mockUsdc.address, toUsdc(100), proof)).to.true

        // Deposit 100 USDC on the destination chain
        await marketplaceChainTwo.connect(bob).partialSwap(cid, mockUsdc.address, toUsdc(100), 0, proof)

        // Validate 
        const partialOrderData = await marketplaceChainTwo.partials(cid)
        expect(partialOrderData['active']).to.true
        expect(partialOrderData['ended']).to.false
        expect(partialOrderData['buyer']).to.equal(bob.address)
        expect(partialOrderData['assetAddress']).to.equal(mockUsdc.address)
        expect(partialOrderData['tokenIdOrAmount']).to.equal(toUsdc(100))
        expect(partialOrderData['tokenType']).to.equal(0)

        // Prepare the claim data
        leaves = [
            ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "bool"], [cid, 1, bob.address, true])), // Bob claims NFT at Chain#1
            ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "bool"], [cid, 2, alice.address, false])) // Alice claims 100 USDC at Chain#2
        ]
        tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
        hexRoot = tree.getHexRoot()

        // Attach a state root
        await gatewayChainOne.connect(validator).updateClaimMessage(hexRoot)
        await gatewayChainTwo.connect(validator).updateClaimMessage(hexRoot)

        // Bob claims NFT from Chain#1 and close the order
        const proofBob = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack([ "string", "uint256", "address" , "bool" ], [cid , 1,  bob.address, true])))
        expect( await marketplaceChainOne.connect(bob).eligibleToClaim(cid, bob.address, true, proofBob) ).to.true
        await marketplaceChainOne.connect(bob).claim(cid, true, proofBob)

        // Then Alice claims 100 USDC at Chain#2 and close the order
        const proofAlice = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack([ "string", "uint256", "address" , "bool" ], [cid , 2,  alice.address, false])))
        expect( await marketplaceChainTwo.connect(alice).eligibleToClaim(cid, alice.address, false, proofAlice) ).to.true
        await marketplaceChainTwo.connect(alice).claim(cid, false, proofAlice)

        // Verify the result
        expect(await erc721.ownerOf(1)).to.equal(bob.address)
        expect(await mockUsdc.balanceOf(alice.address)).to.equal(toUsdc(100))

        const finalDataChainOne = await marketplaceChainOne.orders(cid)
        const finalDataChainTwo = await marketplaceChainTwo.partials(cid)

        expect( finalDataChainOne['ended']).to.true
        expect( finalDataChainTwo['ended']).to.true

    })

})

// TODO: Trade in batch