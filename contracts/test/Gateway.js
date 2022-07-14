const { expect } = require("chai")

let gateway
let admin
let relayer
let validator

describe("Gateway contract", () => {

    beforeEach(async () => {
        [admin, relayer, validator] = await ethers.getSigners()

        const Gateway = await ethers.getContractFactory("Gateway")

        gateway = await Gateway.deploy( 1)

        await gateway.connect(admin).grant(relayer.address, 2)
        await gateway.connect(admin).grant(validator.address, 3)
    })

    it("basic gateway functions", async () => {

        const messages = ["orange", "banana", "strawberry"]

        // attaches 3 messages
        for (let message of messages) {
            await gateway.connect(relayer).updateRelayMessage(ethers.utils.formatBytes32String(message))
            await gateway.connect(validator).updateClaimMessage(ethers.utils.formatBytes32String(message))
        }

        expect( await gateway.relayMessageCount()).to.equal(3)
        expect( await gateway.claimMessageCount()).to.equal(3)

        expect( await gateway.claimRoot()).to.equal(ethers.utils.formatBytes32String("strawberry"))
        expect( await gateway.relayRoot()).to.equal(ethers.utils.formatBytes32String("strawberry"))

    })



})
