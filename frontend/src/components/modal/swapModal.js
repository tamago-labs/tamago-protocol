import React, { useState, useEffect, useCallback, useContext, useId } from "react"
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap"
import { useWeb3React } from "@web3-react/core"
import styled from "styled-components"
import { X, Check, ArrowRight } from "react-feather"
import { Puff } from 'react-loading-icons'

const CloseIcon = styled(X)`
  cursor: pointer;
  position: absolute;
  right: 10px;
`

const Header = styled(ModalHeader)`
  color: #000;
  position: relative;

  button {
    display: none;
  }
`

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

const Button = styled.button.attrs(() => ({ className: "btn" }))`
  color: #ffffff;
  background: #7a0bc0; 
  font-weight: 600;
  border-radius: 32px; 
  border: 2px solid transparent;
  width: 100%;
  max-width: 300px;
  cursor: pointer;
  
  :hover {
    color: #ffffff;
    background: #fa58b6;
  }
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
        <Modal style={{ top: '10%' }} isOpen={visible} toggle={toggle}>
            <Header toggle={toggle}>
                {`Swap Your Asset`}
                <CloseIcon onClick={toggle} />
            </Header>
            <ModalBody>
                <Preview>
                    <div>
                        {item && item.tokenType === 0 && (
                            <>
                                <img src={"../images/coin.png"} width="100%" height="120px" style={{ margin: "auto" }} />
                            </>
                        )}
                        {pairMetadata && <img src={pairMetadata.metadata.image} width="100%" height="120px" style={{ margin: "auto" }} />}
                    </div>
                    <div>
                        <div style={{ margin: "auto", textAlign: "center" }}>
                            <ArrowRight style={{ marginLeft: "auto", marginRight: "auto" }} size={32} />
                        </div>
                    </div>
                    <div>
                        {baseMetadata ? <img src={baseMetadata.metadata.image} width="100%" height="120px" style={{ margin: "auto" }} /> : <img src={"../images/coin.png"} width="100%" height="120px" style={{ margin: "auto" }} /> }
                    </div>
                </Preview>

                <hr style={{ background: "#333" }} />

                <div className="text-center">
                    {!approved &&
                        <Button
                            onClick={() => onApprove()}
                            disabled={loading}
                        >
                            {loading && (
                                <Puff height="24px" style={{ marginRight: "5px" }} stroke="white" width="24px" />
                            )}
                            Approve
                        </Button>
                    }
                    {approved &&
                        <Button
                            onClick={() => onSwap()}
                            disabled={loading}
                        >
                            {loading && (
                                <Puff height="24px" style={{ marginRight: "5px" }} stroke="white" width="24px" />
                            )}
                            Swap
                        </Button>
                    }
                </div>

            </ModalBody>

        </Modal>
    )
}

export default SwapModal