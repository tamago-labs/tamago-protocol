import { useWeb3React } from "@web3-react/core";
import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import Skeleton from "react-loading-skeleton";
import { Flex, Box } from 'reflexbox'
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { Alert } from "../alert";
import { ERC20_TOKENS } from "../../constants";
import { resolveNetworkName, shorterName } from "../../helper";
import { SelectableCard } from "../card";
import { Button } from "../button";
import { MOCKS } from ".";
import { ethers } from "ethers";
import { InputGroup } from "../input"
import LoadingIndicator from "../loadingIndicator";
import { CollectionCard } from "../collectionCard"

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 2rem;
`;

const Wrapper = styled.div`
  padding: 2rem;
  padding-top: 0rem;

`;

const TabBody = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-height: 650px;
  overflow-x: auto;
  padding-top: 1rem;
  padding-bottom: 1rem; 

`

const From = ({
  nfts,
  fromData,
  setFromData,
  step,
  setStep,
  fromTokens,
  setFromTokens,
  reset
}) => {
  const { chainId } = useWeb3React();

  const [activeTab, setActiveTab] = useState("1");
  const [tokenAmount, setTokenAmount] = useState([]);
  const [disabledCard, setDisabledCard] = useState(false);

  const toggle = (tab) => {
    setActiveTab(tab);
  };

  const tokens = useMemo(() => {
    const mocks = ERC20_TOKENS.filter(
      (item) => item.chainId === chainId && item.tokenType === 0
    )
    let intialAmount = [];
    for (let t of mocks) {
      intialAmount.push(100);
    }
    setTokenAmount(intialAmount);
    return mocks;
  }, [chainId]);

  const onClickCard = (nft) => {
    if (fromData.find((data) => data.token_hash === nft.token_hash)) {
      const newNFTArray = fromData.filter(
        (data) => data.token_hash !== nft.token_hash
      );
      setFromData(newNFTArray);
    } else {
      setFromData([...fromData, nft]);
    }
  };

  useEffect(() => {
    if (fromTokens.length + fromData.length >= 20) {
      setDisabledCard(true);
    }
  }, [fromTokens, fromData]);

  const collections = nfts ? nfts.reduce((arr, item) => {
    if (arr[item['token_address']]) {
      arr[item['token_address']].push(item['token_id'])
    } else {
      arr[item['token_address']] = [item['token_id']]
    }

    return arr
  }, []) : []

  return (
    <Wrapper>
      <Tabs>
        <TabList>
          <Tab >
            NFT(s) (Selected : {fromData ? fromData.length : 0})
          </Tab>
        </TabList>
        <TabPanel>
          <TabBody>
            {!nfts &&
              <>
                <LoadingIndicator />
              </>
            }
            <Flex style={{ width: "100%" }} flexWrap="wrap">
              {Object.keys(collections).map((item, index) => { 
                const metadata = collections[item].map(tokenId => {
                  let nft = nfts.find(nft => nft['token_address'] === item && nft['token_id'] ===tokenId)
                  if (nft && nft.metadata) {
                    nft.metadata['contract_type'] = nft.contract_type
                  }
                  return nft.metadata
                })
                return (
                  <Box p={1} width={[1 / 3]}>
                    <CollectionCard
                      key={index}
                      assetAddress={item}
                      tokens={collections[item]}
                      metadata={metadata}
                      chainId={chainId}
                      disabledCard={disabledCard}
                      onClickCard={onClickCard}
                      fromData={fromData}
                    />
                  </Box>
                )
              })}
            </Flex>
          </TabBody>
        </TabPanel>
      </Tabs>
      <ButtonContainer>
        <Button style={{ marginRight: "10px" }} onClick={() => reset()}>Back</Button>
        {fromData && <Button onClick={() => setStep(step + 1)}>Next</Button>}
      </ButtonContainer>
    </Wrapper>
  );
};

export default From;
