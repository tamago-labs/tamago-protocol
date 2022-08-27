import React, { useState, useEffect, useCallback, useContext, useMemo } from "react"
import { useWeb3React } from "@web3-react/core"
import styled from "styled-components"
import { X } from "react-feather"
import { Flex, Box } from 'reflexbox'
import { NETWORK } from "../../config/network"
import { MAINNET_CHAINS, TESTNET_CHAINS } from "../../constants"
import BaseModal from "./baseModal"
import { AccountContext } from "../../hooks/useAccount" 

const Connector = styled.div`

  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  width: 100%;
  margin: auto;
  color: white;
  height: 100px;

  font-size: 20px;

  :hover {
    cursor: pointer;
    text-decoration: underline;
  }

  display: flex;
  flex-direction: column;

  img { 
    width: 36px;
    height: 36px;
    border-radius: 12px;
  }

  div {
    margin-left: auto;
    margin-right: auto;
  }

  .--chain-name {
    margin-top: 10px;
    font-size: 14px;
    max-width: 150px;
    text-align: center;
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

const ListItems = ({ data, activeChainId, account, index, toggle, library }) => {
  return (
    <Box
      width={[1 / 3]}
      p={3}>
      <Connector
        active={parseInt(data.chainId, 16) === parseInt(activeChainId)}
        key={index}
        onClick={async () => {
          console.log(`Switching to chain `, data)
          toggle()
          const params = data

          try {
            await library?.send("wallet_switchEthereumChain", [
              { chainId: data.chainId },
              account,
            ])
          } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
              try {
                await library?.send("wallet_addEthereumChain", [
                  params,
                  account,
                ])
              } catch (addError) {
                // handle "add" error
                console.error(`Add chain error ${addError}`)
              }
            }
            console.error(`Switch chain error ${switchError}`)
            // handle other "switch" errors
          }
        }}
      >
        <div style={{ height: 30, width: 30, borderRadius: "50%", marginTop: "auto", marginBottom: "auto" }}>
          <img src={data.icon} />
        </div>
        <div className="--chain-name">
          {data.chainName}
        </div>
      </Connector>
    </Box>
  )
}

const SectionTitle = styled.div`
  text-align: center;
  padding: 10px; 
  text-decoration: underline;
`

function WalletsModal({ toggleModal, modalVisible }) {
  const context = useWeb3React()

  const { isMainnet } = useContext(AccountContext)

  const { account, chainId, library } = context

  const { mainnet, testnet } = useMemo(() => {
    let mainnet = []
    let testnet = []

    for (let item of NETWORK) {
      if (MAINNET_CHAINS.indexOf(parseInt(item.chainId, 16)) !== -1) {
        mainnet.push(item)
      } else {
        testnet.push(item)
      }
    }

    return {
      mainnet,
      testnet
    }
  }, [])

  return (
    <>
      <BaseModal
        isOpen={modalVisible}
        onRequestClose={toggleModal}
        title={"Switch Chain"} 
      >
        <Flex flexWrap='wrap'>
          {isMainnet
            ?
            <Box
              width={[1 ]}
              p={3}> 
              <Flex flexWrap='wrap'>
                {mainnet.map((data, index) => (
                  <ListItems
                    data={data}
                    activeChainId={chainId}
                    account={account}
                    index={index}
                    toggle={toggleModal}
                    library={library}
                  />
                ))}
              </Flex>
            </Box>
            :
            <Box
              width={[1]}
              p={3}> 
              <Flex flexWrap='wrap'>
                {testnet.map((data, index) => (
                  <ListItems
                    data={data}
                    activeChainId={chainId}
                    account={account}
                    index={index}
                    toggle={toggleModal}
                    library={library}
                  />
                ))}
              </Flex>
            </Box>
          }

        </Flex>
      </BaseModal>
    </>
  )
}

export default WalletsModal
