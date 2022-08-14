import { useMemo, useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import ERC721ABI from "../abi/ERC721.json";
import { NFT_MARKETPLACE } from "../constants";
import { useWeb3React } from "@web3-react/core"; 


export const useERC721 = (address, account, library) => {

  const { chainId } = useWeb3React()

  const erc721Contract = useMemo(() => {
    if (!account || !address || !library || !ethers.utils.isAddress(address)) {
      return;
    }
    return new ethers.Contract(address, ERC721ABI, library.getSigner());
  }, [account, address, library]);

  const [balance, setBalance] = useState(0);
  const [name, setName] = useState("--");
  const [symbol, setSymbol] = useState("--");
  const [owner, setOwner] = useState("--")

  const getIsApprovedForAll = useCallback(
    async (address) => {
      try {
        const result = await erc721Contract.isApprovedForAll(account, address);
        return result;
      } catch (e) {
        // console.log(e);
        return 0;
      }
    },
    [erc721Contract, account]
  );

  const setApproveForAll = useCallback(
    async (address) => {
      try {
        await erc721Contract.setApprovalForAll(address, true);
      } catch (e) {
        // console.log(e);
        return 0;
      }
    },
    [erc721Contract, account]
  );

  const getBalance = useCallback(async () => {
    try {
      const result = await erc721Contract.balanceOf(account);
      return result.toString();
    } catch (e) {
      // console.log(e);
      return 0;
    }
  }, [erc721Contract, account]);

  const getName = useCallback(async () => {
    try {
      const result = await erc721Contract.name();
      return result;
    } catch (e) {
      // console.log(e);
      return "";
    }
  }, [erc721Contract, account]);

  const getOwner = useCallback(async () => {
    try {
      const result = await erc721Contract.owner();
      return result;
    } catch (e) {
      // console.log(e);
      return "";
    }
  }, [erc721Contract, account]);

  const getSymbol = useCallback(async () => {
    try {
      const result = await erc721Contract.symbol();
      return result;
    } catch (e) {
      // console.log(e);
      return "";
    }
  }, [erc721Contract, account]);

  const isApproved = useCallback(async () => {
    try {
      const { contractAddress } = NFT_MARKETPLACE.find(item => item.chainId === chainId)
      return (await erc721Contract.isApprovedForAll(account, contractAddress))
    } catch (e) {
      return false;
    }
  }, [erc721Contract, account, chainId]);

  const approve = useCallback(async () => {
    try {

      if (await isApproved()) {
        return
    }

      const { contractAddress } = NFT_MARKETPLACE.find(item => item.chainId === chainId)
      const tx = await erc721Contract.setApprovalForAll(contractAddress, true)
      await tx.wait()
    } catch (e) {
      return false;
    }
  }, [erc721Contract, account, chainId]);

  useEffect(() => {
    erc721Contract && getBalance().then(setBalance);
    erc721Contract && getName().then(setName);
    erc721Contract && getSymbol().then(setSymbol);
    erc721Contract && getOwner().then(setOwner);
  }, [account, erc721Contract]);

  return {
    balance,
    name,
    symbol,
    getIsApprovedForAll,
    setApproveForAll,
    getBalance,
    isApproved,
    approve,
    owner,
  };
};
