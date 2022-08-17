const { default: axios } = require("axios");
const { ethers } = require("ethers");

const Moralis = require("moralis/node")

exports.delay = (timer) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, timer * 1000)
    })
}

exports.getProvider = (rpcUrl) => {
    return new ethers.providers.JsonRpcProvider(rpcUrl)
}

const getRandomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

exports.getProviders = (chainIds = []) => {
    return chainIds.map(chainId => {

        let url

        if (chainId === 42) {
            url = "https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
        } else if (chainId === 25) {
            url = "https://evm.cronos.org"
        } else if (chainId === 137) {
            url = "https://nd-643-057-168.p2pify.com/2ffe10d04df48d14f0e9ff6e0409f649"
        } else if (chainId === 80001) {
            url = "https://rpc-mumbai.maticvigil.com"
        } else if (chainId === 97) {
            url = getRandomItem(["https://data-seed-prebsc-1-s1.binance.org:8545", "https://data-seed-prebsc-2-s1.binance.org:8545"])
        } else if (chainId === 56) {
            url = getRandomItem(["https://bsc-dataseed1.binance.org", "https://bsc-dataseed2.binance.org", "https://bsc-dataseed3.binance.org", "https://bsc-dataseed4.binance.org"])
        } else if (chainId === 43113) {
            url = "https://nd-473-270-876.p2pify.com/613a7805f3d64a52349b6ca19b6e27a7/ext/bc/C/rpc"
        } else if (chainId === 43114) {
            url = "https://nd-752-163-197.p2pify.com/fd84ccbd64f32d8f8a99adb5d4557b0e/ext/bc/C/rpc"
        } else if (chainId === 1) {
            url = "https://nd-814-913-142.p2pify.com/cb3fe487ef9afa11bda3c38e54b868a3"
        }

        if (!url) {
            return
        }

        const provider = new ethers.providers.JsonRpcProvider(url)

        return {
            chainId,
            provider
        }
    })
}


exports.getRelayerKey = () => {
    return process.env.RELAYER_KEY
}

exports.getValidatorKey = () => {
    return process.env.VALIDATOR_KEY
}

exports.generateRelayMessages = (items = []) => {
    return items.reduce((output, item) => {
        const { barterList, chainId, cid } = item

        if (barterList && chainId && barterList.length > 0) {
            for (let item of barterList) {
                // filter non-cross-chain items
                if (item.chainId !== chainId) {
                    output.push({
                        cid,
                        chainId: item.chainId,
                        assetAddress: item.assetAddress,
                        assetTokenIdOrAmount: item.assetTokenIdOrAmount
                    })
                }
            }
        }

        return output
    }, [])
}


exports.getGasPrices = async (chainId) => {
    let BASE_GAS = 5 // 5 GWEI
    let gasLimit = 100000

    if ([43113].includes(chainId)) {
        BASE_GAS = 27
        gasLimit = 200000
    }

    if ([97, 80001].includes(chainId)) {
        BASE_GAS = 10
        gasLimit = 200000
    }

    try {

        let url

        switch (chainId) {
            case 1:
                url = "https://owlracle.info/eth/gas?apikey=cf72e23d385a45639f67e89094cf8eab"
                break
            case 137:
                url = "https://owlracle.info/poly/gas?apikey=cf72e23d385a45639f67e89094cf8eab"
                break
            case 43114:
                url = "https://owlracle.info/avax/gas?apikey=cf72e23d385a45639f67e89094cf8eab"
                break
        }

        if (url) {
            const { data } = await axios.get(url)

            BASE_GAS = Math.ceil(data.speeds[1].gasPrice)
            gasLimit = BASE_GAS * 10000
        }

    } catch (e) {
        console.log(e)
    }

    return {
        BASE_GAS,
        gasLimit
    }
}


exports.resolveChainName = (chainId) => {
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
        case 25:
            return "cronos"
        case 43114:
            return "avax"
        case 1:
            return "eth"
    }
}

exports.resolveOrderCreatedTable = (chainId) => {
    return `Gateway${this.resolveChainName(chainId)}OrderCreated`
}

