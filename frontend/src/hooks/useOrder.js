import { useState, useCallback } from "react";
import { useMoralisWeb3Api } from "react-moralis";
import { useWeb3React } from "@web3-react/core";
import axios from "axios";
import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { NFT_MARKETPLACE, MOCK_NFT, NFT_STORAGE_TOKEN } from "../constants";
import MarketplaceABI from "../abi/marketplace.json";
import NFTABI from "../abi/nft.json";
import ERC20ABI from "../abi/erc20.json";
import { NFTStorage } from 'nft.storage'
// import { getProviders } from "../helper";
// import useProof from "./useProof";


window.Buffer = window.Buffer || require("buffer").Buffer;

const API_BASE = "https://asia-east2-sbc10x-hackatron-may2022.cloudfunctions.net/api"


const useOrder = () => {
  const Web3Api = useMoralisWeb3Api();

  const context = useWeb3React();

  // const { generateRelayMessages, generateValidatorMessages } = useProof();

  const { chainId, account, library } = context;

  const [tick, setTick] = useState(0);

  const increaseTick = useCallback(() => {
    setTick(tick + 1);
  }, [tick]);

  const getMetadata = async (nft) => {
    let metadata = JSON.parse(nft.metadata);

    // fetch from token uri
    if (!metadata && nft && nft.token_uri) {
      console.log("no metadata!");

      let uri = nft.token_uri.replaceAll(
        "000000000000000000000000000000000000000000000000000000000000000",
        ""
      );

      if (uri.indexOf("https://") === -1) {
        uri = `https://${uri}`;
      }

      if (uri.indexOf("{id}") !== -1) {
        uri = uri.replaceAll("{id}", nft.token_id);
      }

      try {
        // proxy
        const { data } = await axios.get(
          `https://slijsy3prf.execute-api.ap-southeast-1.amazonaws.com/stage/proxy/${uri}`
        );

        if (data && data.data) {
          metadata = data.data;
          if (!metadata["image"] && data.data["image_url"]) {
            metadata["image"] = data.data["image_url"];
          }
        }
      } catch (e) { }
    }

    if (
      metadata &&
      metadata.image &&
      metadata.image.indexOf("ipfs://") !== -1
    ) {
      metadata.image = metadata.image.replaceAll(
        "ipfs://",
        "https://ipfs.infura.io/ipfs/"
      );
    }

    if (metadata && !metadata.image && metadata["image_url"]) {
      metadata.image = metadata["image_url"];
    }

    return {
      ...nft,
      metadata,
    };
  };

  const register = useCallback(
    async (orderId, values) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      if (
        NFT_MARKETPLACE.filter((item) => item.chainId === values.chainId)
          .length === 0
      ) {
        throw new Error("Marketplace contract is not available on given chain");
      }

      if (chainId !== values.chainId) {
        throw new Error("Invalid chain");
      }

      const { contractAddress } = NFT_MARKETPLACE.find(
        (item) => item.chainId === values.chainId
      );

      const contract = new ethers.Contract(
        contractAddress,
        MarketplaceABI,
        library.getSigner()
      );

      const leaves = values.barterList
        .filter((item) => item.chainId === values.chainId)
        .map((item) =>
          ethers.utils.keccak256(
            ethers.utils.solidityPack(
              ["string", "uint256", "address", "uint256"],
              [`${orderId}`, Number(item.chainId), item.assetAddress, item.assetTokenIdOrAmount]
            )
          )
        );

      let tree;
      let hexRoot;

      if (leaves.length > 0) {
        tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

        hexRoot = tree.getHexRoot();
      } else {
        hexRoot = ethers.utils.formatBytes32String("");
      }

      const tx = await contract.create(
        orderId,
        values.baseAssetAddress,
        values.baseAssetTokenIdOrAmount,
        values.baseAssetTokenType,
        hexRoot
      );
      await tx.await()
      
    },
    [account, chainId, library]
  );

  const approveNft = useCallback(
    async (values) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      if (
        NFT_MARKETPLACE.filter((item) => item.chainId === values.chainId)
          .length === 0
      ) {
        throw new Error("Marketplace contract is not available on given chain");
      }

      if (chainId !== values.chainId) {
        throw new Error("Invalid chain");
      }

      const { contractAddress } = NFT_MARKETPLACE.find(
        (item) => item.chainId === values.chainId
      );

      const nftContract = new ethers.Contract(
        values.baseAssetAddress,
        NFTABI,
        library.getSigner()
      );

      if (
        (await nftContract.isApprovedForAll(account, contractAddress)) === false
      ) {
        const tx = await nftContract.setApprovalForAll(contractAddress, true);
        return await tx.wait();
      }

      return
    },
    [account, chainId, library]
  );

  const createOrder = useCallback(
    async (values) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      values.ownerAddress = account
      values.timestamp = Math.floor(new Date().valueOf() / 1000)

      const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })

      const str = JSON.stringify(values);
      // text/plain;UTF-8
      const blob = new Blob([str]);
      const cid = await client.storeBlob(blob)

      console.log("cid : ", cid)

      return {
        orderId: cid
      };
    },
    [account]
  );


  return {
    getMetadata,
    createOrder,
    approveNft,
    register
  };
};

export default useOrder;