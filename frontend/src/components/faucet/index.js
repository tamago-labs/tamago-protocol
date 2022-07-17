import React, { useState, useEffect, useCallback, useMemo } from "react"
import styled, { keyframes } from "styled-components"
import { useWeb3React } from "@web3-react/core"
import MockERC1155Token from "../../abi/mockERC1155Token.json"
import { ethers } from "ethers"
import { Container } from "reactstrap"
import { ToggleButton } from "../button"
import ERC20ABI from "../../abi/erc20.json"
import MockNFT from "../../abi/mockNFT.json"
import { MOCK_NFT, MOCK_TOKEN } from "../../constants"

const Description = styled.p`
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    font-size: 14px;
    padding: 1.5rem;
    padding-bottom: 0px;
    text-align: center;
`

const MainPanel = styled.div`
    max-width: 800px; 
  margin-left: auto;
  margin-right: auto;
  padding: 1rem;  
  min-height: 250px;
`


const ButtonGroup = styled.div`
  display: flex; 
  margin-left: auto;
  margin-right: auto;
  justify-content: center;
  margin-bottom: 15px;

  button {
      :not(:first-child) {
          margin-left: 10px;
      }
  }
  `


const NFTCard = styled.div` 
width: 150px;  
height: 120px; 
margin: 10px;
font-size: 12px;
position:relative;
cursor: pointer;

.-button {
    z-index: -1;
    position: absolute;
    top: 50px;
    left: 0px;
    width: 100%;
    display: flex;
    div {
        margin: auto;
        background: white;
        color: black;
        padding: 3px 10px;
        border-radius: 10px;
    } 
}
:hover {
    .-button {
        z-index: 20;
    }
}

img {
    z-index: 10;
    position: absolute;
    top: 0px;
    left: 0px;
}

a {
  
  text-decoration: underline;
  cursor: pointer; 
  :hover {
    text-decoration: underline;
  }
}

`


const ListContainer = styled.div`
  display: flex;
  flex-wrap: wrap; 
  justify-content: center; 
  margin-bottom: 10px;
`

const Faucet = () => {

    const { chainId, account, library } = useWeb3React()

    const [chain, setChain] = useState(42)
    const [isNFT, setNFT] = useState(true)

    const onMint = useCallback(async ({ address, tokenId, isERC721 }) => {

        if (chain !== chainId) {
            alert("Incorrect chain!")
            return
        }

        try {
            if (isERC721) {
                const contract = new ethers.Contract(
                    address,
                    MockNFT,
                    library.getSigner()
                )
                await contract.mint()
            } else {
                const contract = new ethers.Contract(
                    address,
                    MockERC1155Token,
                    library.getSigner()
                )
                await contract.mint(account, tokenId, 1, "0x")
            }
        } catch (e) {
            console.log(`${e.message}`)
        }

    }, [chainId, chain, account, library])

    const onMintERC20 = useCallback(async (symbol) => {

        if (chain !== chainId) {
            alert("Incorrect chain!")
            return
        }

        const row = MOCK_TOKEN.find(item => item.symbol === symbol && item.chainId === chainId)

        const contract = new ethers.Contract(
            row.contract,
            ERC20ABI,
            library.getSigner()
        )
        try {
            await contract.faucet()
        } catch (e) {
            console.log(`${e.message}`)
        }

    }, [chainId, chain, account, library])

    const mocks = useMemo(() => {

        if (MOCK_NFT[chain]) {
            return MOCK_NFT[chain].list
        }
        return []
    }, [chain])

    const tokens = MOCK_TOKEN.filter(item => item.chainId === chain)

    const disabled = chain !== chainId

    return (
        <Container>
            <Description>
                Welcome to the faucet, this allows minting mock NFTs and tokens on Testnet networks
            </Description>
            <MainPanel>
                <ButtonGroup>
                    <ToggleButton onClick={() => setChain(42)} active={chain === 42}>
                        Kovan
                    </ToggleButton>
                    <ToggleButton onClick={() => setChain(80001)} active={chain === 80001}>
                        Mumbai
                    </ToggleButton>
                    <ToggleButton onClick={() => setChain(97)} active={chain === 97}>
                        BNB Testnet
                    </ToggleButton>
                    <ToggleButton onClick={() => setChain(43113)} active={chain === 43113}>
                        Fuji Testnet
                    </ToggleButton>
                </ButtonGroup>
                <ButtonGroup>
                    <ToggleButton onClick={() => setNFT(true)} active={isNFT}>
                        NFT
                    </ToggleButton>
                    <ToggleButton onClick={() => setNFT(false)} active={!isNFT}>
                        ERC-20
                    </ToggleButton>
                </ButtonGroup>
                <ListContainer>
                    {
                        isNFT && mocks.map((nft, index) => (
                            <NFTCard onClick={() => onMint(nft)} key={`${index}-nft`}>
                                <img src={nft.image} width="100%" height="120px" />
                                <div className="-button">
                                    <div>
                                        Mint
                                    </div>
                                </div>
                                {/*
                                <div className="text-center">
                                    <SmallButton onClick={() => onMint(nft)}>
                                        Mint{` `}{nft.name}{` `}#{nft.tokenId}
                                    </SmallButton>
                                </div> */}
                            </NFTCard>
                        ))}

                    {!isNFT && tokens.map((token, index) => {
                        return (
                            <NFTCard onClick={() => onMintERC20(token.symbol)} key={`${index}-token`}>
                                <div style={{ display: "flex", height: "120px", width: "100%", border: "1px solid white", marginBottom: "10px" }}>
                                    <div style={{ margin: "auto" }}>
                                        10,000{` `}{token.symbol}
                                    </div> 
                                </div>
                            </NFTCard>
                        )
                    })

                    }
                </ListContainer>

                {disabled && <div style={{ textAlign: "center", fontWeight: "600", height: "40px" }}>
                    {disabled && "Invalid network!"}
                </div>}


            </MainPanel>
        </Container>
    )
}

export default Faucet