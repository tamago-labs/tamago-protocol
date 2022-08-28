import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link"
import { Briefcase } from "react-feather";
import styled from "styled-components";
import Skeleton from "react-loading-skeleton";
import { Puff } from "react-loading-icons";
import axios from "axios"
import { useWeb3React } from "@web3-react/core";
import { Flex, Box } from 'reflexbox'
import useOrder from "../../hooks/useOrder";
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
// import { Row, Col, Accordion, AccordionBody, AccordionHeader, AccordionItem, List, ListGroup, ListGroupItem } from "reactstrap";
import { resolveBlockexplorerLink, resolveNetworkName, shortAddress, shorterName } from "../../helper";
import { PairAssetCard } from "../card";
import { useERC1155 } from "../../hooks/useERC1155";
import { useERC20 } from "../../hooks/useERC20";
import { useERC721 } from "../../hooks/useERC721";
import { Alert } from "../../components/alert";
import { Button2 } from "../../components/button";
import { ethers } from "ethers";
import NFTCard from "./nftCard"
import PairAssetList from "./pairAssets"

const Container = styled.div`
  margin-top: 1rem;
  width: 100%;
  max-width: 1300px;
  margin-left: auto;
  margin-right: auto; 
`;

const Image = styled.img`
  width: 100%;
`;

const ImageContainer = styled.div`
  overflow: hidden;
  border-radius: 12px;
`;

const Title = styled.div`
  font-size: 24px;
  margin-bottom: 5px;
`;

const Description = styled.div`
  font-size: 16px;
  line-height: 22px;
`;

const StatusBar = styled.div`
  display: flex;
`;

const L1Text = styled.div.attrs(() => ({ className: "name" }))``;

const L2Text = styled(L1Text)`
  display: inline;
  font-size: 12px;
`;


const Attribute = styled.div` 

  .accordion-item {
    background: transparent;
    border: 1px solid white;
  }
  .accordion-header {
    
  }

  .list-group-item {
    color: white; 
    padding-top: 15px;
    font-size: 14px;
    padding-bottom: 15px;
    background: transparent;
    border: 1px solid white;
    div {
      flex: 1;
      a {
        color: inherit;
      }
      :last-child {
        text-align: right;
      }
    }
    display: flex;
    flex-direction: row;
    :not(:last-child) {
      border-bottom: 0px;
    }
  }

`


const Attributes = styled.div`
  margin-top: 20px;
  margin-bottom: 3rem;
`

const AttributeItem = styled.div`
  border: 1px solid #ddd;
  margin-top: -1px; 
  padding: 12px; 
  display: flex;
  flex-direction: row;
  div {
    flex: 1;
  }
`



export const Info = styled(({ className, name, value, link }) => {
  return (
    <div className={className}>
      <label>{name}</label>
      {!link ? (
        <p>{value || <Skeleton width="80px" />}</p>
      ) : (
        <Link href={`/collection/${link}`}>
          <p style={{ textDecoration: "underline", cursor: "pointer" }}>{value}</p>
        </Link>
      )}
    </div>
  )
})`
  display: inline-block;
  min-width: 100px;
  text-align: left;
  flex: 1;
  label {
    padding: 0px;
    margin: 0px;
    font-weight: 600;
    color: var(--secondary);
    font-size: 14px;
  }
  p {
    margin: 0px;
    padding: 0px;
    padding-top: 5px;
    padding-bottom: 5px;
  }
  a {
    color: inherit;
    text-decoration: none;
  } 
`;


