const { expect } = require("chai")
const { ethers } = require("hardhat") 

let erc20
let erc721
let erc721_2
let erc1155
let erc1155_2

let admin
let alice
let bob

describe("ERC721", () => {

    before(async () => {

        [admin, alice, bob] = await ethers.getSigners();

        const MockERC721 = await ethers.getContractFactory("MockERC721");

        erc721 = await MockERC721.deploy("Mock NFT", "MOCK")

    })

    it("Checks NAME & SYMBOL", async function () {
        const name = await erc721.name();
        expect(name).to.equal("Mock NFT");

        const symbol = await erc721.symbol();
        expect(symbol).to.equal("MOCK");

    });

    it("Mints 3 NFTs", async function () {

        await erc721.mint(admin.address, 0)
        await erc721.mint(alice.address, 1)
        await erc721.mint(bob.address, 2)

        expect(await erc721.tokenURI(0)).to.equal("https://api.cryptokitties.co/kitties/0");
        expect(await erc721.tokenURI(1)).to.equal("https://api.cryptokitties.co/kitties/1");
        expect(await erc721.tokenURI(2)).to.equal("https://api.cryptokitties.co/kitties/2");

        expect(await erc721.ownerOf(0)).to.equal(admin.address);
        expect(await erc721.ownerOf(1)).to.equal(alice.address);
        expect(await erc721.ownerOf(2)).to.equal(bob.address);

    });

    it("Transfers them all to Admin", async function () {

        await erc721.connect(alice).transferFrom(alice.address, admin.address, 1)
        await erc721.connect(bob).transferFrom(bob.address, admin.address, 2)

        expect(await erc721.balanceOf(admin.address)).to.equal(3)

        expect(await erc721.ownerOf(1)).to.equal(admin.address);
        expect(await erc721.ownerOf(2)).to.equal(admin.address);
    })

})

describe("ERC1155", () => {

    before(async () => {

        [admin, alice, bob] = await ethers.getSigners();

        const MockERC1155 = await ethers.getContractFactory("MockERC1155");

        erc1155 = await MockERC1155.deploy("https://api.cryptokitties.co/kitties/{id}")

    })

    it("Mints 100 Tokens /w the same id", async function () {

        await erc1155.mint(admin.address, 0, 100, "0x00")

        expect(await erc1155.balanceOf(admin.address, 0)).to.equal(100)

        // transfers some to Alice and Bob
        await erc1155.safeTransferFrom(admin.address, alice.address, 0, 50, "0x00")
        await erc1155.safeTransferFrom(admin.address, bob.address, 0, 50, "0x00")

        expect(await erc1155.balanceOf(admin.address, 0)).to.equal(0)
        expect(await erc1155.balanceOf(alice.address, 0)).to.equal(50)
        expect(await erc1155.balanceOf(bob.address, 0)).to.equal(50)
    })

    it("Mints batch 3 ids with 100 tokens each", async function () {

        await erc1155.mintBatch(admin.address, [1, 2, 3], [100, 100, 100], "0x00")

        expect(await erc1155.balanceOf(admin.address, 1)).to.equal(100)
        expect(await erc1155.balanceOf(admin.address, 2)).to.equal(100)
        expect(await erc1155.balanceOf(admin.address, 3)).to.equal(100)

    })


})