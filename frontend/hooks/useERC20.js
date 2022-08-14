import { useMemo, useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import ERC20ABI from "../abi/erc20.json"
import { NFT_MARKETPLACE } from "../constants";
import { useWeb3React } from "@web3-react/core";

export const useERC20 = (address, account, library) => {

    const { chainId } = useWeb3React()

    const contract = useMemo(() => {
        if (!account || !address || !library || !ethers.utils.isAddress(address)) {
            return;
        }
        return new ethers.Contract(address, ERC20ABI, library.getSigner());
    }, [account, address, library]);

    const getBalance = useCallback(async () => {

        let decimals = 18

        try {
            decimals = Number(await contract.decimals())
        } catch (e) {
            
        }

        try {
            const result = await contract.balanceOf(account);
            console.log(ethers.utils.formatUnits(result, decimals))
            return ethers.utils.formatUnits(result, decimals)
        } catch (e) {
            // console.log(e);
            return 0;
        }
    }, [contract, account]);


    const isApproved = useCallback(async () => {
        try {
            const { contractAddress } = NFT_MARKETPLACE.find(item => item.chainId === chainId)
            return ((await contract.allowance(account, contractAddress)).toString() !== "0")
        } catch (e) {
            return false;
        }
    }, [contract, account, chainId]);

    const isApproved2 = useCallback(async (contractAddress) => {
        try {
            return ((await contract.allowance(account, contractAddress)).toString() !== "0")
        } catch (e) {
            return false;
        }
    }, [contract, account, chainId]);

    const approve = useCallback(async () => {
        try {
            if (await isApproved()) {
                return
            }
            const { contractAddress } = NFT_MARKETPLACE.find(item => item.chainId === chainId)
            const tx = await contract.approve(contractAddress, ethers.constants.MaxUint256)
            await tx.wait()
        } catch (e) {
            return false;
        }
    }, [contract, account, chainId]);

    const approve2 = useCallback(async (contractAddress) => {
        try {
            if (await isApproved2(contractAddress)) {
                return
            }
            const tx = await contract.approve(contractAddress, ethers.constants.MaxUint256)
            await tx.wait()
        } catch (e) {
            return false;
        }
    }, [contract, account, chainId]);

    return {
        getBalance,
        isApproved,
        isApproved2,
        approve2,
        approve
    }
}