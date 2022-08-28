import React, { useCallback, useState, useMemo, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import styled from "styled-components";
import { ArrowRight, Check, X } from "react-feather";
import { Puff } from "react-loading-icons";
import { ethers } from "ethers";

import { resolveNetworkName, shortAddress, shorterName } from "../../helper";
import { PROCESS } from "./";
import { Alert } from "../alert";
import useOrder from "../../hooks/useOrder";
import { Button } from "../button";
import { CommonCard } from "../card"; 

const Wrapper = styled.div`
  padding: 1rem;
  padding-bottom: 2rem;
`;

const CATEGORY = [
  "Art",
  "Cards",
  "Collectible",
  "Domain",
  "Music",
  "Photo",
  "Sports",
  "Metaverse",
];

const orderTemplate = {
  category: "Unknown",
  timestamp: 0,
  chainId: 42,
  ownerAddress: "",
  baseAssetAddress: "",
  baseAssetTokenIdOrAmount: 0,
  baseAssetTokenType: 0,
  barterList: [],
};

const orderTemplateToken = {
  category: "Unknown",
  timestamp: 0,
  chainId: 42,
  ownerAddress: "",
  baseAssetAddress: "",
  baseAssetTokenIdOrAmount: 0,
  baseAssetTokenType: 0,
  barterList: [],
};

const getOrderTemplate = () => {
  let order = new Object();
  const randomNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
  order["title"] = `Order #${randomNumber}`;
  return order;
};

const getOrderTemplateToken = () => {
  let order = new Object();
  const randomNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
  order["title"] = `Order #${randomNumber}`;
  return order;
};

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 2rem;

  button {
    :first-child {
      margin-right: 20px;
    }
  }
`;

const PreviewContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-bottom: 20px;
`;

const Title = styled.div`
  font-size: 18px;
  text-align: center;
`;

const PreviewFrom = styled.div`
  flex: 5;
  display: flex;
  flex-direction: column;

  > div {
    padding-top: 20px;
    margin: auto;
    display: flex;
    flex-wrap: wrap;
  }
`;

const PreviewDivider = styled.div`
  flex: 1;
  display: flex;
`;

const PreviewTo = styled.div`
  flex: 5;
  display: flex;
  flex-direction: column;

  > div {
    padding-top: 20px;
    margin: auto;
    display: flex;
    flex-wrap: wrap;
  }
`;

const TableContainer = styled.div`
  margin-top: 20px;
  margin-bottom: 10px;
  background-color: rgba(38, 38, 38, 0.6);
  padding: 10px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  border-radius: 12px;

  .table {
    color: white;
    width: 100%;
  }
`;

const Confirm = ({
  fromData,
  toData,
  step,
  setStep,
  process,
  setProcess,
  setToData,
  toTokens,
  setToTokens,
  fromTokens,
  isMultiChain
}) => {
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState([]);
  const { createOrder, approveNft, approveToken, register } = useOrder();
  const { chainId, account } = useWeb3React(); 

  //values return as List[]
  const values = useMemo(() => {
    let orderList = []; 
    if (fromData) {
      fromData.map((item) => {
        let orderData = getOrderTemplate();
        orderData.chainId = item.chainId;
        orderData.baseAssetAddress = item.assetAddress;
        orderData.baseAssetTokenIdOrAmount = item.assetTokenIdOrAmount;
        orderData.baseAssetTokenType = item.metadata.contract_type === "ERC1155" ? 2 : 1;
        if (toData) {
          orderData.barterList = toData.map((item) => {
            return {
              assetAddress: item.assetAddress,
              assetTokenIdOrAmount: item.assetTokenIdOrAmount,
              tokenType: item.metadata.contract_type === "ERC1155" ? 2 : 1,
              chainId: item.chainId,
            };
          });
        }
        if (toTokens) {
          orderData.barterList = orderData.barterList.concat(toTokens);
        }
        orderList.push(orderData);
      });
    }

    // if (fromTokens) {
    //   fromTokens.map((item) => {
    //     let orderToken = getOrderTemplateToken();
    //     orderToken.chainId = item.chainId;
    //     orderToken.baseAssetAddress = item.baseAssetAddress;
    //     orderToken.baseAssetTokenIdOrAmount = item.baseAssetTokenIdOrAmount;
    //     orderToken.baseAssetTokenType = item.baseAssetTokenType;
    //     if (toData) {
    //       orderToken.barterList = toData.map((item) => {
    //         return {
    //           assetAddress: item.token_address,
    //           assetTokenIdOrAmount: item.token_id,
    //           tokenType: item.contract_type === "ERC1155" ? 2 : 1,
    //           chainId: item.chainId,
    //         };
    //       });
    //     }
    //     if (toTokens) {
    //       orderToken.barterList = orderToken.barterList.concat(toTokens);
    //     }
    //     orderList.push(orderToken);
    //   });
    // }
    return orderList;
  }, [fromData, toData, chainId, toTokens, fromTokens]);

  const onGenerateId = useCallback(async () => {
    let orderIdList = [];
    if (values[0].barterList.length === 0) {
      return;
    }

    setLoading(true);

    try {
      for (let i = 0; i < values.length; i++) {
        const { orderId } = await createOrder(values[i]);
        orderIdList.push(orderId);
      }
      setOrderId(orderIdList);
      setProcess(PROCESS.GENERATE_ID);
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  }, [values, createOrder]);

  const onApprove = useCallback(async () => {
    setLoading(true);

    try {

      const approveItemSet = values.reduce((arr, item) => {
        if (arr.indexOf(item.baseAssetAddress) === -1) {
          arr.push(item.baseAssetAddress)
        }
        return arr
      },[])

      await Promise.all(
        approveItemSet.map(async (item) => {
          const value = values.find(v => v.baseAssetAddress === item)
          if (value.baseAssetTokenType === 0) {
            await approveToken(value, isMultiChain);
          } else {
            await approveNft(value, isMultiChain);
          }
        })
      );
      setProcess(PROCESS.DEPOSIT);
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  }, [values, approveNft, approveToken, isMultiChain]);

  const onRegister = useCallback(async () => {
    setLoading(true);
    try { 
      await register(orderId, values, isMultiChain);

      setProcess(PROCESS.CONFIRM);
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  }, [values, orderId, register, isMultiChain]);

  const proceed = useCallback(() => {
    switch (process) {
      case PROCESS.FILL:
        onGenerateId();
        break;
      case PROCESS.GENERATE_ID:
        onApprove();
        break;
      case PROCESS.DEPOSIT:
        onRegister();
        break;
      case PROCESS.CONFIRM:
        setProcess(PROCESS.CONFIRM);
        break;
      default:
        setProcess(PROCESS.FILL);
    }
  }, [process, onGenerateId, onApprove]);

  return (
    <Wrapper>
      <PreviewContainer>
        <PreviewFrom>
          <div>
            {fromTokens.map((token, index) => { 
              return (
                <CommonCard
                  key={index}
                  image={"../images/coin.png"}
                  chainId={token && Number(token.chainId)}
                >
                  <div className="name">
                    {token.baseAssetTokenType !== 0 ? (
                      <>
                        {token.name}
                        {` `}#{shorterName(token.baseAssetTokenIdOrAmount)}
                      </>
                    ) : (
                      <>
                        {ethers.utils.formatUnits(
                          token.baseAssetTokenIdOrAmount,
                          token.decimals
                        )}
                        {` `}
                        {token.symbol}
                      </>
                    )}
                  </div>
                </CommonCard>
              );
            })}
            {fromData.map((nft, index) => { 
              return (
                <CommonCard
                  key={index}
                  image={nft && nft.metadata.image}
                  chainId={nft && Number(nft.chainId)}
                >
                  <div className="name">
                    {nft.metadata.name} 
                  </div>
                </CommonCard>
              );
            })}
          </div> 
        </PreviewFrom>
        <PreviewDivider>
          <div style={{ margin: "auto" }}>
            <ArrowRight size={32} />
          </div>
        </PreviewDivider>
        <PreviewTo>
          <div>
            {toTokens.map((token, index) => {
              return (
                <CommonCard
                  key={index}
                  image={"../images/coin.png"}
                  chainId={token && Number(token.chainId)}
                >
                  <div className="name">
                    {ethers.utils.formatUnits(
                      token.assetTokenIdOrAmount,
                      token.decimals
                    )}
                    {` `}
                    {token.symbol}
                  </div>
                </CommonCard>
              );
            })}
            {toData.map((nft, index) => { 
              return (
                <CommonCard
                  key={index}
                  image={nft.metadata.image}
                  chainId={nft && Number(nft.chainId)}
                >
                  <div className="name">
                    {nft.metadata.name} 
                  </div>
                </CommonCard>
              );
            })}
          </div>
        </PreviewTo>
      </PreviewContainer>
      <TableContainer>
        <table className="table">
          <thead>
            <tr>
              <td>#</td>
              <td>Task</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>
                Upload your entry to Filecoin & IPFS
                {/* (CID:
                {orderId && shortAddress(orderId, 3, -3)}) */}
              </td>
              <td>{process > 0 ? <Check /> : <X />}</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Approve to spend your tokens</td>
              <td>{process > 1 ? <Check /> : <X />}</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Register to the smart contract</td>
              <td>{process > 2 ? <Check /> : <X />}</td>
            </tr>
          </tbody>
        </table>
      </TableContainer>

      <div style={{textAlign : "center", padding: "10px"}}>
        To confirm the order, you must complete above steps one by one.
      </div>

      {process === PROCESS.CONFIRM && (
        <Alert>Your order has been successfully created!</Alert>
      )}

      <ButtonContainer>
        {step > 1 && (
          <Button
            onClick={() => setStep(step - 1)}
            disabled={loading || process !== PROCESS.FILL}
          >
            Back
          </Button>
        )}
        {fromData && toData && (
          <Button
            disabled={
              loading ||
              process === PROCESS.CONFIRM ||
              values[0] && values[0].barterList.length === 0
            }
            style={{padding : loading && "5px 10px" }}
            onClick={proceed}
          >
            {loading && (
              <Puff height="24px" style={{ marginRight: "5px" }} width="24px" />
            )}
            <div>
               {process === PROCESS.FILL && "Confirm"}
            {process === PROCESS.GENERATE_ID && "Approve"}
            {process === PROCESS.DEPOSIT && "Register"}
            {process === PROCESS.CONFIRM && "Completed"}
            </div>
           
          </Button>
        )}
      </ButtonContainer>
    </Wrapper>
  );
};

export default Confirm;
