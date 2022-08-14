const { expect } = require("chai")
const { ethers } = require("hardhat")
const { MerkleTree } = require('merkletreejs')
const keccak256 = require("keccak256")
const Hash = require('pure-ipfs-only-hash')
const { toUsdc, fromUsdc , toEther, fromEther, getBalance } = require("./Helpers")


// contracts
let gatewayA
let gatewayB
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


describe("Marketplace contract", () => {

    beforeEach(async () => {
        [admin, alice, bob, relayer, validator, dev] = await ethers.getSigners()

        const Gateway = await ethers.getContractFactory("Gateway")

        const MockERC1155 = await ethers.getContractFactory("MockERC1155")
        const MockERC721 = await ethers.getContractFactory("MockERC721")
        const MockERC20 = await ethers.getContractFactory("MockERC20")
       
        gatewayA = await Gateway.deploy(1)
        gatewayB = await Gateway.deploy(2)

        erc1155 = await MockERC1155.deploy(
            "https://api.cryptokitties.co/kitties/{id}"
        )
        erc721 = await MockERC721.deploy("Mock NFT", "MOCK")
        mockUsdc = await MockERC20.deploy("Mock USDC", "USDC", 6)

        // authorize validators / relayers
        await gatewayA.connect(admin).setValidator(validator.address, true)
        await gatewayA.connect(admin).setRelayer(relayer.address, true)
        await gatewayB.connect(admin).setValidator(validator.address, true)
        await gatewayB.connect(admin).setRelayer(relayer.address, true)
        
    })

    it("Sell NFT#A from Chain#1 to NFT#B from Chain#2", async () => {
        
        // Mint NFT#A
        await erc721.mint(alice.address, 1)
        // Mint NFT#B
        await erc721.mint(bob.address, 2)

        await erc721.connect(alice).setApprovalForAll(gatewayA.address, true)
        await erc721.connect(bob).setApprovalForAll(gatewayB.address, true)

        // Verify the chain id
        expect(await gatewayA.chainId()).to.equal(1)
        expect(await gatewayB.chainId()).to.equal(2)

        const CIDS = await Promise.all(["Order#1", "Order#2"].map(item =>  Hash.of(item)))

        // Construct the message (Receives NFT#B at Chain#2)
        let leaves = [erc721].map((item , index) => ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "uint256"], [CIDS[index], 2, item.address, 2]))) // Order ID, Chain ID, Asset Address, Token ID
        let tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
        let hexRoot = tree.getHexRoot()

        // Create an entry at the origin chain first
        await gatewayA.connect(alice).create(CIDS[0], erc721.address, 1, 1, hexRoot)

        // Verify
        const entry = await gatewayA.orders(CIDS[0])
        expect(entry['assetAddress']).to.equal(erc721.address)
        expect(entry['tokenId'].toString()).to.equal("1")
        expect(entry['owner']).to.equal(alice.address)

        // Attach a state root
        await gatewayB.connect(relayer).updateRelayMessage(hexRoot)

        // Check it
        const proof = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "uint256"], [CIDS[0], 2, erc721.address, 2])))
        expect(await gatewayB.connect(bob).eligibleToPartialSwap(CIDS[0], erc721.address, 2, proof)).to.true

        // Deposit NFt on the destination chain
        await gatewayB.connect(bob).partialSwap(CIDS[0], erc721.address, 2, 1, proof)

        // Validate 
        const partialOrderData = await gatewayB.partialOrders(CIDS[0])
        expect(partialOrderData['active']).to.true
        expect(partialOrderData['ended']).to.false
        expect(partialOrderData['buyer']).to.equal(bob.address)
        expect(partialOrderData['assetAddress']).to.equal(erc721.address)
        expect(partialOrderData['tokenIdOrAmount']).to.equal(2)
        expect(partialOrderData['tokenType']).to.equal(1)

        // Prepare the claim data
        leaves = [1, 2].map(item => ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "bool"], [CIDS[0], item, item === 1 ? bob.address : alice.address, item === 1 ? true : false])))
        tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
        hexRoot = tree.getHexRoot()

        // Attach a state root
        await gatewayA.connect(validator).updateClaimMessage(hexRoot)
        await gatewayB.connect(validator).updateClaimMessage(hexRoot)

        // Bob claims NFT from Chain#1 and close the order
        const proofBob = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "bool"], [CIDS[0], 1, bob.address, true])))
        expect(await gatewayA.connect(bob).eligibleToClaim(CIDS[0], bob.address, true, proofBob)).to.true
        await gatewayA.connect(bob).claim(CIDS[0], true, proofBob, bob.address)

        // Then Alice claims NFT from Chain#2 and close the order
        const proofAlice = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "bool"], [CIDS[0], 2, alice.address, false])))
        expect(await gatewayB.connect(alice).eligibleToClaim(CIDS[0], alice.address, false, proofAlice)).to.true
        await gatewayB.connect(alice).claim(CIDS[0], false, proofAlice, alice.address)

        // Verify the result
        expect(await erc721.ownerOf(1)).to.equal(bob.address)
        expect(await erc721.ownerOf(2)).to.equal(alice.address)

        const finalDataChainOne = await gatewayA.orders(CIDS[0])
        const finalDataChainTwo = await gatewayB.partialOrders(CIDS[0])

        expect(finalDataChainOne['ended']).to.true
        expect(finalDataChainTwo['ended']).to.true

    })

    it("Sell NFT#A from Chain#1 to 100 USDC from Chain#2", async () => {

        const CIDS = await Promise.all(["Order#1", "Order#2"].map(item =>  Hash.of(item)))

        // Mint NFT#A
        await erc721.mint(alice.address, 1)
        // Prepare ERC-20 for Bob
        await mockUsdc.connect(bob).faucet() 

        await erc721.connect(alice).setApprovalForAll(gatewayA.address, true)
        await mockUsdc.connect(bob).approve(gatewayB.address, ethers.constants.MaxUint256)

        // Verify the chain id
        expect(await gatewayA.chainId()).to.equal(1)
        expect(await gatewayB.chainId()).to.equal(2)

        // Construct the message (Receives 100 USDC at Chain#2)
        let leaves = [mockUsdc].map(item => ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "uint256"], [ CIDS[0] , 2, item.address, toUsdc(100)]))) // Order ID, Chain ID, Asset Address, Token ID
        let tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
        let hexRoot = tree.getHexRoot()

        // Create an entry at the origin chain first
        await gatewayA.connect(alice).create(CIDS[0], erc721.address, 1, 1, hexRoot)

        // Verify
        const entry = await gatewayA.orders(CIDS[0])
        expect(entry['assetAddress']).to.equal(erc721.address)
        expect(entry['tokenId'].toString()).to.equal("1")
        expect(entry['owner']).to.equal(alice.address)

        // Attach a state root
        await gatewayB.connect(relayer).updateRelayMessage(hexRoot)

        // Check it
        const proof = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "uint256"], [CIDS[0], 2, mockUsdc.address, toUsdc(100)])))
        expect(await gatewayB.connect(bob).eligibleToPartialSwap(CIDS[0], mockUsdc.address, toUsdc(100), proof)).to.true

        // Deposit 100 USDC on the destination chain
        await gatewayB.connect(bob).partialSwap(CIDS[0], mockUsdc.address, toUsdc(100), 0, proof)

        // Validate 
        const partialOrderData = await gatewayB.partialOrders(CIDS[0])
        expect(partialOrderData['active']).to.true
        expect(partialOrderData['ended']).to.false
        expect(partialOrderData['buyer']).to.equal(bob.address)
        expect(partialOrderData['assetAddress']).to.equal(mockUsdc.address)
        expect(partialOrderData['tokenIdOrAmount']).to.equal(toUsdc(100))
        expect(partialOrderData['tokenType']).to.equal(0)

        // Prepare the claim data
        leaves = [
            ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "bool"], [CIDS[0], 1, bob.address, true])), // Bob claims NFT at Chain#1
            ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "bool"], [CIDS[0], 2, alice.address, false])) // Alice claims 100 USDC at Chain#2
        ]
        tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
        hexRoot = tree.getHexRoot()

        // Attach a state root
        await gatewayA.connect(validator).updateClaimMessage(hexRoot)
        await gatewayB.connect(validator).updateClaimMessage(hexRoot)

        // Bob claims NFT from Chain#1 and close the order
        const proofBob = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack([ "string", "uint256", "address" , "bool" ], [CIDS[0], 1,  bob.address, true])))
        expect( await gatewayA.connect(bob).eligibleToClaim(CIDS[0], bob.address, true, proofBob) ).to.true
        await gatewayA.connect(bob).claim(CIDS[0], true, proofBob, bob.address)

        // Then Alice claims 100 USDC from Chain#2 and close the order
        const proofAlice = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack([ "string", "uint256", "address" , "bool" ], [CIDS[0] , 2,  alice.address, false])))
        expect( await gatewayB.connect(alice).eligibleToClaim(CIDS[0], alice.address, false, proofAlice) ).to.true
        await gatewayB.connect(alice).claim(CIDS[0], false, proofAlice, alice.address)

        // Verify the result
        expect(await erc721.ownerOf(1)).to.equal(bob.address)
        expect(await mockUsdc.balanceOf(alice.address)).to.equal(toUsdc(100))

        const finalDataChainOne = await gatewayA.orders(CIDS[0])
        const finalDataChainTwo = await gatewayB.partialOrders(CIDS[0])

        expect( finalDataChainOne['ended']).to.true
        expect( finalDataChainTwo['ended']).to.true

    })

    it("Sell NFT#A from Chain#1 to 1 ETH from Chain#2", async () => {

        const CIDS = await Promise.all(["Order#1", "Order#2"].map(item =>  Hash.of(item)))

        // Mint NFT#A
        await erc721.mint(alice.address, 1)

        await erc721.connect(alice).setApprovalForAll(gatewayA.address, true)
      
        // Verify the chain id
        expect(await gatewayA.chainId()).to.equal(1)
        expect(await gatewayB.chainId()).to.equal(2)

        // Construct the message (Receives 100 USDC at Chain#2)
        let leaves = [mockUsdc].map(item => ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "uint256"], [ CIDS[0] , 2, "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", toEther(1)]))) // Order ID, Chain ID, Asset Address, Token ID
        let tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
        let hexRoot = tree.getHexRoot()

        // Create an entry at the origin chain first
        await gatewayA.connect(alice).create(CIDS[0], erc721.address, 1, 1, hexRoot)

        // Verify
        const entry = await gatewayA.orders(CIDS[0])
        expect(entry['assetAddress']).to.equal(erc721.address)
        expect(entry['tokenId'].toString()).to.equal("1")
        expect(entry['owner']).to.equal(alice.address)

        // Attach a state root
        await gatewayB.connect(relayer).updateRelayMessage(hexRoot)

        // Check it
        const proof = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "uint256"], [CIDS[0], 3, "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", toEther(1)])))
        expect(await gatewayB.connect(bob).eligibleToPartialSwap(CIDS[0], "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", toEther(1), proof)).to.true

        // Deposit 100 USDC on the destination chain
        await gatewayB.connect(bob).partialSwapWithEth(CIDS[0], proof , {
            value  : toEther(1)
        })

        // Validate 
        const partialOrderData = await gatewayB.partialOrders(CIDS[0])
        expect(partialOrderData['active']).to.true
        expect(partialOrderData['ended']).to.false
        expect(partialOrderData['buyer']).to.equal(bob.address)
        expect(partialOrderData['assetAddress']).to.equal("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE")
        expect(partialOrderData['tokenIdOrAmount']).to.equal(toEther(1))
        expect(partialOrderData['tokenType']).to.equal(3)

        // Prepare the claim data
        leaves = [
            ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "bool"], [CIDS[0], 1, bob.address, true])), // Bob claims NFT at Chain#1
            ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "bool"], [CIDS[0], 2, alice.address, false])) // Alice claims 1 ETH at Chain#2
        ]
        tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
        hexRoot = tree.getHexRoot()

        // Attach a state root
        await gatewayA.connect(validator).updateClaimMessage(hexRoot)
        await gatewayB.connect(validator).updateClaimMessage(hexRoot)

        // Bob claims NFT from Chain#1 and close the order
        const proofBob = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack([ "string", "uint256", "address" , "bool" ], [CIDS[0], 1,  bob.address, true])))
        expect( await gatewayA.connect(bob).eligibleToClaim(CIDS[0], bob.address, true, proofBob) ).to.true
        await gatewayA.connect(bob).claim(CIDS[0], true, proofBob, bob.address)

        // Then Alice claims 1 ETH from Chain#2 and close the order
        const proofAlice = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack([ "string", "uint256", "address" , "bool" ], [CIDS[0] , 2,  alice.address, false])))
        expect( await gatewayB.connect(alice).eligibleToClaim(CIDS[0], alice.address, false, proofAlice) ).to.true
        await gatewayB.connect(alice).claim(CIDS[0], false, proofAlice, alice.address)

        // Verify the result
        expect(await erc721.ownerOf(1)).to.equal(bob.address) 

        const finalDataChainOne = await gatewayA.orders(CIDS[0])
        const finalDataChainTwo = await gatewayB.partialOrders(CIDS[0])

        expect( finalDataChainOne['ended']).to.true
        expect( finalDataChainTwo['ended']).to.true

    })
     

})
