import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import Skeleton from "react-loading-skeleton";
import { Badge } from "reactstrap";
import { Link } from "react-router-dom";
import { resolveNetworkName } from "../helper";

const AssetCardContainer = styled.div`
  background-color: white;
  width: 260px;
  min-height: 300px;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid transparent;
  margin-left: 5px;
  margin-right: 5px;
  margin-bottom: 10px;
  box-shadow: 5px 7px black;

  .name {
    color: black;
    margin-top: 12px;
    text-align: center;
  }
`;

const BaseAssetCardContainer = styled(AssetCardContainer)`
  &:hover {
    border: 1px solid pink;
  }
`;

export const PreviewContainer = styled.div`
  height: 220px;
  overflow: visible;
  position: relative;
`;

const Image = styled.img`
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 220px;
  border-radius: 20px;
`;

const ChainInfo = styled.div`
  position: absolute;
  bottom: 0px;
  left: 0px;
  z-index: 10;
  width: 100%;
  display: flex;
  background: #fa58b6;
  height: 20px;
  border-radius: 0px 0px 20px 20px;
  div {
    margin-left: auto;
    margin-right: auto;
    font-size: 12px;
    color: white;
  }
`;

const NewRibbon = styled.div`
  position: absolute;
  top: 30px;
  left: -30px;
  z-index: 10;
  width: 50%;
  display: flex;
  background: #ffc107;
  height: 20px;
  border-radius: 20px 20px 0px 0px;
  transform: rotate(-45deg);
  div {
    margin-left: auto;
    margin-right: auto;
    font-size: 16px;
    color: #000;
  }
`;

const ChainBadge = styled(Badge).attrs(() => ({ color: "success" }))`
  margin-left: auto;
  margin-right: auto;
`;

const ThreeDotsButton = styled.button`
  div {
    background-color: #fa58b6;
    border-radius: 50%;
  }
`;

const SoldBanner = styled.div`
  position: absolute;
  top: 25%;
  left: 25%;
  z-index: 10;
  width: 50%;
  display: flex;
  background: #adb5bd;
  height: 20px;
  /* border-radius: 20px 20px 0px 0px; */
  transform: rotate(-20deg);

  div {
    margin-left: auto;
    margin-right: auto;
    font-size: 16px;
    color: #000;
  }
`;

const AVALABLE_TESTNET_OPENSEA = ["Ropsten", "Rinksby", "Goerli", "Mumbai"];
const AVALABLE_MAINNET_OPENSEA = ["Polygon", "Ethereum"];

export const AssetCard = ({
  children,
  image,
  chainId,
  orderId
}) => (
  <BaseAssetCardContainer>

    <PreviewContainer>
      {image ? (
        <Link to={`/order/${orderId}`}>
          <Image src={image} />
        </Link>
      ) : (
        <Link to={`/order/${orderId}`}>
          <Skeleton height="220px" />
        </Link>
      )}
      {chainId && (
        <ChainInfo>
          <div>{resolveNetworkName(chainId)}</div>
        </ChainInfo>
      )}

    </PreviewContainer>

    {children}
  </BaseAssetCardContainer>
);

const PairAssetCardContainer = styled(BaseAssetCardContainer)`
  width: 170px;
  min-height: 275px;
  
`

const PairImage = styled(Image)`
  height: 160px;
`


export const PairAssetCard = ({
  children,
  image,
  chainId,
  balance
}) => (
  <PairAssetCardContainer>

    <PreviewContainer style={{ height: "160px" }}>
      {image ? (
        <PairImage src={image} />
      ) : (
        <Skeleton height="160px" />
      )}
      {chainId && (
        <ChainInfo>
          <div>{resolveNetworkName(chainId)}</div>
        </ChainInfo>
      )}
      {balance && (
        <ChainInfo>
          <div>{balance}</div>
        </ChainInfo>
      )}

    </PreviewContainer>

    {children}
  </PairAssetCardContainer>
);



const SelectableCardContainer = styled(BaseAssetCardContainer)`
     min-height: 225px;
       opacity: ${(props) => (props.selected ? "0.64" : "100")};
   border: ${(props) =>
    props.selected ? "1px solid pink" : "1px solid transparent"};

`

export const SelectableCard = ({
  children,
  selected,
  image,
  chainId,
  onClick
}) => (
  <SelectableCardContainer selected={selected}>

    <PreviewContainer style={{ cursor: "pointer" }} onClick={onClick} >
      {image ? (
        <Image src={image} />
      ) : (
        <Skeleton height="220px" />
      )}
      {chainId && (
        <ChainInfo>
          <div>{resolveNetworkName(chainId)}</div>
        </ChainInfo>
      )}

    </PreviewContainer>

    {children}
  </SelectableCardContainer>
);


const CommonCardContainer = styled(BaseAssetCardContainer)`
  min-height: 225px;

`

export const CommonCard = ({
  children,
  image,
  chainId
}) => (
  <CommonCardContainer>

    <PreviewContainer>
      {image ? (
        <Image src={image} />
      ) : (
        <Skeleton height="220px" />
      )}
      {chainId && (
        <ChainInfo>
          <div>{resolveNetworkName(chainId)}</div>
        </ChainInfo>
      )}

    </PreviewContainer>
    {children}
  </CommonCardContainer>
)