const OrderDetails = ({
  cid
}) => {

  const id = cid

  const { account, library, chainId } = useWeb3React();

  const { getOrder, resolveMetadata, resolveTokenValue, resolveStatus, getCollectionInfo } =
    useOrder();

  const [open, setOpen] = useState('2');
  const toggle = (id) => {
    open === id ? setOpen() : setOpen(id);
  };

  const [order, setOrder] = useState();
  const [data, setData] = useState();
  const [status, setStatus] = useState();
  const [tick, setTick] = useState(0);
  const [collectionInfo, setCollectionInfo] = useState()
  const [slug, setSlug ] = useState()

  const increaseTick = useCallback(() => {
    setTick(tick + 1);
  }, [tick]);

  useEffect(() => {
    id && getOrder(id).then(setOrder);
  }, [id, getOrder]);

  useEffect(() => {
    if (order && order.tokenType !== 0) {
      resolveMetadata({
        assetAddress: order.baseAssetAddress,
        tokenId: order.baseAssetTokenIdOrAmount,
        chainId: order.chainId,
      }).then(setData);
      getCollectionInfo(order.baseAssetAddress, order.chainId).then(setCollectionInfo)
    }
  }, [order]);

  useEffect(() => {
    if (order) {
      axios.get(`https://api.tamagonft.xyz/v1/dashboard`).then(
        ({data}) => {
          const { collections } = data

          const collection = collections.find(item => item.chainId === order.chainId && item.assetAddress === order.baseAssetAddress)

          if (collection && collection.slug) {
            setSlug(collection.slug)
          }

        }
      )
    } 
  },[order])

  useEffect(() => {
    if (order) {
      resolveStatus({
        chainId: order.chainId,
        orderId: id,
      }).then(setStatus);
    }
  }, [id, order, tick]);

  const items = useMemo(() => {
    if (order && order.barterList.length > 0) {
      const list = order.barterList.map((item, index) => {
        return {
          ...item,
          index,
        };
      });
      return list;
    }
    return [];
  }, [order]);

  if (!order) {
    return <Container><div style={{ textAlign: "center", padding: "3rem", display: "flex", flexDirection: "row" }}>
      <div style={{ margin: "auto", display: "flex", flexDirection: "row" }}>
        <Puff height="24px" />{` `}<div>Loading...</div>
      </div>
    </div></Container>;
  }

  return (
    <>
      {chainId !== order.chainId && (
        <Alert>Connect to correct network to trade</Alert>
      )}
      <Container>
        <Flex flexWrap='wrap'>
          {/* IMAGE */}
          <Box
            width={[1, 5 / 12]}
            p={3}>
            <ImageContainer>
              {data && (
                <Image
                  src={data && data.metadata && data.metadata.image}
                  alt="image"
                />
              )}
              {order.baseAssetTokenType === 0 && (
                <Image src={"../images/coin.png"} alt="image" />
              )}
              {order.baseAssetTokenType !== 0 && !data && (
                <Skeleton height="500px" />
              )}
            </ImageContainer>
          </Box>
          {/* INFO */}
          <Box
            width={[1, 7 / 12]}
            p={3}>

            {order.baseAssetTokenType !== 0 && (
              <>
                <Title>
                  {data && data.metadata && data.metadata.name
                    ? data.metadata.name
                    : order.title}
                </Title>
                <Description>
                  {data && data.metadata && data.metadata.description}
                </Description>
              </>
            )}

            {order.baseAssetTokenType === 0 && (
              <>
                <Title>
                  {resolveTokenValue({
                    assetAddress: order.baseAssetAddress,
                    tokenId: order.baseAssetTokenIdOrAmount,
                    chainId: order.chainId,
                  })}
                  {` `}For Sell
                </Title>
              </>
            )}

            <div
              style={{ display: "flex", flexDirection: "row", marginTop: "1rem" }}
            >
              <Info link={slug} name={"Collection"} value={collectionInfo && collectionInfo.title ? collectionInfo.title : shortAddress(order.baseAssetAddress)} />
              <Info name={"Status"} value={status ? "Sold" : "New"} />

            </div>

            <hr />


            <PairAssetList
              id={id}
              account={account}
              library={library}
              data={data}
              increaseTick={increaseTick}
              tick={tick}
              items={items}
              order={order}
            />

            <hr />

            <Tabs style={{ marginTop: "1rem" }}>
              <TabList>
                <Tab>
                  Information
                </Tab>
                <Tab>
                  Attributes ({data && data.metadata.attributes && data.metadata.attributes.length || 0})
                </Tab>
              </TabList>
              <TabPanel>
                <Attributes>
                  <AttributeItem>
                    <div>
                      Contract Addresss
                    </div>
                    <div>
                      <a rel="noreferrer" target="_blank" href={resolveBlockexplorerLink(order.chainId, order.baseAssetAddress)}>
                        {shortAddress(order.baseAssetAddress)}
                      </a>
                    </div>
                  </AttributeItem>
                  <AttributeItem>
                    <div>
                      Token ID
                    </div>
                    <div>
                      #{shorterName(order.baseAssetTokenIdOrAmount)}
                    </div>
                  </AttributeItem>
                  <AttributeItem>
                    <div>
                      Token Standard
                    </div>
                    <div>
                      {order.baseAssetTokenType === 0 ? "ERC-20" : order.baseAssetTokenType === 1 ? "ERC-721" : "ERC-1155"}
                    </div>
                  </AttributeItem>
                  <AttributeItem>
                    <div>
                      Blockchain
                    </div>
                    <div>
                      {resolveNetworkName(order.chainId)}
                    </div>
                  </AttributeItem>
                  <AttributeItem>
                    <div>
                      Added
                    </div>
                    <div>
                      {new Date(Number(order.timestamp) * 1000).toLocaleDateString()}
                    </div>
                  </AttributeItem>
                </Attributes>
              </TabPanel>
              <TabPanel>
                <Flex flexWrap='wrap' style={{ marginBottom: "3rem" }}>
                  {data && data.metadata && data.metadata.attributes && data.metadata.attributes.map((item, index) => {
                    return (
                      <Box
                        key={index}
                        width={[1 / 3]}
                        p={1}>
                        <div style={{ border: "1px solid white", height: "80px", borderRadius: "8px", padding: "15px", fontSize: "14px" }}>
                          <h5 style={{ fontSize: "18px", padding: "0px", margin: "0px", marginBottom: "5px" }}>{item.trait_type || "Key"}</h5>
                          <b>{item.value || "Value"}</b>
                        </div>
                      </Box>
                    )
                  })}
                </Flex>
              </TabPanel>
            </Tabs>
          </Box>
        </Flex>
      </Container>
    </>


  );
};

export default OrderDetails;