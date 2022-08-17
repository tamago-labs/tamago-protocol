const { ethers } = require("ethers")

const Moralis = require("moralis/node")

const { NFT_MARKETPLACE, SUPPORT_CHAINS, VALIDATOR_ADDRESS } = require("../constants")
const { MARKETPLACE_ABI } = require("../abi")
const { resolvePartialSwappedTable } = require("../helper")

const axios = require("axios")

// generate claim tickets for buyers and sellers
class Tickets {

    CLAIMS = []

    constructor({
        logger,
        providers,
        messages,
        orders
    }) {

        this.logger = logger
        this.providers = providers

        this.messages = messages
        this.orders = orders

    }

    async update() {
        this.CLAIMS = []

        this.logger.debug("Generate claim tickets for buyers...")

        await this.generateBuyerTickets()

        this.logger.debug("Generate claim tickets for sellers...")

        await this.generateSellerTickets()

    }

    async generateSellerTickets() {

        let claims = []
        let partialOrders = []

        // stores all partial orders in the array
        for (let chainId of SUPPORT_CHAINS) {
            await Moralis.start(this.generateMoralisParams(chainId));

            const PartialSwaps = Moralis.Object.extend(`Gateway${this.resolveChainName(chainId)}PartialSwapped`);
            const query = new Moralis.Query(PartialSwaps);

            query.limit(1000)

            const results = await query.find();
            for (let object of results) {
                const orderId = object.get("cid")
                const fromAddress = object.get("fromAddress")

                partialOrders.push({
                    orderId: (orderId),
                    fromAddress,
                    chainId
                })
            }

            // check claim events
            const Claimed = Moralis.Object.extend(`Gateway${this.resolveChainName(chainId)}Claimed`);
            const queryClaim = new Moralis.Query(Claimed);

            queryClaim.equalTo("isOriginChain", false)
            queryClaim.limit(1000);

            const claimItems = await queryClaim.find();

            let claimCompleted = [];

            for (let object of claimItems) {
                const cid = object.get("cid")
                claimCompleted.push(cid);
            }

            partialOrders = partialOrders.filter((item) => claimCompleted.indexOf(item.orderId) === -1);
        }
 
        for (let chainId of SUPPORT_CHAINS) {

            await Moralis.start(this.generateMoralisParams(chainId));

            // checking claim events
            const Claims = Moralis.Object.extend(`Gateway${this.resolveChainName(chainId)}Claimed`);
            const query = new Moralis.Query(Claims);
            query.equalTo("isOriginChain", true)
            query.limit(1000)

            const results = await query.find();

            // looking for unclaimed orders
            for (let object of results) {

                const orderId = object.get("cid")
                const fromAddress = object.get("fromAddress")

                const { data } = await axios.get(
                    `https://${orderId}.ipfs.nftstorage.link/`
                );

                const originalItem = data
                    
                if (originalItem && originalItem.barterList.length > 0) {

                    const list = originalItem.barterList.sort(function (a, b) {
                        return b.chainId - a.chainId;
                    });

                    for (let pairItem of list) {

                        const partialOrdersOnThisChain = partialOrders.filter(item => (Number(item.chainId) === Number(pairItem.chainId)) && ((item.orderId) === (orderId)))

                        if (partialOrdersOnThisChain.length > 0) {
                            const partialClaimedOrder = partialOrdersOnThisChain.find(item => (item.fromAddress).toLowerCase() === fromAddress.toLowerCase())
                            if (partialClaimedOrder) {
                                // granting a ticket for the seller
                                claims.push({
                                    orderId: (orderId),
                                    chainId: pairItem.chainId,
                                    fromAddress :  (originalItem.ownerAddress).toLowerCase(),
                                    claimerAddress: VALIDATOR_ADDRESS,
                                    isOrigin: false
                                })
                            }
                        }


                    }
                }
            }
        }

        // remove duplicates
        claims = claims.reduce((output, item) => {
            const existing = output.find(x => x.hash === (ethers.utils.hashMessage(JSON.stringify(item))))
            if (!existing) {
                output.push({
                    ...item,
                    hash: ethers.utils.hashMessage(JSON.stringify(item))
                })
            }
            return output
        }, [])

        this.logger.debug("Total seller claims : ", claims.length)

        this.CLAIMS = this.CLAIMS.concat(claims)

    }

    async generateBuyerTickets() {

        let claims = []

        for (let chainId of SUPPORT_CHAINS) {

            await Moralis.start(this.generateMoralisParams(chainId));

            const PartialSwaps = Moralis.Object.extend(`${resolvePartialSwappedTable(chainId)}`);
            const query = new Moralis.Query(PartialSwaps);

            query.limit(1000)

            const results = await query.find();

            for (let object of results) {
                const orderId = object.get("cid")
                const fromAddress = object.get("fromAddress")

                const orderItem = this.orders.find(item => item.cid === (orderId))

                // if not means the original asset is already claimed
                if (orderItem) {
                    claims.push({
                        orderId: (orderId),
                        chainId: orderItem.chainId,
                        claimerAddress: VALIDATOR_ADDRESS,
                        fromAddress,
                        isOrigin: true,
                        assetAddress: orderItem.assetAddress
                    })
                }
            }

        }

        this.logger.debug("Total buyer claims : ", claims.length)

        this.CLAIMS = this.CLAIMS.concat(claims)
    }

    generateMoralisParams(chainId) {
        if ([42, 80001, 97, 43113].indexOf(chainId) !== -1) {
            return {
                serverUrl: process.env.MORALIS_TESTNET_SERVER_URL,
                appId: process.env.MORALIS_TESTNET_APP_ID,
                masterKey: process.env.MORALIS_TESTNET_MASTER_KEY
            }
        }
        if ([56, 137, 43114, 1].indexOf(chainId) !== -1) {
            return {
                serverUrl: process.env.MORALIS_MAINNET_SERVER_URL,
                appId: process.env.MORALIS_MAINNET_APP_ID,
                masterKey: process.env.MARALIS_MAINNET_MASTER_KEY
            }
        }
        throw new Error("Chain isn't supported")
    }

    resolveClaimTable(chainId) {
        switch (chainId) {
            case 97:
                return "bnbTestnetClaim"
            case 42:
                return "kovanTestnetClaim"
            case 80001:
                return "mumbaiTestnetClaim"
            case 43113:
                return "fujiTestnetClaim"
            case 56:
                return "bnbClaim"
            case 137:
                return "polygonClaim"
            case 43114:
                return "avaxClaim"
            case 1:
                return "ethClaim"
        }
    }

    resolveChainName(chainId) {
        switch (chainId) {
            case 97:
                return "bnbTestnet"
            case 42:
                return "kovanTestnet"
            case 80001:
                return "mumbaiTestnet"
            case 43113:
                return "fujiTestnet"
            case 56:
                return "bnb"
            case 137:
                return "polygon"
            case 43114:
                return "avax"
            case 1:
                return "eth"
        }
    }

    getClaims() {
        return this.CLAIMS
    }

}

module.exports = {
    Tickets
}