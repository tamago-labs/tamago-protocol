const { expect } = require("chai")
const { ethers } = require("hardhat")

let factory

let admin
let alice
let bob
let charlie

describe("NFT Factory", () => {

    beforeEach(async () => {

        [admin, alice, bob, charlie] = await ethers.getSigners();

        const NFTFactory = await ethers.getContractFactory("NFTFactory");

        factory = await NFTFactory.deploy()

    })

    it("Create ERC-721 contract", async function () {

        await factory.connect(alice).create("TEST", "TEST")

        const erc721Address = await factory.nfts(1)

        const erc721 = await ethers.getContractAt('ERC721TG', erc721Address)

        await erc721.connect(alice).mint(alice.address, 1, "https://api.cryptokitties.co/kitties/1")

        expect(await erc721.tokenURI(1)).to.equal("https://api.cryptokitties.co/kitties/1");
        expect(await erc721.ownerOf(1)).to.equal(alice.address);

        await erc721.connect(alice).transferFrom(alice.address, admin.address, 1)

        expect(await erc721.ownerOf(1)).to.equal(admin.address);
    })

    // it("Create ERC-1155 contract", async function () {

    //     await factory.connect(alice).createERC1155()

    //     const erc1155Address = await factory.nfts(1)

    //     const erc1155 = await ethers.getContractAt('ERC1155Template', erc1155Address)

    //     await erc1155.connect(alice).mint(alice.address, 1, 100, "0x00")

    //     await erc1155.connect(alice).setURI(1, "https://api.cryptokitties.co/kitties/1")
    //     expect(await erc1155.uri(1)).to.equal("https://api.cryptokitties.co/kitties/1");

    //     expect(await erc1155.balanceOf(alice.address, 1)).to.equal(100)

    //     await erc1155.connect(alice).safeTransferFrom(alice.address, bob.address, 1, 50, "0x00")

    //     expect(await erc1155.balanceOf(alice.address, 1)).to.equal(50)
    //     expect(await erc1155.balanceOf(bob.address, 1)).to.equal(50)
    // })



})