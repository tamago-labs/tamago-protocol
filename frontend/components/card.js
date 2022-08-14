import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import Skeleton from "react-loading-skeleton";
import Link from "next/link"
import { resolveNetworkName, shorterName } from "../helper";
import { Check } from "react-feather";
import useOrder from "../hooks/useOrder"

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
  cursor: pointer;
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

export const AssetCard = ({ children, image, chainId, orderId }) => (
  <BaseAssetCardContainer>
    <PreviewContainer>
      {image ? (
        <Link href={`/order?cid=${orderId}`}>
          <Image src={image} />
        </Link>
      ) : (
        <Link href={`/order?cid=${orderId}`}>
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

const CollectionCardContainer = styled.div`
  a {
    color: inherit;
  }

  width: 100%;
  padding: 10px;
  padding-left: 0px;
  padding-top: 5px;
  cursor: pointer;

  .--card {
    display: flex;
    color: black;
    background-color: white;
    border-radius: 6px;
    min-height: 60px;
    border: 1px solid transparent;
    padding: 12px;
    box-shadow: 5px 7px black;
  }
`;

export const CollectionCard = ({ children, image, chain, address }) => (
  <CollectionCardContainer>
    <Link href={`/collection?chain=${chain}&address=${address}`}>
      <div className="--card">{children}</div>
    </Link>
  </CollectionCardContainer>
);

const PairAssetCardContainer = styled(BaseAssetCardContainer)`
  width: 170px;
  min-height: 275px;
`;

const PairImage = styled(Image)`
  height: 160px;
`;

export const PairAssetCard = ({ children, image, chainId, balance }) => (
  <PairAssetCardContainer>
    <PreviewContainer style={{ height: "160px" }}>
      {image ? <PairImage src={image} /> : <Skeleton height="160px" />}
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
`;

export const SelectableCard = ({
  children,
  selected,
  image,
  chainId,
  onClick,
}) => (
  <SelectableCardContainer selected={selected}>
    <PreviewContainer style={{ cursor: "pointer" }} onClick={onClick}>
      {image ? <Image src={image} /> : <Skeleton height="220px" />}
      {chainId && (
        <ChainInfo>
          <div>{resolveNetworkName(chainId)}</div>
        </ChainInfo>
      )}
    </PreviewContainer>
    {children}
  </SelectableCardContainer>
);

export const SelectableCardCancelOrder = ({
  chainId,
  onClickCard,
  order,
  cancelData,
  account,
}) => {
  const [data, setData] = useState();

  const { resolveMetadata, resolveTokenValue } = useOrder();

  useEffect(() => {
    if (order && order.tokenType !== 0) {
      resolveMetadata({
        assetAddress: order.assetAddress,
        tokenId: order.tokenId,
        chainId: order.chainId,
      }).then(setData);
    }
  }, [account, chainId]);
  return (
    <SelectableCard
      image={
        order.tokenType === 0
          ? "../../images/coin.png"
          : data && data.metadata && data.metadata.image
      }
      chainId={chainId}
      selected={cancelData.find((data) => data.cid === order.cid)}
      onClick={() => onClickCard({ ...order, chainId })}
      account={account}
    >
      <div className="name">
        {order.tokenType !== 0 ? (
          <>
            {data && data.metadata.name
              ? data.metadata.name
              : `#${shorterName(order.tokenId)}`}
          </>
        ) : (
          <>
            {resolveTokenValue({
              assetAddress: order.assetAddress,
              tokenId: order.tokenId,
              chainId: order.chainId,
            })}
          </>
        )}
      </div>
    </SelectableCard>
  );
};

const CommonCardContainer = styled(BaseAssetCardContainer)`
  min-height: 225px;
`;

export const CommonCard = ({ children, image, chainId }) => (
  <CommonCardContainer>
    <PreviewContainer>
      {image ? <Image src={image} /> : <Skeleton height="220px" />}
      {chainId && (
        <ChainInfo>
          <div>{resolveNetworkName(chainId)}</div>
        </ChainInfo>
      )}
    </PreviewContainer>
    {children}
  </CommonCardContainer>
);
