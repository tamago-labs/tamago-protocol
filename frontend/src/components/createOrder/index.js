import React, { useState, useEffect, useCallback, useMemo } from "react"
import styled, { keyframes } from "styled-components"
import { Container } from "reactstrap"
import { useWeb3React } from "@web3-react/core"
import { useMoralisWeb3Api } from "react-moralis"
import { AlertWarning } from "../alert"
import From from "./from"
import To from "./to"
import Confirm from "./confirm"
import useOrder from "../../hooks/useOrder"


export const MOCKS = [
    {
        chainId: 42,
        contractAddress: "0x8F6e0835CCA21892d5296D58EB0C8206B623BF2B",
        tokenType: 0,
        symbol: "USDC",
        decimals: 6,
        tokens: []
    },
    {
        chainId: 42,
        contractAddress: "0x8afc69A0C245f4d84Ba160F19df1F76a44991d65",
        tokenType: 0,
        symbol: "USDT",
        decimals: 6,
        tokens: []
    },
    {
        chainId: 42,
        contractAddress: "0xC926A3F31Ad3db8f27Bbfe4aD42a19A0BCaD8059",
        tokenType: 0,
        symbol: "DAI",
        decimals: 18,
        tokens: []
    },
    {
        chainId: 80001,
        contractAddress: "0x553588e084604a2677e10E46ea0a8A8e9D859146",
        tokenType: 0,
        symbol: "USDC",
        decimals: 6,
        tokens: []
    },
    {
        chainId: 80001,
        contractAddress: "0x42209A0A2a3D80Ad48B7D25fC6a61ad355901484",
        tokenType: 0,
        symbol: "DAI",
        decimals: 18,
        tokens: []
    },
    {
        chainId: 97,
        contractAddress: "0x65e38111d8e2561aDC0E2EA1eeA856E6a43dC892",
        tokenType: 0,
        symbol: "USDC",
        decimals: 6,
        tokens: []
    },
    {
        chainId: 97,
        contractAddress: "0x553588e084604a2677e10E46ea0a8A8e9D859146",
        tokenType: 0,
        symbol: "DAI",
        decimals: 18,
        tokens: []
    },
    {
        chainId: 43113,
        contractAddress: "0x65e38111d8e2561aDC0E2EA1eeA856E6a43dC892",
        tokenType: 0,
        symbol: "USDC",
        decimals: 6,
        tokens: []
    },
    {
        chainId: 43113,
        contractAddress: "0x553588e084604a2677e10E46ea0a8A8e9D859146",
        tokenType: 0,
        symbol: "DAI",
        decimals: 18,
        tokens: []
    }
]

const Description = styled.p`
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    font-size: 14px;
    padding: 1.5rem;
    padding-bottom: 0px;
    text-align: center;
`


const StepHeader = styled.div`
  margin-top: 32px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-around;
`

const Step = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  .circle {
    border: 1px solid #fff;
    background: ${(props) =>
        props.active ? "white" : "transparent"};

    ${props => props.active && `
    color: #333;
    `}

    width: 24px;
    height: 24px;
    margin-right: 8px;
    display: flex;
    justify-content: center;
    border-radius: 50%;
    font-size: 14px;
  }
`

export const PROCESS = {
    FILL: 0,
    GENERATE_ID: 1,
    DEPOSIT: 2,
    CONFIRM: 3,
    COMPLETE: 4
}

const CreateOrder = () => {

    const { account, chainId } = useWeb3React()
    const [nfts, setNfts] = useState()
    const [fromData, setFromData] = useState()
    const [toData, setToData] = useState([])
    const [toTokens, setToTokens] = useState([])
    const [searchText, setSearchText] = useState()
    const [searchNFT, setSearchNFT] = useState()
    const [searchChain, setSearchChain] = useState()
    const [searchFilter, setSearchFilter] = useState(['name'])
    const [step, setStep] = useState(1)
    const [searchLoading, setSearchLoading] = useState(false)
    const Web3Api = useMoralisWeb3Api()
    const { getMetadata } = useOrder()

    const [process, setProcess] = useState(PROCESS.FILL)

    const fetchNFTBalance = useCallback(async ({ chainId, account }) => {
        const options = {
            chain: `0x${chainId.toString(16)}`,
            address: account,
        }
        const { result } = await Web3Api.account.getNFTs(options)

        const data = await Promise.all(result.map(item => getMetadata(item)))

        const filteredData = data.filter((nft) => nft.metadata)
        setNfts(filteredData)
    }, [account, chainId])

    useEffect(() => {
        setSearchNFT([])
    }, [searchChain])

    const fetchSearchNFTs = useCallback(async ({
        searchText,
        chainId
    }) => {

        if (!searchText || searchText.length <= 2) return
        setSearchLoading(true)
        const options = {
            q: searchText,
            chain: `0x${chainId.toString(16)}`,
            filter: searchFilter.join(','),
        }
        const { result } = await Web3Api.token.searchNFTs(options)
        const data = result.map((nft) => {
            let metadata = JSON.parse(nft.metadata)

            if (metadata && metadata.image && metadata.image.indexOf("ipfs://") !== -1) {
                metadata.image = metadata.image.replaceAll("ipfs://", "https://ipfs.infura.io/ipfs/")
            }

            if (metadata && !metadata.image && metadata['image_url']) {
                metadata.image = metadata['image_url']
            }

            return {
                ...nft,
                metadata,
            }
        })

        const filteredData = data.filter((nft) => nft.metadata)

        setSearchNFT(filteredData)
        setSearchLoading(false)
    }, [account, chainId, searchText, searchFilter])

    useEffect(() => {
        if (!account && !chainId) return

        setSearchChain(chainId)
        fetchNFTBalance({
            chainId,
            account
        })
    }, [account, chainId])

    return (
        <Container>
            <Description>
                To list the asset simply by define the list of pair assets, upload it to Filecoin and register the hash on the contract then wait for someone come to swap
            </Description>

            {!account && (
                <AlertWarning style={{ marginTop: "10px" }}>
                    Connect your wallet to continue
                </AlertWarning>
            )}

            <StepHeader>
                <Step active={step === 1}>
                    <div className="circle">1</div>
                    From Asset
                </Step>
                <Step active={step === 2}>
                    <div className="circle">2</div>To Asset
                </Step>
                <Step active={step === 3}>
                    <div className="circle">3</div>Confirm
                </Step>
            </StepHeader>

            {/* From Section */}
            {step === 1 && (
                <From
                    nfts={nfts}
                    fromData={fromData}
                    setFromData={setFromData}
                    step={step}
                    setStep={setStep}
                />
            )}

            {/* To Section */}
            {step === 2 && (
                <To
                    searchLoading={searchLoading}
                    searchNFT={searchNFT}
                    toData={toData}
                    setToData={setToData}
                    step={step}
                    setStep={setStep}
                    setSearchText={setSearchText}
                    searchText={searchText}
                    fetchSearchNFTs={fetchSearchNFTs}
                    toTokens={toTokens}
                    setToTokens={setToTokens}
                    setSearchFilter={setSearchFilter}
                    searchFilter={searchFilter}
                />
            )}

            {/* Confirm Section */}
            {step === 3 && (
                <Confirm
                    fromData={fromData}
                    toData={toData}
                    setToData={setToData}
                    step={step}
                    setStep={setStep}
                    process={process}
                    setProcess={setProcess}
                    toTokens={toTokens}
                    setToTokens={setToTokens}
                />
            )}

        </Container>
    )
}

export default CreateOrder