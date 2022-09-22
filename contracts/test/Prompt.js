const { expect } = require("chai")
const { ethers } = require("hardhat")
const { MerkleTree } = require('merkletreejs')
const keccak256 = require("keccak256")
const { shuffle, randomWords } = require("./Helpers")

let prompt

let admin
let alice
let bob
let charlie

describe("Prompt", () => {

    beforeEach(async () => {

        [admin, alice, bob, charlie] = await ethers.getSigners();

        const Prompt = await ethers.getContractFactory("Prompt");

        prompt = await Prompt.deploy()

    })

    it("Alice reserves a slot and mint NFTs to Bob", async function () {

        await prompt.connect(alice).authorise("https://api.cryptokitties.co/kitties/{id}", ethers.utils.formatBytes32String(""), 100)

        const owner = await prompt.tokenOwners(1)
        expect(owner).to.equal(alice.address)

        try {
            await prompt.mint(alice.address, 1, 100, "0x00")
        } catch (e) {
            expect((e.message).indexOf("Not authorised to mint") !== -1).to.true
        }

        await prompt.connect(alice).mint(bob.address, 1, 100, "0x00")

        expect(await prompt.balanceOf(bob.address, 1)).to.equal(100)
    })

    it("Shuffling simple prompt and revealing by NFT holders", async function () {

        const originalText = "interior of a glass greenhouse, overgrown with moss and plants, hyper realism, intricate detail"

        const words = originalText.split(/(\s+)/);
        const orignalLength = words.length

        const shuffled = shuffle(words.concat(randomWords))

        const leaves = words.map((item, index) => ethers.utils.keccak256(ethers.utils.solidityPack(["bool", "uint256", "string"], [true, index, item]))) // always true, index, word
        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
        const root = tree.getHexRoot()

        await prompt.connect(alice).authorise("https://api.cryptokitties.co/kitties/{id}", root, 100)

        const owner = await prompt.tokenOwners(1)
        expect(owner).to.equal(alice.address)

        let recovered = ""

        for (let x = 0; x < orignalLength; x++) {
            for (let y = 0; y < shuffled.length; y++) {
                const proof = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack(["bool", "uint256", "string"], [true, x, shuffled[y]])))
                const output = await prompt.connect(alice).revealWord(proof, 1, x, shuffled[y])
                if (output === true) {
                    recovered += shuffled[y]
                    break
                }
            }
        }

        expect(recovered).to.equal("interior of a glass greenhouse, overgrown with moss and plants, hyper realism, intricate detail")
    })

    it("Shuffling long prompt and revealing by NFT holders", async function () {

        const originalText = "https://i.mj.run/0acc14f8-0504-4b36-9a39-43248a81172b/0_3.png inside a fantasy terrarium solarium filled with fruit trees and climbing flower vines. There is a seat for one person. Outside the glass a star is exploding and there are colourful gases but it is safe and cozy inside the terrarium garden. Dr Who and Butterfly Gardens influence. Hyper realism. Intricate detail. Lovely lighting. Black light. Octane render. Artgerm. No blur. —ar 16:9"

        const words = originalText.split(/(\s+)/);
        const orignalLength = words.length

        const shuffled = shuffle(words.concat(randomWords))

        const leaves = words.map((item, index) => ethers.utils.keccak256(ethers.utils.solidityPack(["bool", "uint256", "string"], [true, index, item]))) // always true, index, word
        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
        const root = tree.getHexRoot()
        
        await prompt.connect(alice).authorise("https://api.cryptokitties.co/kitties/{id}", root, 100)

        const owner = await prompt.tokenOwners(1)
        expect(owner).to.equal(alice.address)

        let recovered = ""

        for (let x = 0; x < orignalLength; x++) {
            for (let y = 0; y < shuffled.length; y++) {
                const proof = tree.getHexProof(ethers.utils.keccak256(ethers.utils.solidityPack(["bool", "uint256", "string"], [true, x, shuffled[y]])))
                const output = await prompt.connect(alice).revealWord(proof, 1, x, shuffled[y])
                if (output === true) {
                    recovered += shuffled[y]
                    break
                }
            }
        }

        expect(recovered).to.equal(originalText)
    })

})