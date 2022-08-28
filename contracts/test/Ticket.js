const { expect } = require("chai")
const { ethers } = require("hardhat")

let ticket

let admin
let alice
let bob

describe("ERC1155", () => {

    before(async () => {

        [admin, alice, bob] = await ethers.getSigners();

        const Ticket = await ethers.getContractFactory("Ticket");

        ticket = await Ticket.deploy()

    })

    it("Alice reserves a slot and mint NFTs to Bob", async function () {

        await ticket.connect(alice).issue()

        const owner = await ticket.tokenOwners(1)

        expect(owner).to.equal(alice.address)

        try {
            await ticket.mint(alice.address, 1, 100, "0x00")
        } catch (e) {
            expect( (e.message).indexOf("Not authorised to mint") !== -1 ).to.true
        }

        await ticket.connect(alice).mint(bob.address, 1, 100, "0x00")

        expect(await ticket.balanceOf(bob.address, 1)).to.equal(100)

        // transfers some to Bob and Alice
        await ticket.connect(bob).safeTransferFrom(bob.address, alice.address, 1, 20, "0x00")
        // now lock the token
        await ticket.connect(alice).lock(1)

        try {
            await ticket.connect(bob).safeTransferFrom(bob.address, alice.address, 1, 20, "0x00")
        } catch (e) {
            expect( (e.message).indexOf("Not allow to be transfered") !== -1 ).to.true
        }

        // but Alice still can transfer
        await ticket.connect(alice).safeTransferFrom(alice.address, bob.address, 1, 20, "0x00")

        expect(await ticket.balanceOf(bob.address, 1)).to.equal(100)
    })

    // TODO : batch & burn


})