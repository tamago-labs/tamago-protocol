import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import Skeleton from "react-loading-skeleton";
import {
  resolveBlockexplorerLink,
  resolveNetworkName,
  shorterName,
} from "../../helper";
import { Flex, Box } from 'reflexbox'
import { ethers } from "ethers";
import { InputGroup } from "../input"
import { X, DollarSign, Clipboard, ExternalLink } from "react-feather";
import { useWeb3React } from "@web3-react/core";
import { SelectableCard } from "../card";
import { ERC20_TOKENS, TESTNET_CHAINS } from "../../constants";
import { Button, ToggleButton } from "../button";
import { MOCKS } from ".";
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import LoadingIndicator from "../loadingIndicator";
import { CollectionCard } from "../collectionCard"

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
`;

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
`;

const Wrapper = styled.div`
  padding: 2rem;
  padding-top: 0rem;
`;

const ChainSelector = styled(({ className, setter, getter }) => {
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
  );
})`
  display: flex;
  margin-left: auto;
  margin-right: auto;
  justify-content: center;
  margin-bottom: 15px;
  margin-top: 15px;

  button {
    :not(:first-child) {
      margin-left: 10px;
    }
  }
`;


const TabBody = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-height: 650px;
  overflow-x: auto;
  padding-top: 1rem;
  padding-bottom: 1rem; 
