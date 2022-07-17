import React, { useState, useEffect, useMemo, useCallback } from "react"
import styled from "styled-components"
import Skeleton from "react-loading-skeleton"
import { resolveBlockexplorerLink, resolveNetworkName, shorterName } from "../../helper"
import { ethers } from "ethers"
import { TabContent, TabPane, Nav, NavItem, NavLink } from "../tabs"
import { InputGroup, Input, InputGroupText } from "reactstrap"
import { X, DollarSign, Clipboard, ExternalLink } from "react-feather"
import { useWeb3React } from "@web3-react/core"
import { SelectableCard } from "../card"
import { ERC20_TOKENS } from "../../constants"
import { Button, ToggleButton } from "../button"
import { MOCKS } from "."


const SearchInput = styled.input.attrs(() => ({
    type: "text",
    placeholder: "NFT Collection, Eg. Azuki, Ape",
}))`
    background: transparent;
    border: 1px solid #fff;
    padding: 12px;
    border-radius: 8px;
    font-size: 16px;
    color: #fff;
    width: 400px;
    margin-top: 12px;
    margin-right: 20px;
    ::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }
  `

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

`

const Wrapper = styled.div`
    padding-bottom: 2rem;
`

const ChainSelector = styled(
    ({ className, setter, getter }) => {
        return (
            <div className={className}>
                <ToggleButton onClick={() => setter(42)} active={getter === 42}>
                    Kovan
                </ToggleButton>
                <ToggleButton onClick={() => setter(80001)} active={getter === 80001}>
                    Mumbai
                </ToggleButton>
                <ToggleButton onClick={() => setter(97)} active={getter === 97}>
                    BNB Testnet
                </ToggleButton>
                <ToggleButton onClick={() => setter(43113)} active={getter === 43113}>
                    AVAX Fuji
                </ToggleButton>
            </div>
        )
    })`
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


const To = ({
    searchNFT,
    toData,
    setToData,
    step,
    setStep,
    setSearchText,
    searchText,
    searchLoading,
    fetchSearchNFTs,
    toTokens,
    setToTokens,
    setSearchFilter,
    searchFilter,
}) => {

    const { chainId } = useWeb3React()
    const [isNft, setNft] = useState(true)
    const [currentToken, setCurrentToken] = useState()
    const [tokenAmount, setTokenAmount] = useState([])


    useEffect(() => {
        if (chainId && isNft) {
            setCurrentToken()
        }
    }, [chainId, isNft])

    const onSearchTextChange = (e) => {
        setSearchText(e.target.value)
    }

    const onClickCard = (nft) => {
        if (toData.find((data) => data.token_hash === nft.token_hash)) {
            const newNFTArray = toData.filter(
                (data) => data.token_hash !== nft.token_hash
            )
            setToData(newNFTArray)
        } else {
            setToData([...toData, nft])
        }
    }

    const onClickFilter = (filter) => {
        if (searchFilter.indexOf(filter) !== -1) {
            if (searchFilter.length <= 1) return
            const newSearchFilter = searchFilter.filter((data) => data !== filter)
            setSearchFilter(newSearchFilter)
        } else {
            setSearchFilter([...searchFilter, filter])
        }
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

    const [activeTab, setActiveTab] = useState("1")

    const toggle = (tab) => {
        setActiveTab(tab)
    }

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
                        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                            {/* <ChainSelector
                                setter={setSearchChain}
                                getter={searchChain}
                            /> */}
                            <div style={{ marginLeft: "auto", marginRight: "auto", marginBottom: "1rem" }}>
                                <SearchInput
                                    value={searchText}
                                    onChange={onSearchTextChange}
                                />
                                <Button
                                    onClick={() =>
                                        fetchSearchNFTs({
                                            searchText,
                                            chainId,
                                        })
                                    }
                                >
                                    Search
                                </Button>
                            </div>

                        </div>

                        {searchNFT && !searchLoading
                            ? searchNFT.map((nft, index) => (
                                <>
                                    <SelectableCard
                                        image={nft.metadata.image}
                                        chainId={chainId}
                                        selected={toData.find(
                                            (data) => data.token_hash === nft.token_hash
                                        )}
                                        onClick={() => onClickCard({ ...nft, chainId })}
                                    >
                                        <div className="name">{shorterName(nft.metadata.name)}
                                            {` `}#{shorterName(nft.token_id)}</div>
                                    </SelectableCard>
                                </>

                            ))
                            : searchLoading && (
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
                            )}
                    </div>
                </TabPane>
                <TabPane tabId="2">
                    <div>
                        

                        {tokens.map((token, index) => {
                            const token_hash = `${token.chainId}${token.contractAddress}`
                            const isSelected = toTokens.find(
                                (data) => data.token_hash === token_hash
                            )

                            return (
                                <SelectableCard
                                    image={"../images/coin.png"}
                                    chainId={token.chainId}
                                    selected={isSelected}
                                    onClick={() => {
                                        if (!isSelected) {
                                            setToTokens([
                                                ...toTokens,
                                                {
                                                    assetAddress: token.contractAddress,
                                                    assetTokenIdOrAmount: `${ethers.utils
                                                        .parseUnits(`${tokenAmount[index]}`, token.decimals)
                                                        .toString()}`,
                                                    tokenType: 0,
                                                    chainId: token.chainId,
                                                    decimals: token.decimals,
                                                    symbol: token.symbol,
                                                    token_hash
                                                },
                                            ])
                                        } else {
                                            setToTokens(toTokens.filter((item) => item.token_hash !== token_hash))
                                        }
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
                {step > 1 && (
                    <Button
                        onClick={() => setStep(step - 1)}
                    >
                        Back
                    </Button>
                )}
                {toData && (
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

export default To