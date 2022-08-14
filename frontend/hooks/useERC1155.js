import { useMemo, useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import ERC1155ABI from "../abi/ERC1155.json";
import { NFT_MARKETPLACE } from "../constants";
import { useWeb3React } from "@web3-react/core";

export const useERC1155 = (address, account, library) => {

  const { chainId } = useWeb3React()

  const erc1155Contract = useMemo(() => {
    if (!account || !address || !library) {
      return;
    }
    return new ethers.Contract(address, ERC1155ABI, library.getSigner());
  }, [account, address, library]);

  const allowance = useCallback(
    async (address) => {
      return await erc1155Contract.isApprovedForAll(account, address);
    },
    [erc1155Contract, account]
  );

  const setApproval = useCallback(
    async (address) => {
      return await erc1155Contract.setApprovalForAll(address, true);
    },
    [erc1155Contract, account]
  );

  const getTokenBalanceId = useCallback(
    async (id) => {
      try {
        return await erc1155Contract.balanceOf(account, id);
      } catch (e) {
        console.log(e);
        return Promise.reject(e.message);
      }
    },
    [erc1155Contract, account]
  );

  const safeTransferNFT = useCallback(
    async (to, id, amount) => {
      return await erc1155Contract.safeTransferFrom(
        account,
        to,
        id,
        amount,
        ethers.utils.formatBytes32String("")
      );
    },
    [erc1155Contract, account]
  );

  const isApproved = useCallback(async () => {
    try {
      const { contractAddress } = NFT_MARKETPLACE.find(item => item.chainId === chainId)
      console.log((await erc1155Contract.isApprovedForAll(account, contractAddress)))
      return (await erc1155Contract.isApprovedForAll(account, contractAddress))
    } catch (e) {
      return false;
    }
  }, [erc1155Contract, account, chainId]);

  const approve = useCallback(async () => {
    try {

      if (await isApproved()) {
        return
      }

      const { contractAddress } = NFT_MARKETPLACE.find(item => item.chainId === chainId)
      const tx = await erc1155Contract.setApprovalForAll(contractAddress, true)
      await tx.wait()
    } catch (e) {
      return false;
    }
  }, [erc1155Contract, account, chainId]);

  useEffect(() => { }, [account, erc1155Contract]);

  return { isApproved, approve, allowance, setApproval, getTokenBalanceId, safeTransferNFT };
};
