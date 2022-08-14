import React, { useState, useEffect, useCallback, useContext, useId } from "react"
import { useWeb3React } from "@web3-react/core"
import styled from "styled-components"
import { X, Check, ArrowRight } from "react-feather"
import { Puff } from 'react-loading-icons'
import BaseModal from "./baseModal"
import { Button } from "../button"

const CloseIcon = styled(X)`
  cursor: pointer;
  position: absolute;
  right: 10px;
`

// const Header = styled(ModalHeader)`
//   color: #000;
//   position: relative;

//   button {
//     display: none;
//   }
// `

const Preview = styled.div`
  display: flex;
  color: #333;
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

const SwapModal = ({
    loading,
    visible,
    toggle,
    order,
    item,
    onApprove,
    onSwap,
    baseMetadata,
    pairMetadata,
    approved
}) => {


    return (
        <>
            <BaseModal
                isOpen={visible}
                onRequestClose={toggle}
                title={"Swap Your Asset"}
            >
                <Preview>
                    <div>
                        {item && (item.tokenType === 0 || item.tokenType === 3) && (
                            <>
                                <img src={"./images/coin.png"} width="100%" height="150px" style={{ margin: "auto" }} />
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
                <hr style={{ background: "#333" }} />

                <Footer>
                    {!approved &&
                        <Button
                            onClick={() => onApprove()}
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
                        <Button
                            onClick={() => onSwap()}
                            disabled={loading}
                            style={{ padding: loading && "5px 10px" }}
                        >
                            {loading && (
                                <Puff height="24px" style={{ marginRight: "5px" }} stroke="white" width="24px" />
                            )}
                            <div>
                                Swap
                            </div>
                        </Button>
                    }
                </Footer>
            </BaseModal>
        </>
    )
}

export default SwapModal