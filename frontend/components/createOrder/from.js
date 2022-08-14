import { useWeb3React } from "@web3-react/core";
import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import Skeleton from "react-loading-skeleton";
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { Alert } from "../alert";
import { ERC20_TOKENS } from "../../constants";
import { resolveNetworkName, shorterName } from "../../helper";
import { SelectableCard } from "../card";
import { Button } from "../button";
import { MOCKS } from ".";
import { ethers } from "ethers";
import { InputGroup } from "../input"

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

  return (
    <Wrapper>



      <Tabs>

        <TabList>
          <Tab >
            NFT
          </Tab>
          <Tab>
            ERC-20
          </Tab>
        </TabList>

        <TabPanel>
          <TabBody>
            {nfts &&
              nfts.length > 0 &&
              nfts.map((nft, index) => (
                <SelectableCard
                  key={index}
                  image={nft.metadata.image}
                  chainId={chainId}
                  disabled={disabledCard}
                  selected={fromData.find(
                    (data) => data.token_hash === nft.token_hash
                  )}
                  onClick={() => onClickCard({ ...nft, chainId })}
                >
                  <div className="name">
                    {nft.name || nft.metadata.name}
                    {` `}#{shorterName(nft.token_id)}
                  </div>
                </SelectableCard>
              ))}
            {!nfts && (
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
        <TabPanel>
          <TabBody>
            {tokens.map((token, index) => {
              const token_hash = `${token.chainId}${token.contractAddress}`;
              const isSelected = fromTokens.find(
                (data) => data.token_hash === token_hash
              );
              return (
                <SelectableCard
                  key={index}
                  image={"../images/coin.png"}
                  chainId={chainId}
                  selected={isSelected}
                  disabled={disabledCard}
                  onClick={() => {
                    if (!isSelected) {
                      setFromTokens([
                        ...fromTokens,
                        {
                          chainId: token.chainId,
                          baseAssetAddress: token.contractAddress,
                          baseAssetTokenIdOrAmount: `${ethers.utils.parseUnits(
                            `${tokenAmount[index]}`,
                            token.decimals
                          )}`,
                          baseAssetTokenType: 0,
                          token_hash,
                          image: "../images/coin.png",
                          decimals: token.decimals,
                          symbol: token.symbol,
                        },
                      ]);
                    } else {
                      setFromTokens(
                        fromTokens.filter(
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
                      <span class="input-group-addon">
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
        {fromData && <Button onClick={() => setStep(step + 1)}>Next</Button>}
      </ButtonContainer>
    </Wrapper>
  );
};

export default From;
