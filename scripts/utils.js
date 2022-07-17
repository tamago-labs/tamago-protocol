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
        case 43114:
            return "avax"
        case 1:
            return "eth"
    }
}

exports.generateMoralisParams = (chainId) => {
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

exports.swapABI = {
    "anonymous": false,
    "inputs": [
        {
            "indexed": false,
            "internalType": "string",
            "name": "cid",
            "type": "string"
        },
        {
            "indexed": true,
            "internalType": "address",
            "name": "fromAddress",
            "type": "address"
        }
    ],
    "name": "Swapped",
    "type": "event"
}

exports.orderCreatedABI = {
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "string",
            "name": "cid",
            "type": "string"
        },
        {
            "indexed": false,
            "internalType": "address",
            "name": "assetAddress",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
        },
        {
            "indexed": false,
            "internalType": "enum Marketplace.TokenType",
            "name": "tokenType",
            "type": "uint8"
        },
        {
            "indexed": false,
            "internalType": "bytes32",
            "name": "root",
            "type": "bytes32"
        }
    ],
    "name": "OrderCreated",
    "type": "event"
}