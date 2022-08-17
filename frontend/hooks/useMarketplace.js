import { useState, useCallback } from "react";
import { useMoralisWeb3Api } from "react-moralis";
import { useWeb3React } from "@web3-react/core";
import axios from "axios";
import { ethers } from "ethers";
import Moralis from "moralis";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import {
    NFT_MARKETPLACE,
    NFT_GATEWAY,
    MOCK_NFT,
    NFT_STORAGE_TOKEN,
    ERC20_TOKENS,
} from "../constants";
import MarketplaceABI from "../abi/marketplace.json";
import NFTABI from "../abi/nft.json";
import ERC20ABI from "../abi/erc20.json";
import { NFTStorage } from "nft.storage";
import useMoralisAPI from "./useMoralisAPI";
import { getProviders } from "../helper";
import COLLECTIONS from "../data/collections"
import useCoingecko from "./useCoingecko";
import useOrder from "./useOrder"

const useMarketplace = () => {

    if (typeof window !== "undefined") {
        window.Buffer = window.Buffer || require("buffer").Buffer;
    }
    
    const { getAllOrders } = useOrder()

    const Web3Api = useMoralisWeb3Api();

    const context = useWeb3React();
    const { generateMoralisParams, resolveOrderCreatedTable, resolveSwappedTable, resolveCanceledTable } = useMoralisAPI()

    const { chainId, account, library } = context;

    const getAllMainnetOrders = useCallback(async () => {
        
    }, [])

    const getAllTestnetOrders = useCallback(async () => {
        
    }, [])

    return {
        getAllMainnetOrders,
        getAllTestnetOrders
    }
}

export default useMarketplace