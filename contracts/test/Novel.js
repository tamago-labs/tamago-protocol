

const { expect } = require("chai")
const { ethers } = require("hardhat")
const { MerkleTree } = require('merkletreejs')
const keccak256 = require("keccak256")
const { shuffle, randomWords, fromUsdc, toUsdc, toEther } = require("./Helpers")

let novel

let admin
let alice
let bob
let charlie

let mockUsdc


describe("Artwork", () => {

    beforeEach(async () => {

        [admin, alice, bob, charlie] = await ethers.getSigners();

        const Novel = await ethers.getContractFactory("Novel");
        const MockERC20 = await ethers.getContractFactory("MockERC20")

        novel = await Novel.deploy(ethers.constants.AddressZero, ethers.constants.AddressZero)
        mockUsdc = await MockERC20.deploy("Mock USDC", "USDC", 6)
    })

    it("Alice tokenizes an NFT and sell to Bob for 100 USDC", async function () {

        // Prepare ERC-20 for Bob
        await mockUsdc.connect(bob).faucet()

        await novel.connect(alice).authorise(
            "https://api.cryptokitties.co/kitties/{id}",
            100,
            mockUsdc.address,
            toUsdc(100)
        )

        const owner = await novel.tokenOwners(1)
        expect(owner).to.equal(alice.address)

        // checking prices
        const prices = await novel.tokenPrice(1)
        expect(prices[0]).to.equal(mockUsdc.address)
        expect(prices[1]).to.equal(toUsdc(100))

        await mockUsdc.connect(bob).approve(novel.address, ethers.constants.MaxUint256)

        await novel.connect(bob).mint(
            bob.address,
            1,
            1,
            "0x00"
        )

        expect(await novel.balanceOf(bob.address, 1)).to.equal(1)
        expect(`${await mockUsdc.balanceOf(bob.address)}`).to.equal("9900000000")

    })

    it("Alice tokenizes an NFT and sell to Bob for 1 ETH", async function () {

        await novel.connect(alice).authorise(
            "https://api.cryptokitties.co/kitties/{id}",
            100,
            "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            toEther(1)
        )

        const owner = await novel.tokenOwners(1)
        expect(owner).to.equal(alice.address)

        // checking prices
        const prices = await novel.tokenPrice(1)
        expect(prices[0]).to.equal("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE")
        expect(prices[1]).to.equal(toEther(1))

        await novel.connect(bob).mintWithEth(
            bob.address,
            1,
            1,
            "0x00", {
            value: toEther(1)
        })

        expect(await novel.balanceOf(bob.address, 1)).to.equal(1)

    })

    it("Reveal content", async function () {

        const originalText = "this is a content"

        const words = originalText.split(/(\s+)/);
        const orignalLength = words.length

        const shuffled = shuffle(words.concat(randomWords))

        const leaves = words.map((item, index) => ethers.utils.keccak256(ethers.utils.solidityPack(["bool", "uint256", "string"], [true, index, item]))) // always true, index, word
        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
        const root = tree.getHexRoot()

        await novel.connect(alice).authorise(
            "https://api.cryptokitties.co/kitties/{id}",
            100,
            "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            toEther(1)
        )

        const owner = await novel.tokenOwners(1)
        expect(owner).to.equal(alice.address)

        // set content
        await novel.connect(alice).setPages(
            1,
            0,
            [root, root, root],
            [1, 2, 3]
        )

        for (let i = 0; i < 3; i++) {

            const pageRoot = await novel.getPageRoot(1, i)
            expect(root).to.equal(pageRoot)
            const pageArtwork = await novel.getPageArtwork(1, i)
            expect(Number(pageArtwork) - 1).to.equal(i)

            if (i === 0) {
                let recovered = ""

                for (let x = 0; x < orignalLength; x++) {
                    for (let y = 0; y < shuffled.length; y++) {
                        const proof = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack(["bool", "uint256", "string"], [true, x, shuffled[y]])))
                        const output = await novel.connect(alice).reveal(proof, 1, 0, x, shuffled[y])
                        if (output === true) {
                            recovered += shuffled[y]
                            break
                        }
                    }
                }

                expect(recovered).to.equal("this is a content")
            }

        }

    })


})