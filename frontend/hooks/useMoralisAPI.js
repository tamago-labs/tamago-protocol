import { MAINNET_CHAINS, SUPPORT_CHAINS, TESTNET_CHAINS } from "../constants";
 import useOrder from "./useOrder";
import Moralis from "moralis";

const useMoralisAPI = () => {
 

    const resolveChainName = (chainId) => {
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

    const resolveOrderCreatedTable = (chainId) => {
        return `${resolveChainName(chainId)}OrderCreated`
    }

    const resolveSwappedTable = (chainId) => {
        return `${resolveChainName(chainId)}Swapped`
    }

    const resolveCanceledTable = (chainId) => {
        return `${resolveChainName(chainId)}Canceled`
    }

    const resolveClaimedTable = (chainId) => {
        return `${resolveChainName(chainId)}Claimed`
    }

    const generateMoralisParams = (chainId) => {
        if (TESTNET_CHAINS.indexOf(chainId) !== -1) {
            return {
                serverUrl: process.env.MORALIS_TESTNET_SERVER_URL,
                appId: process.env.MORALIS_TESTNET_APP_ID,
                masterKey: process.env.MORALIS_TESTNET_MASTER_KEY
            }
        }
        if (MAINNET_CHAINS.indexOf(chainId) !== -1) {
            return {
                serverUrl: process.env.MORALIS_MAINNET_SERVER_URL,
                appId: process.env.MORALIS_MAINNET_APP_ID,
                masterKey: process.env.MORALIS_MAINNET_MASTER_KEY
            }
        }
        throw new Error("Chain isn't supported")
    }

    return {
        generateMoralisParams,
        resolveChainName,
        resolveOrderCreatedTable,
        resolveSwappedTable,
        resolveCanceledTable,
        resolveClaimedTable
    }

}

export default useMoralisAPI