import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { AssetCard } from "../card";
import NFTCard from "../nftCard";
import { Puff } from 'react-loading-icons'
import useOrder from "../../hooks/useOrder";
import { NFT_MARKETPLACE } from "../../constants";
import MarketplaceABI from "../../abi/marketplace.json";
import { SelectableCardCancelOrder } from "../card";
import { Button } from "../button";
import LoadingIndicator from "../../components/loadingIndicator"

const Table = styled.table``

const Wrapper = styled.div.attrs(() => ({
}))`   

  padding: 10px;

  h2 {
    padding: 0px;
    margin: 0px;
    margin-top: 10px;
  }

  p {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  hr {
    background: white;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  .error-message {
    margin-left: 10px;
    font-size: 14px;
    color: var(--danger);
  }
`;

const OrderTable = styled(Table)`
  color: #fff;
`;

const TableRow = styled.tr`
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`;

const Disclaimer = styled.div`
    font-size: 14px;
    line-height: 20px;
    padding: 0px;
    border: 1px solid white;
    border-radius: 5px;
    display: flex;
    flex-direction: row;
`

const ColWithLink = styled.th.attrs((props) => ({
  onClick: () => props.navigate(`/order/${props.orderId}`),
}))`
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`;

const FixedButtonContainer = styled.div`
  position: fixed; 
  text-align: center;
  left: 50%;
  top: 80%;
  z-index: 10;
`;

const OrderItem = ({
  disabled,
  index,
  data,
  loading,
  onCancelOrder,
  onClaim,
  tick,
}) => {
  return (
    <div style={{ color: "black", textAlign: "center" }}>
      <button
        disabled={loading === Number(index)}
        onClick={() => onCancelOrder(data, index)}
        style={{
          zIndex: 40,
          color: "white",
          borderRadius: "32px",
          padding: "4px 8px",
        }}
        className="btn btn-danger shadow"
      >
        <div style={{ display: "flex", flexDirection: "row" }}>
          {loading === Number(index) && (
            <span style={{ marginRight: "10px" }}>
              <Puff />
            </span>
          )}
          Cancel
        </div>
      </button>
    </div>
  );
};

const OrdersPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding-top: 10px; 
`;

const ButtonsRow = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`

const Orders = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [tick, setTick] = useState(0);
  const [cancelData, setCancelData] = useState([]);
  const [disabledCancel, setDisabledCancel] = useState(true);

  const { getOrdersFromAccount } = useOrder();
  const { account, library, chainId } = useWeb3React();

  useEffect(() => {
    chainId &&
      account &&
      getOrdersFromAccount(chainId, account).then(
        (orders) => {
          setOrders(orders)
        }
      );
  }, [account, chainId]);

  useEffect(() => {
    if (cancelData.length <= 0) {
      setDisabledCancel(true);
    } else {
      setDisabledCancel(false);
    }
  }, [cancelData]);

  const onCancelOrder = useCallback(
    async (cancelData) => {
      setLoading(true);

      let cidArr = [];
      if (cancelData.length > 1) {
        cancelData.map((order) => {
          cidArr.push(order.cid);
        });
      }

      const { contractAddress } = NFT_MARKETPLACE.find(
        (item) => item.chainId === cancelData[0].chainId
      );
      const marketplaceContract = new ethers.Contract(
        contractAddress,
        MarketplaceABI,
        library.getSigner()
      );

      try {
        if (cancelData.length === 1) {
          const tx = await marketplaceContract.cancel(cancelData[0].cid);
          await tx.wait();
        }

        if (cancelData.length > 1) {
          const tx = await marketplaceContract.cancelBatch(cidArr);
          await tx.wait();
        }
      } catch (e) {
        console.log(e);
      } finally {
        getOrdersFromAccount(chainId, account).then(setOrders);
        setLoading(false);
        setTick(tick + 1);
      }
    },
    [orders, chainId, account, tick]
  );

  const onClickCard = (nft) => {
    if (cancelData.find((data) => data.cid === nft.cid)) {
      const newNFTArray = cancelData.filter((data) => data.cid !== nft.cid);
      setCancelData(newNFTArray);
    } else {
      setCancelData([...cancelData, nft]);
    }
  };

  // useEffect(() => {
  //   console.log(
  //     "🚀 ~ file: orders.js ~ line 152 ~ onClickCard ~ cancelData",
  //     cancelData
  //   );
  // }, [cancelData]);

  return (
    <Wrapper>
      <h2>Opened Orders ({orders.length})</h2>
      <hr />

      <Disclaimer>
        <ul>
          <li>We show only active orders from the chain you're connected</li>
        </ul>
      </Disclaimer>
      <Disclaimer style={{ padding: "0px 20px", marginTop: "5px" }}>
        <ButtonsRow>
          <Button
            disabled={disabledCancel}
            style={{ padding: loading && "5px 10px" }}
            onClick={() => onCancelOrder(cancelData)}
          >
            {loading && (
              <Puff stroke="black" height="24px" style={{ marginRight: "5px", color: "red" }} width="24px" />
            )}
            <div>
              Cancel Order(s)
            </div>
          </Button>
        </ButtonsRow>
        <div style={{ marginTop: "auto", marginBottom: "auto", marginLeft: "10px" }}>
          {cancelData.length} Selected
        </div>
      </Disclaimer>
      <OrdersPanel>
        {(!orders || orders.length === 0) && <LoadingIndicator />}
        {orders.length > 0 &&
          orders.map((order, index) => {
            return (
              <div key={index}>
                <SelectableCardCancelOrder
                  chainId={chainId}
                  onClickCard={onClickCard}
                  order={order}
                  cancelData={cancelData}
                  account={account}
                />
              </div>
            );
          })} 
      </OrdersPanel>
    </Wrapper>
  );
};

export default Orders;
