import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import { useWeb3React } from "@web3-react/core";
import { useMoralisWeb3Api } from "react-moralis";
import { Alert } from "../alert";
import From from "./from";
import To from "./to";
import Confirm from "./confirm";
import useOrder from "../../hooks/useOrder";

export const MOCKS = [
];

const Container = styled.div`

`

const Description = styled.p`
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  font-size: 16px;
  line-height: 22px;
  padding: 1.5rem;
  padding-top: 1rem;
  padding-bottom: 0px;
  text-align: center;
`;

const StepHeader = styled.div`
  margin-top: 32px;
  margin-bottom: 2rem;
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

export const PROCESS = {
  FILL: 0,
  GENERATE_ID: 1,
  DEPOSIT: 2,
  CONFIRM: 3,
  COMPLETE: 4,
};

const CreateOrder = () => {
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
  const { getMetadata } = useOrder();

  const [process, setProcess] = useState(PROCESS.FILL);

  const fetchNFTBalance = useCallback(
    async ({ chainId, account }) => {
      const options = {
        chain: `0x${chainId.toString(16)}`,
        address: account,
      };
      const { result } = await Web3Api.account.getNFTs(options);

      const data = await Promise.all(result.map((item) => getMetadata(item)));

      const filteredData = data.filter((nft) => nft.metadata);
      setNfts(filteredData);
    },
    [account, chainId]
  );

  useEffect(() => {
    setSearchNFT([]);
  }, [searchChain]);

  const fetchSearchNFTs = useCallback(
    async ({ searchText, chainId }) => {
      if (!searchText || searchText.length <= 2) return;
      setSearchLoading(true);
      const options = {
        q: searchText,
        chain: `0x${chainId.toString(16)}`,
        filter: searchFilter.join(","),
      };
      const { result } = await Web3Api.token.searchNFTs(options);
      const data = result.map((nft) => {
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

  useEffect(() => {
    if (!account && !chainId) return;

    setSearchChain(chainId);
    fetchNFTBalance({
      chainId,
      account,
    });
  }, [account, chainId]);

  return (
    <div>
      <Description>
        Simply list your asset by create a self-contract contains the list of pair assets and put it on Filecoin/IPFS networks
      </Description>

      {!account && (
        <Alert style={{ marginTop: "10px" }}>
          Connect your wallet to continue
        </Alert>
      )}

      <StepHeader>
        <Step active={step === 1}>
          <div className="circle">1</div>
          From Asset(s)
        </Step>
        <Step active={step === 2}>
          <div className="circle">2</div>To Asset(s)
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
          fromTokens={fromTokens}
          setFromTokens={setFromTokens}
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
          fromTokens={fromTokens}
        />
      )}
    </div>
  );
};

export default CreateOrder;
