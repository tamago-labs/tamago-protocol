import { useState, useCallback } from "react";
import { useMoralisWeb3Api } from "react-moralis";
import { useWeb3React } from "@web3-react/core";
import axios from "axios";
import { ethers } from "ethers";
import Moralis from "moralis"
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { NFT_MARKETPLACE, MOCK_NFT, NFT_STORAGE_TOKEN, ERC20_TOKENS } from "../constants";
import MarketplaceABI from "../abi/marketplace.json";
import NFTABI from "../abi/nft.json";
import ERC20ABI from "../abi/erc20.json";
import { NFTStorage } from 'nft.storage'
import useMoralisAPI from "./useMoralisAPI"
import { getProviders } from "../helper";
// import useProof from "./useProof"; 


window.Buffer = window.Buffer || require("buffer").Buffer;

const API_BASE = "https://asia-east2-sbc10x-hackatron-may2022.cloudfunctions.net/api"


const useOrder = () => {
  const Web3Api = useMoralisWeb3Api();

  const context = useWeb3React();
  const { generateMoralisParams, resolveOrderCreatedTable, resolveSwappedTable } = useMoralisAPI()

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
      await tx.wait()

    },
    [account, chainId, library]
  );

  const approveToken = useCallback(
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

      const tokenContract = new ethers.Contract(
        values.baseAssetAddress,
        ERC20ABI,
        library.getSigner()
      );

      if (
        (Number(await tokenContract.allowance(account, contractAddress)) === 0)
      ) {
        const tx = await tokenContract.approve(contractAddress, ethers.constants.MaxUint256);
        await tx.wait();
      }

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
        await tx.wait();
      }


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

  const getAllOrders = useCallback(async (chainId) => {

    await Moralis.start(generateMoralisParams(chainId));

    const OrderCreated = Moralis.Object.extend(`${resolveOrderCreatedTable(chainId)}`);
    const query = new Moralis.Query(OrderCreated);

    query.limit(1000)

    const results = await query.find();

    let output = []

    for (let object of results) {
      const cid = object.get("cid")
      const timestamp = object.get("block_timestamp")
      const assetAddress = object.get("assetAddress")
      const owner = object.get("owner")
      const tokenId = object.get("tokenId")
      const tokenType = object.get("tokenType")

      output.push({
        cid,
        timestamp,
        assetAddress,
        owner,
        tokenId,
        tokenType: Number(tokenType),
        chainId
      })

    }

    // check swap events
    const Swapped = Moralis.Object.extend(`${resolveSwappedTable(chainId)}`);
    const querySwap = new Moralis.Query(Swapped);

    querySwap.limit(1000)

    const swapItems = await querySwap.find();

    let swapCompleted = []

    for (let object of swapItems) {
      const cid = object.get("cid")
      swapCompleted.push(cid)
    }

    output = output.filter(item => swapCompleted.indexOf(item.cid) === -1)

    return output.sort(function (a, b) {
      return b.timestamp - a.timestamp;
    });

  }, [])

  const resolveMetadataFromCacheServer = ({
    assetAddress,
    tokenId,
    chainId,
  }) => {
    try {
      const mockCollections = MOCK_NFT[chainId];
      const mock = mockCollections.list.find(
        (item) => item.address.toLowerCase() === assetAddress.toLowerCase()
      );

      if (!mock.isERC721) {
        return {
          metadata: {
            name: mock.name,
            image: mock.image,
            description: mock.description || "",
          },
        };
      }
    } catch (e) { }

    return new Promise((resolve) => {
      axios
        .get(
          `${API_BASE}/nft/metadata/${assetAddress}/${tokenId}/0x${chainId.toString(
            16
          )}`
        )
        .then(({ data }) => {
          resolve(data);
        });

      setTimeout(() => {
        resolve();
      }, 3000);
    });
  };

  const resolveMetadata = async ({ assetAddress, tokenId, chainId }) => {
    const options = {
      address: `${assetAddress}`,
      token_id: `${tokenId}`,
      chain: `0x${chainId.toString(16)}`,
    };

    try {
      const data = await resolveMetadataFromCacheServer({
        assetAddress,
        tokenId,
        chainId,
      });

      if (data && data.metadata) {

        if (
          data.metadata &&
          data.metadata.image &&
          data.metadata.image.indexOf("ipfs://") !== -1
        ) {
          data.metadata.image = data.metadata.image.replaceAll(
            "ipfs://",
            "https://ipfs.infura.io/ipfs/"
          );
        }

        if (data.metadata && !data.metadata.image && data.metadata["image_url"]) {
          data.metadata.image = data.metadata["image_url"];
        }

        return data;
      }
    } catch (e) { }
    const tokenIdMetadata = await Web3Api.token.getTokenIdMetadata(options);
    return await getMetadata(tokenIdMetadata);
  };

  const resolveTokenValue = ({
    assetAddress,
    tokenId,
    chainId
  }) => {

    const token = (ERC20_TOKENS.find(
      (item) => item.chainId === chainId && item.contractAddress.toLowerCase() === assetAddress.toLowerCase() && item.tokenType === 0
    ))

    return `${ethers.utils.formatUnits(tokenId, token.decimals)} ${token.symbol} `
  }

  const swap = useCallback(
    async (orderId, order, tokenIndex) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      if (
        NFT_MARKETPLACE.filter((item) => item.chainId === order.chainId)
          .length === 0
      ) {
        throw new Error("Marketplace contract is not available on given chain");
      }

      const token = order.barterList[tokenIndex];

      if (chainId !== order.chainId) {
        throw new Error("Invalid chain");
      }

      const { contractAddress } = NFT_MARKETPLACE.find(
        (item) => item.chainId === order.chainId
      );

      const contract = new ethers.Contract(
        contractAddress,
        MarketplaceABI,
        library.getSigner()
      );

      if (token.tokenType === 0) {
        // erc20
        const tokenContract = new ethers.Contract(
          token.assetAddress,
          ERC20ABI,
          library.getSigner()
        );

        if (
          (
            await tokenContract.allowance(account, contractAddress)
          ).toString() === "0"
        ) {
          const tx = await tokenContract.approve(
            contractAddress,
            ethers.constants.MaxUint256
          );
          await tx.wait();
        }
      } else {
        // erc721 / 1155
        const nftContract = new ethers.Contract(
          token.assetAddress,
          NFTABI,
          library.getSigner()
        );

        if (
          (await nftContract.isApprovedForAll(account, contractAddress)) ===
          false
        ) {
          const tx = await nftContract.setApprovalForAll(contractAddress, true);
          await tx.wait();
        }
      }

      const leaves = order.barterList
        .filter((item) => item.chainId === chainId)
        .map((item) =>
          ethers.utils.keccak256(
            ethers.utils.solidityPack(
              ["string", "uint256", "address", "uint256"],
              [orderId, item.chainId, item.assetAddress, item.assetTokenIdOrAmount]
            )
          )
        );
      const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

      const proof = tree.getHexProof(
        ethers.utils.keccak256(
          ethers.utils.solidityPack(
            ["string", "uint256", "address", "uint256"],
            [orderId, token.chainId, token.assetAddress, token.assetTokenIdOrAmount]
          )
        )
      );

      return await contract.swap(
        orderId,
        token.assetAddress,
        token.assetTokenIdOrAmount,
        token.tokenType,
        proof
      );
    },
    [account, chainId, library]
  );

  const resolveStatus = async ({ orderId, chainId }) => {
    const providers = getProviders();

    const { provider } = providers.find((item) => item.chainId === chainId);

    const { contractAddress } = NFT_MARKETPLACE.find(
      (item) => item.chainId === chainId
    );

    const marketplaceContract = new ethers.Contract(
      contractAddress,
      MarketplaceABI,
      provider
    );

    const result = await marketplaceContract.orders(orderId);
    return result["ended"];
  };

  const getOrder = useCallback(async (orderId) => {
    const { data } = await axios.get(`https://${orderId}.ipfs.nftstorage.link/`)
    return data
  }, [])

  return {
    getMetadata,
    createOrder,
    approveNft,
    register,
    approveToken,
    getAllOrders,
    getOrder,
    resolveMetadata,
    resolveTokenValue,
    swap,
    resolveStatus
  };
};

export default useOrder;