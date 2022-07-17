import { useWeb3React } from "@web3-react/core"
import React, { useState, useEffect, useMemo } from "react"
import styled from "styled-components"
import Skeleton from "react-loading-skeleton"
import { TabContent, TabPane, Nav, NavItem, NavLink } from "../tabs"
import { InputGroup, Input, InputGroupText } from "reactstrap"
import { Alert } from "../alert"
import { ERC20_TOKENS } from "../../constants"
import { resolveNetworkName, shorterName } from "../../helper"
import { SelectableCard } from "../card"
import { Button } from "../button"
import { MOCKS } from "."
import { ethers } from "moralis/node_modules/ethers"

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 2rem;
`

const Wrapper = styled.div`
    padding-bottom: 2rem;
`

const From = ({ nfts, fromData, setFromData, step, setStep }) => {

    const { chainId } = useWeb3React()

    const [activeTab, setActiveTab] = useState("1")
    const [tokenAmount, setTokenAmount] = useState([])

    const toggle = (tab) => {
        setActiveTab(tab)
    }

    const tokens = useMemo(() => {
        const mocks = (MOCKS.filter(
            (item) => item.chainId === chainId && item.tokenType === 0
        ).concat(
            ERC20_TOKENS.filter(
                (item) => item.chainId === chainId && item.tokenType === 0
            )))
        let intialAmount = []
        for (let t of mocks) {
            intialAmount.push(100)
        }
        setTokenAmount(intialAmount)
        return mocks

    }, [chainId])

    return (
        <Wrapper>
            <Nav tabs>
                <NavItem>
                    <NavLink
                        active={activeTab === "1"}
                        onClick={() => { toggle('1'); }}
                    >
                        NFT
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        active={activeTab === "2"}
                        onClick={() => { toggle('2'); }}
                    >
                        ERC-20
                    </NavLink>
                </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                    <div>
                        {nfts && (nfts.length > 0) && (
                            nfts.map((nft, index) => (
                                <SelectableCard
                                    image={nft.metadata.image}
                                    chainId={chainId}
                                    selected={fromData && fromData.token_hash === nft.token_hash}
                                    onClick={() => {
                                        setFromData({
                                            chainId,
                                            baseAssetAddress: nft.token_address,
                                            baseAssetTokenIdOrAmount: nft.token_id,
                                            baseAssetTokenType: nft.contract_type === "ERC1155" ? 2 : 1,
                                            token_hash: nft.token_hash,
                                            image: nft.metadata && nft.metadata.image,
                                            name: (nft.name) || (nft.metadata.name)
                                        })
                                    }}
                                >
                                    <div className="name">{(nft.name) || (nft.metadata.name)}{` `}#{shorterName(nft.token_id)}</div>
                                </SelectableCard>
                            ))
                        )
                        }
                        {!nfts &&
                            (
                                <>
                                    <Skeleton
                                        height="275px"
                                        width="260px"
                                        style={{ borderRadius: "6px", margin: "6px" }}
                                    />
                                    <Skeleton
                                        height="275px"
                                        width="260px"
                                        style={{ borderRadius: "6px", margin: "6px" }}
                                    />
                                    <Skeleton
                                        height="275px"
                                        width="260px"
                                        style={{ borderRadius: "6px", margin: "6px" }}
                                    />
                                    <Skeleton
                                        height="275px"
                                        width="260px"
                                        style={{ borderRadius: "6px", margin: "6px" }}
                                    />
                                </>
                            )

                        }
                    </div>
                </TabPane>
                <TabPane tabId="2">
                    <div>
                        {tokens.map((token, index) => {
                            const token_hash = `${token.chainId}${token.contractAddress}`
                            return (
                                <SelectableCard
                                    image={"../images/coin.png"}
                                    chainId={chainId}
                                    selected={fromData && fromData.token_hash === token_hash}
                                    onClick={() => {
                                        setFromData({
                                            chainId: token.chainId,
                                            baseAssetAddress: token.contractAddress,
                                            baseAssetTokenIdOrAmount: `${ethers.utils.parseUnits(`${tokenAmount[index]}`, token.decimals)}`,
                                            baseAssetTokenType: 0,
                                            token_hash,
                                            image: "../images/coin.png",
                                            decimals: token.decimals,
                                            symbol: token.symbol
                                        })
                                    }}
                                >
                                    <div style={{ color: "black", paddingTop: "10px" }}>
                                        <InputGroup>
                                            <Input
                                                type="number"
                                                min={1}
                                                step={1}
                                                value={tokenAmount[index]}
                                                onChange={(e) => {
                                                    const amount = Number(e.target.value)
                                                    setTokenAmount(tokenAmount.map((v, i) => i === index ? amount : v))
                                                }}
                                            />
                                            <InputGroupText>
                                                {token.symbol}
                                            </InputGroupText>
                                        </InputGroup>
                                    </div>
                                </SelectableCard>
                            )
                        })}
                    </div>
                </TabPane>
            </TabContent>
            <ButtonContainer>
                {fromData && (
                    <Button
                        onClick={() => setStep(step + 1)}
                    >
                        Next
                    </Button>
                )}
            </ButtonContainer>
        </Wrapper>
    )
}

export default From
