import React, { useState, useEffect, useCallback, useContext, useId } from "react"
import { useWeb3React } from "@web3-react/core"
import styled from "styled-components"
import { X, Check, ArrowRight } from "react-feather"
import { Puff } from 'react-loading-icons'
import BaseModal from "./baseModal"
import { Button } from "../button"
import { resolveNetworkName } from "../../helper"

const CloseIcon = styled(X)`
  cursor: pointer;
  position: absolute;
  right: 10px;
`

const Preview = styled.div`
  display: flex;
  color: white;
  div {
    flex: 1;
    width: 150px; 
    border-radius: 12px;
    padding: 12px; 
    border: 1px solid transparent;
    margin-left: 3px;
    margin-right: 3px;
    display: flex; 
  }
`

const Footer = styled.div`
    display: flex;
  text-align: center;
  justify-content: center;
  padding: 5px;
`

const Disclaimer = styled.div`
  margin-top: 10px;
  margin-bottom: 20px;
  border: 1px solid white;
  width: 100%; 
  margin-left: auto;
  margin-right: auto;
  padding: 15px;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  border-radius: 6px; 
  
`

const CrossChainSwapModal = ({
    loading,
    visible,
    toggle,
    order,
    item,
    onApprove,
    onPartialSwap,
    baseMetadata,
    pairMetadata,
    approved
}) => {


    return (
        <>
            <BaseModal
                isOpen={visible}
                onRequestClose={toggle}
                title={"Swap Cross-Chain Asset"}
            >
                <Preview>
                    <div>
                        {item && (item.tokenType === 0 || item.tokenType === 3) && (
                            <>
                                <img src={"../images/coin.png"} width="100%" height="150px" style={{ margin: "auto" }} />
                            </>
                        )}
                        {pairMetadata && <img src={pairMetadata.metadata.image} width="100%" height="150px" style={{ margin: "auto" }} />}
                    </div>
                    <div>
                        <div style={{ margin: "auto", textAlign: "center" }}>
                            <ArrowRight style={{ marginLeft: "auto", marginRight: "auto" }} size={32} color="white" />
                        </div>
                    </div>
                    <div>
                        {baseMetadata ? <img src={baseMetadata.metadata.image} width="100%" height="150px" style={{ margin: "auto" }} /> : <img src={"./images/coin.png"} width="100%" height="120px" style={{ margin: "auto" }} />}
                    </div>
                </Preview>
                <Preview>
                    <div style={{ fontSize: "14px", justifyContent: "center" }}>
                        {resolveNetworkName(item.chainId)}
                    </div>
                    <div>

                    </div>
                    <div style={{ fontSize: "14px", justifyContent: "center" }}>
                        {resolveNetworkName(order.chainId)}
                    </div>
                </Preview>
                <Disclaimer>
                    Once the asset is deposited and the transaction is reviewed by the validator, you will be received the asset on {resolveNetworkName(order.chainId)} within ~5-30 mins.
                </Disclaimer>
                <hr style={{ background: "#333" }} />
                <Footer>
                    {!approved &&
                        <Button
                            onClick={() => onApprove(true)}
                            disabled={loading}
                            style={{ padding: loading && "5px 10px" }}
                        >
                            {loading && (
                                <Puff height="24px" style={{ marginRight: "5px" }} stroke="white" width="24px" />
                            )}
                            <div>
                                Approve
                            </div>
                        </Button>
                    }
                    {approved &&
                        <>
                            <Button
                                onClick={() => onPartialSwap()}
                                disabled={loading}
                                style={{ padding: loading && "5px 10px" }}
                            >
                                {loading && (
                                    <Puff height="24px" style={{ marginRight: "5px" }} stroke="white" width="24px" />
                                )}
                                <div>
                                    Deposit
                                </div>
                            </Button>
                        </>
                    }
                    
                </Footer>

                <div style={{textAlign : "center", fontSize: "12px", padding: "5px"}}>*In case on any failing caused by the asset is sold or revoked. Please contact the team to return back your asset. </div>
            </BaseModal>
        </>
    )
}

export default CrossChainSwapModal