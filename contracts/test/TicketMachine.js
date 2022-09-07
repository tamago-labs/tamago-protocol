const { expect } = require("chai")
const { ethers } = require("hardhat")

let ticket

let admin
let alice
let bob
let charlie

describe("Ticket Machine", () => {

    beforeEach(async () => {

        [admin, alice, bob, charlie] = await ethers.getSigners();

        const Ticket = await ethers.getContractFactory("TicketMachine");

        ticket = await Ticket.deploy()

    })

    it("Alice reserves a slot and mint NFTs to Bob", async function () {

        await ticket.connect(alice).issue()

        const owner = await ticket.tokenOwners(1)

        expect(owner).to.equal(alice.address)

        try {
            await ticket.mint(alice.address, 1, 100, "0x00")
        } catch (e) {
            expect((e.message).indexOf("Not authorised to mint") !== -1).to.true
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
            expect((e.message).indexOf("Not allow to be transfered") !== -1).to.true
        }

        // but Alice still can transfer
        await ticket.connect(alice).safeTransferFrom(alice.address, bob.address, 1, 20, "0x00")

        expect(await ticket.balanceOf(bob.address, 1)).to.equal(100)
    })

    it("Admin reserves slots and mint NFTs in batch to Alice, Bob, Charlie", async function () {

        await ticket.connect(admin).issue()
        await ticket.connect(admin).issue()
        await ticket.connect(admin).issue()

        await ticket.connect(admin).mintBatch(alice.address, [1, 2], [100, 100], "0x00")
        await ticket.connect(admin).mintBatch(bob.address, [1, 2], [100, 100], "0x00")
        await ticket.connect(admin).mintBatch(charlie.address, [1, 2], [100, 100], "0x00")

        const owners = await ticket.tokenOwnersBatch([1,2,3])
        expect(owners[0]).to.equal(admin.address)
        expect(owners[1]).to.equal(admin.address)
        expect(owners[2]).to.equal(admin.address)

        const balances = await ticket.balanceOfBatch([alice.address, bob.address, charlie.address, alice.address, bob.address, charlie.address], [1, 1, 1, 2, 2, 2])

        expect(balances[0]).to.equal(100)
        expect(balances[1]).to.equal(100)
        expect(balances[2]).to.equal(100)
        expect(balances[3]).to.equal(100)
        expect(balances[4]).to.equal(100)
        expect(balances[5]).to.equal(100)

    })

    it("Customised mint to multiple accounts", async function () {

        await ticket.connect(admin).issue()

        await ticket.connect(admin).push([alice.address, bob.address, charlie.address], 1, 100)

        const balances = await ticket.balanceOfBatch([alice.address, bob.address, charlie.address], [1, 1, 1])

        expect(balances[0]).to.equal(100)
        expect(balances[1]).to.equal(100)
        expect(balances[2]).to.equal(100)

    })

})