import React, { useState, useEffect, useCallback, useContext } from "react"
import { useWeb3React } from "@web3-react/core"
import styled from "styled-components"
import { X } from "react-feather"
import { Flex, Box } from 'reflexbox'
import { Connectors } from "../../config/connectors"
import useEagerConnect from "../../hooks/useEagerConnect"
import useInactiveListener from "../../hooks/useInactiveListener"
import BaseModal from "./baseModal"

const Connector = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px; 
  display: flex;
   flex-direction: column;
  margin-bottom: 12px;
  color: white; 
  height: 135px;
 
  div { 
    text-align: center;
  }

  :hover {
    cursor: pointer;
    color: white;
     text-decoration: underline;
    box-shadow: none;
  }

  
 
`

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


function WalletsModal({ toggleWalletConnect, walletLoginVisible }) {
  const context = useWeb3React()

  const { account, activate, deactivate, error, chainId } = context

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = useState()

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector)

  // useEffect(() => {
  //     if (error && error.name === "UnsupportedChainIdError") {

  //     }
  // }, [error])

  return (
    <>
      <BaseModal
        isOpen={walletLoginVisible}
        onRequestClose={toggleWalletConnect}
        title={"Choose Wallet Provider"}
      >
        <Flex flexWrap='wrap'>
          {Connectors.map((item, index) => {
            const { connector, name, imgSrc } = item
            return (
              <Box
                width={[1, 1 / 2]}
                p={3}>
                <Connector
                  key={index}
                  onClick={() => {
                    toggleWalletConnect()
                    setActivatingConnector(connector)
                    activate(connector)
                  }}
                > 
                  <div>
                    <img style={{ width: "80px"}} src={item.image} />
                  </div>
                  <div style={{ margin: "auto" }}>{name}</div>
                </Connector>
              </Box>
            )
          })}
        </Flex>
      </BaseModal>
      {/* <Modal style={{ top: "10%" }} isOpen={walletLoginVisible} toggle={toggleWalletConnect}>
      <Header toggle={toggleWalletConnect}>
        Choose Wallet Provider
        <CloseIcon onClick={toggleWalletConnect} />
      </Header>
      <ModalBody>
        <div className="row">
          {Connectors.map((item, index) => {
            const { connector, name, imgSrc } = item
            return (
              <div className="col-6">
                <Connector
                  key={index}
                  onClick={() => {
                    toggleWalletConnect()
                    setActivatingConnector(connector)
                    activate(connector)
                  }}
                >
                  <img style={{width :"55px"}} src={item.image}/>
                  <div style={{ margin: "auto" }}>{name}</div>
                </Connector>
              </div>

            )
          })}
        </div>

      </ModalBody> 
    </Modal> */}
    </>
  )
}

export default WalletsModal