exports.resolveSwappedTable = (chainId) => {
    return `Gateway${this.resolveChainName(chainId)}Swapped`
}

exports.resolveCanceledTable = (chainId) => {
    return `Gateway${this.resolveChainName(chainId)}Canceled`
}

exports.resolveClaimedTable = (chainId) => {
    return `Gateway${this.resolveChainName(chainId)}Claimed`
}

exports.resolvePartialSwappedTable = (chainId) => {
    return `Gateway${this.resolveChainName(chainId)}PartialSwapped`
}

exports.generateMoralisParams = (chainId) => {

    // FIXME : Remove from here
    // if (TESTNET_CHAINS.indexOf(chainId) !== -1) {
    //     return {
    //         serverUrl: process.env.MORALIS_TESTNET_SERVER_URL,
    //         appId: process.env.MORALIS_TESTNET_APP_ID,
    //         masterKey: process.env.MORALIS_TESTNET_MASTER_KEY
    //     }
    // }
    // if (MAINNET_CHAINS.indexOf(chainId) !== -1) {
    //     return {
    //         serverUrl: process.env.MORALIS_MAINNET_SERVER_URL,
    //         appId: process.env.MORALIS_MAINNET_APP_ID,
    //         masterKey: process.env.MORALIS_MAINNET_MASTER_KEY
    //     }
    // }
    // throw new Error("Chain isn't supported")

    return {
        serverUrl: process.env.MORALIS_TESTNET_SERVER_URL,
        appId: process.env.MORALIS_TESTNET_APP_ID,
        masterKey: process.env.MORALIS_TESTNET_MASTER_KEY
    }
}


exports.getAllOrders = async (chainId) => {

    await Moralis.start(this.generateMoralisParams(chainId));

    // checking gateway contracts
    let output = []

    try {

        const OrderCreated = Moralis.Object.extend(
            `${this.resolveOrderCreatedTable(chainId)}`
        );
        const query2 = new Moralis.Query(OrderCreated);

        query2.limit(1000);

        const results2 = await query2.find();

        for (let object of results2) {
            const cid = object.get("cid");
            const timestamp = object.get("block_timestamp");
            const assetAddress = object.get("assetAddress");
            const owner = object.get("owner");
            const tokenId = object.get("tokenId");
            const tokenType = object.get("tokenType");

            output.push({
                cid,
                timestamp,
                assetAddress,
                owner,
                tokenId,
                tokenType: Number(tokenType),
                chainId
            });
        }

        if (results2.length > 0) {

            // check swap events
            const Swapped2 = Moralis.Object.extend(`${this.resolveSwappedTable(chainId)}`);
            const querySwap2 = new Moralis.Query(Swapped2);

            querySwap2.limit(1000);

            const swapItems2 = await querySwap2.find();

            let swapCompleted2 = [];

            for (let object of swapItems2) {
                const cid = object.get("cid");
                swapCompleted2.push(cid);
            }

            output = output.filter((item) => swapCompleted2.indexOf(item.cid) === -1);

            // check cancel events
            const Canceled2 = Moralis.Object.extend(`${this.resolveCanceledTable(chainId)}`);
            const queryCanceled2 = new Moralis.Query(Canceled2);

            queryCanceled2.limit(1000)

            const cancelItems2 = await queryCanceled2.find();

            let cancelCompleted2 = []

            for (let object of cancelItems2) {
                const cid = object.get("cid")
                cancelCompleted2.push(cid)
            }

            output = output.filter(item => cancelCompleted2.indexOf(item.cid) === -1)

            // check claim events
            const Claimed = Moralis.Object.extend(`${this.resolveClaimedTable(chainId)}`);
            const queryClaim = new Moralis.Query(Claimed);

            queryClaim.limit(1000);

            const claimItems = await queryClaim.find();

            let claimCompleted = [];

            for (let object of claimItems) {
                const cid = object.get("cid");
                claimCompleted.push(cid);
            }

            output = output.filter((item) => claimCompleted.indexOf(item.cid) === -1);

        }


    } catch (e) {
        console.error(e)
    }


    return output.sort(function (a, b) {
        return b.timestamp - a.timestamp;
    });

}