`

const To = (props) => {

  const { isSameChain } = props

  if (isSameChain === 1) {
    return (
      <ToSameChain
        {...props}
      />
    )
  }

  return (
    <ToMultiChain
      {...props}
    />
  )

};


const ToSameChain = ({
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
  const { chainId } = useWeb3React();
  const [isNft, setNft] = useState(true);
  const [currentToken, setCurrentToken] = useState();
  const [tokenAmount, setTokenAmount] = useState([]);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (chainId && isNft) {
      setCurrentToken();
    }
  }, [chainId, isNft]);

  useEffect(() => {
    if (toData.length !== 0 || toTokens.length !== 0) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [toTokens, toData]);

  const onSearchTextChange = (e) => {
    setSearchText(e.target.value);
  };

  const onClickCard = (nft) => {
    if (toData.find((data) => data.token_hash === nft.token_hash)) {
      const newNFTArray = toData.filter(
        (data) => data.token_hash !== nft.token_hash
      );
      setToData(newNFTArray);
    } else {
      setToData([...toData, nft]);
    }
  };

  const onClickFilter = (filter) => {
    if (searchFilter.indexOf(filter) !== -1) {
      if (searchFilter.length <= 1) return;
      const newSearchFilter = searchFilter.filter((data) => data !== filter);
      setSearchFilter(newSearchFilter);
    } else {
      setSearchFilter([...searchFilter, filter]);
    }
  };

  const tokens = useMemo(() => {
    const mocks =
      ERC20_TOKENS.filter(
        (item) => item.chainId === chainId && (item.tokenType === 0 || item.tokenType === 3)
      )

    let intialAmount = [];
    for (let t of mocks) {
      intialAmount.push(100);
    }
    setTokenAmount(intialAmount);
    return mocks;
  }, [chainId]);

  const [activeTab, setActiveTab] = useState("2");

  const toggle = (tab) => {
    setActiveTab(tab);
  };

  const collections = searchNFT ? searchNFT.reduce((arr, item) => {
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
          <Tab>
            NFT(s) (Selected : {toData ? toData.length : 0})
          </Tab>
          <Tab>
            Tokens (Selected : {toTokens ? toTokens.length : 0})
          </Tab>
        </TabList>

        <TabPanel>
          <TabBody>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <div
                style={{
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginBottom: "1rem",
                  display: "flex",
                  flexDirection: "row"
                }}
              >
                <SearchInput value={searchText} onChange={onSearchTextChange} />
                <div style={{ marginTop: "auto", marginBottom: "auto", paddingTop: "10px" }}>
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
            </div>

            {searchNFT && !searchLoading
              ? (
                <Flex style={{ width: "100%" }} flexWrap="wrap">
                  {Object.keys(collections).map((item, index) => {
                    const metadata = collections[item].map(tokenId => {
                      let nft = searchNFT.find(nft => nft['token_address'] === item && nft['token_id'] ===tokenId)
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
                          metadata={metadata}
                          tokens={collections[item]}
                          chainId={chainId} 
                          onClickCard={onClickCard}
                          fromData={toData}
                        />
                      </Box>
                    )
                  })}
                </Flex>
              )
              : searchLoading && (
                <>
                  <LoadingIndicator /> 
                </>
              )}

          </TabBody>
        </TabPanel>

        <TabPanel>
          <TabBody>

            {tokens.map((token, index) => {
              const token_hash = `${token.chainId}${token.contractAddress}`;
              const isSelected = toTokens.find(
                (data) => data.token_hash === token_hash
              );

              return (
                <SelectableCard
                  key={index}
                  image={"./images/coin.png"}
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
                          tokenType: token.contractAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? 3 : 0,
                          chainId: token.chainId,
                          decimals: token.decimals,
                          symbol: token.symbol,
                          token_hash,
                        },
                      ]);
                    } else {
                      setToTokens(
                        toTokens.filter(
                          (item) => item.token_hash !== token_hash
                        )
                      );
                    }
                  }}
                >
                  <div style={{ color: "black", paddingTop: "10px" }}>
                    <InputGroup>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={tokenAmount[index]}
                        disabled={isSelected}
                        onChange={(e) => {
                          const amount = Number(e.target.value);
                          setTokenAmount(
                            tokenAmount.map((v, i) =>
                              i === index ? amount : v
                            )
                          );
                        }}
                      />
                      <span className="input-group-addon">
                        {token.symbol}
                      </span>
                    </InputGroup>
                  </div>
                </SelectableCard>
              );
            })}

          </TabBody>
        </TabPanel>



      </Tabs>

      <ButtonContainer>
        {step > 1 && <Button onClick={() => setStep(step - 1)}>Back</Button>}
        {toData && (
          <Button onClick={() => setStep(step + 1)} disabled={disabled}>
            Next
          </Button>
        )}
      </ButtonContainer>
    </Wrapper>
  );
}

const ToMultiChain = ({
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
  setSearchChain,
  searchChain,
}) => {
  const { chainId } = useWeb3React();
  const [isNft, setNft] = useState(true);
  const [currentToken, setCurrentToken] = useState();
  const [tokenAmount, setTokenAmount] = useState([]);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (searchChain && isNft) {
      setCurrentToken()
    }
  }, [searchChain, isNft])

  useEffect(() => {
    if (toData.length !== 0 || toTokens.length !== 0) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [toTokens, toData]);

  const onSearchTextChange = (e) => {
    setSearchText(e.target.value);
  };

  const onClickCard = (nft) => {
    if (toData.find((data) => data.token_hash === nft.token_hash)) {
      const newNFTArray = toData.filter(
        (data) => data.token_hash !== nft.token_hash
      );
      setToData(newNFTArray);
    } else {
      setToData([...toData, nft]);
    }
  };

  const onClickFilter = (filter) => {
    if (searchFilter.indexOf(filter) !== -1) {
      if (searchFilter.length <= 1) return;
      const newSearchFilter = searchFilter.filter((data) => data !== filter);
      setSearchFilter(newSearchFilter);
    } else {
      setSearchFilter([...searchFilter, filter]);
    }
  };

  const tokens = useMemo(() => {
    const mocks =
      ERC20_TOKENS.filter(
        (item) => item.chainId === searchChain && (item.tokenType === 0 || item.tokenType === 3)
      )

    let intialAmount = [];
    for (let t of mocks) {
      intialAmount.push(100);
    }
    setTokenAmount(intialAmount);
    return mocks;
  }, [searchChain]);

  return (
    <Wrapper>
      <Tabs>
        <TabList>
          <Tab>
            ERC-20
          </Tab>
          <Tab>
            NFT
          </Tab>
        </TabList>
        <TabPanel>
          <ChainSelector
            getter={searchChain}
            setter={setSearchChain}
          />
          <TabBody>
            {tokens.map((token, index) => {
              const token_hash = `${token.chainId}${token.contractAddress}`;
              const isSelected = toTokens.find(
                (data) => data.token_hash === token_hash
              );
              return (
                <SelectableCard
                  key={index}
                  image={"./images/coin.png"}
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
                          tokenType: token.contractAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? 3 : 0,
                          chainId: token.chainId,
                          decimals: token.decimals,
                          symbol: token.symbol,
                          token_hash,
                        },
                      ]);
                    } else {
                      setToTokens(
                        toTokens.filter(
                          (item) => item.token_hash !== token_hash
                        )
                      );
                    }
                  }}
                >
                  <div style={{ color: "black", paddingTop: "10px" }}>
                    <InputGroup>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={tokenAmount[index]}
                        disabled={isSelected}
                        onChange={(e) => {
                          const amount = Number(e.target.value);
                          setTokenAmount(
                            tokenAmount.map((v, i) =>
                              i === index ? amount : v
                            )
                          );
                        }}
                      />
                      <span className="input-group-addon">
                        {token.symbol}
                      </span>
                    </InputGroup>
                  </div>
                </SelectableCard>
              );
            })}

          </TabBody>
        </TabPanel>

        <TabPanel>
          <ChainSelector
            getter={searchChain}
            setter={setSearchChain}
          />
          <TabBody>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <div
                style={{
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginBottom: "1rem",
                  display: "flex",
                  flexDirection: "row"
                }}
              >
                <SearchInput value={searchText} onChange={onSearchTextChange} />
                <div style={{ marginTop: "auto", marginBottom: "auto", paddingTop: "10px" }}>
                  <Button
                    onClick={() =>
                      fetchSearchNFTs({
                        searchText,
                        chainId: searchChain
                      })
                    }
                  >
                    Search
                  </Button>
                </div>

              </div>
            </div>

            {searchNFT && !searchLoading
              ? searchNFT.map((nft, index) => (
                <>
                  <SelectableCard
                    image={nft.metadata.image}
                    chainId={searchChain}
                    selected={toData.find(
                      (data) => data.token_hash === nft.token_hash
                    )}
                    onClick={() => onClickCard({ ...nft, chainId: searchChain })}
                  >
                    <div className="name">
                      {shorterName(nft.metadata.name)}
                      {` `}#{shorterName(nft.token_id)}
                    </div>
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
          </TabBody>
        </TabPanel>
      </Tabs>
      <ButtonContainer>
        {step > 1 && <Button onClick={() => setStep(step - 1)}>Back</Button>}
        {toData && (
          <Button onClick={() => setStep(step + 1)} disabled={disabled}>
            Next
          </Button>
        )}
      </ButtonContainer>
    </Wrapper>
  );
}

export default To;
