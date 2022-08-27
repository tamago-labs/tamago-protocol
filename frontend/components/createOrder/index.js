import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import styled from "styled-components";
import { useWeb3React } from "@web3-react/core";
import { useMoralisWeb3Api } from "react-moralis";
import { Flex, Box } from "reflexbox"
import { Alert } from "../alert";
import From from "./from";
import To from "./to";
import Confirm from "./confirm";
import { resolveNetworkName, getIcon } from "../../helper"
import useOrder from "../../hooks/useOrder";
import { AccountContext } from "../../hooks/useAccount";
import { MAINNET_CHAINS, TESTNET_CHAINS } from "../../constants";

export const MOCKS = [
];

const Container = styled.div`

`

const HeaderSection = styled.div`
   background: transparent;
   padding: 20px 40px;
   border-top: 1px solid white;
   border-bottom: 1px solid white;
   display: flex;
   flex-direction: row;
  margin-bottom: 20px;

   >div {
    flex: 1;
   }
`


const StepHeader = styled.div`
  display: flex;
  
  align-items: center;
  justify-content: space-around;
`;

const Step = styled.div`
  display: flex;
  align-items: center; 

  .circle {
    border: 1px solid #fff;
    background: ${(props) => (props.active ? "white" : "transparent")};

    ${(props) =>
    props.active &&
    `
    color: #333;
    `}

    width: 24px;
    height: 24px;
    margin-right: 8px; 
    padding-top: 3px;
    display: flex;
    justify-content: center;
    border-radius: 50%;
    font-size: 14px;
  }
`;


const SelectorItem = styled.div`
  width: 100%;
  margin: 5px;
  margin-top: 30px;
  min-height: 200px;
  display: flex;
  
  max-width: 600px;
  box-shadow: 5px 7px black;
  border: 1px solid white; 
  background: white;
  color: black; 
  border-radius: 5px;
  text-align: center;
  padding: 20px;
  h4 {
    font-size: 20px;
    padding: 0px;
    margin: 0px;
  }
  p{
    line-height: 24px;
  }

  ${props => props.disabled ? `
  opacity : 0.6;

  `
    : `
  cursor: pointer;
  :hover {  
    h4 { 
    }
  }
  `
  }

`

const Disclaimer = styled.div`
    font-size: 14px;
    line-height: 20px;
    padding: 0px;
    padding-top: 5px;
    padding-bottom: 5px;
    border: 1px solid white;
    border-radius: 5px;
    display: flex;
    flex-direction: row;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    max-width: 700px;
    margin-top: 25px;
`

export const PROCESS = {
  FILL: 0,
  GENERATE_ID: 1,
  DEPOSIT: 2,
  CONFIRM: 3,
  COMPLETE: 4,
};

const IconWrapper = styled.div`
  border-radius: 50%;
  overflow: hidden;
  margin-left: auto;
  margin-right: auto;
  width: 45px;
  height: 45px;
  img {
    width: 45px;
    height: 45px; 
  }
`


const Chain = ({ chainId }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", margin: "3px" }}>
      <IconWrapper>
        <img src={getIcon(chainId)} />
      </IconWrapper>
      <h4 style={{ marginTop: "5px", fontSize: "16px" }}>{resolveNetworkName(chainId)}</h4>
    </div>
  )
}

