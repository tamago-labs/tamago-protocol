
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link"
import { Briefcase } from "react-feather";
import styled from "styled-components";
import Skeleton from "react-loading-skeleton";
import { Puff } from "react-loading-icons";
import { useWeb3React } from "@web3-react/core";
import useOrder from "../../hooks/useOrder"; 
import { resolveBlockexplorerLink, resolveNetworkName, shortAddress, shorterName } from "../../helper";
import { PairAssetCard } from "../card";
import SwapModal from "../modals/swapModal";
import { useERC1155 } from "../../hooks/useERC1155";
import { useERC20 } from "../../hooks/useERC20";
import { useERC721 } from "../../hooks/useERC721";
import { AlertWarning } from "../../components/alert";
import { Button2 } from "../../components/button";
import { ethers } from "ethers";

const NFTCard = ({
    orderId,
    order,
    item,
    account,
    library,
    baseMetadata,
    index,
    increaseTick,
  }) => {
    const { resolveMetadata, resolveTokenValue, swap } = useOrder();
    const [data, setData] = useState();
    const [loading, setLoading] = useState();
  
    const [swapModalVisible, setSwapModalVisible] = useState(false);
    const { chainId } = useWeb3React();
    const [approved, setApproval] = useState(false);
    const [ownedItems, setOwnedItems] = useState(-1);
    const [tick, setTick] = useState();
  
    useEffect(() => {
      if (item && item.tokenType !== 0) {
        resolveMetadata({
          assetAddress: item.assetAddress,
          tokenId: item.assetTokenIdOrAmount,
          chainId: item.chainId,
        }).then(setData); 
      }
    }, [item, index]);
  
    const assetAddressContractErc721 = useERC721(
      item.assetAddress,
      account,
      library
    );
  
    const assetAddressContractErc1155 = useERC1155(
      item.assetAddress,
      account,
      library
    );
  
    const contractErc20 = useERC20(item.assetAddress, account, library);
  
    useEffect(() => {
      if (account) {
        fetchItem();
      } else {
        setOwnedItems(undefined);
      }
    }, [account, item, tick]);
  
    const onApprove = useCallback(async () => {
      setLoading(true);
  
      try {
        if (item.tokenType === 0) {
          const { approve } = contractErc20;
          await approve();
        } else if (item.tokenType === 1) {
          await assetAddressContractErc721.approve();
        } else if (item.tokenType === 2) {
          await assetAddressContractErc1155.approve(item.assetTokenIdOrAmount);
        }
        setApproval(true)
      } catch (e) {
        console.log(e.message);
      }
  
      increaseTick()
      setLoading(false);
    }, [
      order,
      item,
      tick,
      assetAddressContractErc721,
      assetAddressContractErc1155,
      contractErc20,
    ]);
  
    const onSwap = useCallback(async () => {
      setLoading(true);
  
      try {
        const { index } = item;
  
        const tx = await swap(orderId, order, index);
        await tx.wait();
  
        setSwapModalVisible(false);
      } catch (e) {
        console.log(e, e.error);
  
        const message =
          e.error && e.error.data && e.error.data.message
            ? e.error.data.message
            : e.message;
  
      }
  
      setLoading(false);
      increaseTick();
    }, [orderId, order, swap, item]);
  
    const fetchItem = useCallback(async () => {
      setOwnedItems(undefined);
      setApproval(false);

      if (item.tokenType === 0) {
        const { getBalance, isApproved } = contractErc20;
        const balance = await getBalance();
        setOwnedItems(balance); 
        isApproved().then(setApproval);
      } else if (item.tokenType === 1) {
        const balance = await assetAddressContractErc721.getBalance();
        setOwnedItems(balance);
        assetAddressContractErc721.isApproved().then(setApproval);
      } else if (item.tokenType === 2) {
        const balance = await assetAddressContractErc1155.getTokenBalanceId(
          item.assetTokenIdOrAmount
        );
        setOwnedItems(balance.toString());
        assetAddressContractErc1155.isApproved().then(setApproval);
      } else if (item.tokenType === 3) {
        const balance = await library.getBalance(account)
        setOwnedItems(Number(ethers.utils.formatEther(balance)).toLocaleString())
        setApproval(true)
      }
    }, [assetAddressContractErc721, assetAddressContractErc1155, contractErc20, library, account]);
  
    return (
      <>
        <SwapModal
          visible={swapModalVisible}
          toggle={() => setSwapModalVisible(!swapModalVisible)}
          loading={loading}
          item={item}
          order={order}
          onApprove={onApprove}
          onSwap={onSwap}
          pairMetadata={data}
          baseMetadata={baseMetadata}
          approved={approved}
        />
        <PairAssetCard
          image={
            (item.tokenType === 0 || item.tokenType === 3)
              ? "./images/coin.png"
              : data && data.metadata && data.metadata.image
          }
          // chainId={item.chainId}
          balance={
            ownedItems !== undefined && item.chainId === chainId ? (
              <>{` ${ownedItems}`}</>
            ) : (
              <>--</>
            )
          }
        >
          <div className="name">
            {(item.tokenType !== 0 && item.tokenType !== 3) ? (
              <>
                {data && data.metadata.name ? data.metadata.name : `#${shorterName(item.assetTokenIdOrAmount)}`}
              </>
            ) : (
              <>
                {resolveTokenValue({
                  assetAddress: item.assetAddress,
                  tokenId: item.assetTokenIdOrAmount,
                  chainId: item.chainId,
                })}
              </>
            )}
          </div>
          <div style={{ padding: "5px", textAlign: "center" }}>
            <Button2
              onClick={() =>
                item.chainId === chainId && setSwapModalVisible(true)
              }
              disabled={loading || !account}
            >
              Swap
            </Button2>
          </div>
        </PairAssetCard>
      </>
    );
  };

  export default NFTCard