const CreateOrder = () => {

  const { isMainnet } = useContext(AccountContext)

  const [isSameChain, setSameChain] = useState(0) // 1 - Same, 2 - Multi

  const [nfts, setNfts] = useState();
  const [fromData, setFromData] = useState([]);
  const [toData, setToData] = useState([]);
  const [fromTokens, setFromTokens] = useState([]);
  const [toTokens, setToTokens] = useState([]);
  const [searchText, setSearchText] = useState();
  const [searchNFT, setSearchNFT] = useState(undefined);
  const [searchChain, setSearchChain] = useState();
  const [searchFilter, setSearchFilter] = useState(["name"]);
  const [step, setStep] = useState(1);
  const [searchLoading, setSearchLoading] = useState(false);
  const { account, chainId } = useWeb3React();
  const Web3Api = useMoralisWeb3Api();
  const { getMetadata, fetchNFTFromAccount } = useOrder();

  const [process, setProcess] = useState(PROCESS.FILL);

  // const fetchNFTBalance = useCallback(
  //   async ({ chainId, account }) => {
  //     const filteredData = await fetchNFTFromAccount({
  //       chainId,
  //       account
  //     })
  //     setNfts(filteredData);
  //   },
  //   [account, chainId]
  // );


  useEffect(() => {
    setSearchNFT([]);
  }, [searchChain]);

  const fetchSearchNFTs = useCallback(
    async ({ searchText, chainId }) => {
      if (!searchText || searchText.length <= 2) return;

      setSearchLoading(true);
      const options = {
        q: searchText,
        chain: `0x${Number(chainId).toString(16)}`,
        filter: searchFilter.join(","),
      };
      let result = await Web3Api.token.searchNFTs(options);

      let nfts = result.result

      let count = 0

      while (result.next) {
        result = await result.next()
        const o = result.result
        nfts = nfts.concat(o)
        
        // if (count > 10) {
        //   break
        // }
        // count += 1
      }
      
      const data = nfts.map((nft) => {
        let metadata = JSON.parse(nft.metadata);

        if (
          metadata &&
          metadata.image &&
          metadata.image.indexOf("ipfs://") !== -1
        ) {
          metadata.image = metadata.image.replaceAll(
            "ipfs://",
            "https://nftstorage.link/ipfs/"
          );
        }

        if (metadata && !metadata.image && metadata["image_url"]) {
          metadata.image = metadata["image_url"];
        }

        return {
          ...nft,
          metadata,
        };
      });

      const filteredData = data.filter((nft) => nft.metadata);

      setSearchNFT(filteredData);
      setSearchLoading(false);
    },
    [account, chainId, searchText, searchFilter]
  );

  const reset = () => {
    setSameChain(0)
  }

  useEffect(() => {
    if (!account && !chainId) return;

    setSearchChain(chainId);
    fetchNFTFromAccount({
      chainId,
      account
    }).then(setNfts)
  }, [account, chainId]);

  return (
    <div>
      {!account && (
        <Alert style={{ marginTop: "10px" }}>
          Connect your wallet to continue
        </Alert>
      )}

      {!isSameChain
        ?
        <>
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            Sell your NFT(s) for tokens or NFTs from {resolveNetworkName(chainId)} to
          </div>
          <div style={{ display: "flex", flexDirection: "row", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
            <SelectorItem onClick={() => setSameChain(1)}>
              <div style={{ margin: "auto" }}>
                <Chain
                  chainId={chainId}
                />
              </div>
            </SelectorItem>
            <SelectorItem disabled={MAINNET_CHAINS.includes(chainId)} onClick={() => !isMainnet && setSameChain(2)}>
              <div style={{ margin: "auto" }}>
                <Flex flexWrap="wrap">
                  {(TESTNET_CHAINS.includes(chainId) ? TESTNET_CHAINS : MAINNET_CHAINS).map((item, index) => {
                    return (
                      <Box key={index} width={[1 / 3]}>
                        <Chain
                          chainId={item}
                        />
                      </Box>
                    )
                  })}
                </Flex>
                <div style={{ fontSize: "14px", marginTop: "10px" }}><i>Mainnet's multi-chain will be available within Q1/2023</i></div>
              </div>
            </SelectorItem>
          </div>
          <Disclaimer>
            <ul>
              <li>
                You need to choose whether you want the transaction to be cross-chain enabled or not.
              </li>
              <li>
                Without cross-chain enabled, a self-contract contains the list of pair assets you're willing to accept as payment must be uploaded to IPFS. Only holders who have one of the assets can perform swaps in a decentralized manner.
              </li>
              <li>
                With cross-chainn enabled, it allows the asset to be sold across the networks, all transactions in the process will need to be verified from off-chain validator nodes as a first come first served basis.
              </li>
            </ul>
          </Disclaimer>
        </>
        :
        <>
          {/* {isSameChain === 1 ?
            <Description>
              Sell your asset from {resolveNetworkName(chainId)} to {resolveNetworkName(chainId)}
            </Description>
            :
            <Description>
              Sell your asset from {resolveNetworkName(chainId)} to {TESTNET_CHAINS.map((item, index) => `${resolveNetworkName(item)}${index !== (TESTNET_CHAINS.length - 1) ? ", " : ""}`)}
            </Description>
          } */}
          <HeaderSection>
            <div>

            </div>
            <div style={{ flex: 2 }}>
              <StepHeader>
                <Step active={step === 1}>
                  <div className="circle">1</div>
                  NFT(s) to be listed
                </Step>
                <Step active={step === 2}>
                  <div className="circle">2</div>NFT(s) or Tokens to be accepted
                </Step>
                <Step active={step === 3}>
                  <div className="circle">3</div>Review & Confirm
                </Step>
              </StepHeader>
            </div>
            <div style={{ textAlign: "right" }}>
              <a href="https://t.me/tamagofinance" target="_blank">
                Need Help?
              </a>
            </div>

          </HeaderSection>

          {/* From Section */}
          {step === 1 && (
            <From
              nfts={nfts}
              fromData={fromData}
              setFromData={setFromData}
              step={step}
              setStep={setStep}
              fromTokens={fromTokens}
              setFromTokens={setFromTokens}
              reset={reset}
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
              isSameChain={isSameChain}
              setSearchChain={setSearchChain}
              searchChain={searchChain}
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
              fromTokens={fromTokens}
              isMultiChain={isSameChain === 2 ? true : false}
            />
          )}
        </>
      }
    </div>
  );
};

export default CreateOrder;
