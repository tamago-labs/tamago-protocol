import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link"
import { Briefcase } from "react-feather";
import styled from "styled-components";
import Skeleton from "react-loading-skeleton";
import { Puff } from "react-loading-icons";
import { useWeb3React } from "@web3-react/core";
import { Flex, Box } from 'reflexbox'
import useOrder from "../../hooks/useOrder";
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
  max-width: 1200px;
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
            <Info link={`?chain=${order.chainId}&address=${order.baseAssetAddress}`} name={"Collection"} value={collectionInfo && collectionInfo.title ? collectionInfo.title : shortAddress(order.baseAssetAddress)} />
            <Info name={"Status"} value={status ? "Sold" : "New"} />

          </div>

          <hr />

          {chainId !== order.chainId && (
            <Alert>Connect to correct network to trade</Alert>
          )}

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

        </Box>
      </Flex>

      {/* <Container>
      <Row>
        <Col sm="5">
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
        </Col>
        <Col style={{ paddingBottom: "4rem" }} sm="7">
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
            <Info link={`${order.chainId}/${order.baseAssetAddress}`} name={"Collection"} value={collectionInfo && collectionInfo.title ? collectionInfo.title : shortAddress(order.baseAssetAddress)} />
            <Info name={"Status"} value={status ? "Sold" : "New"} />

          </div>

          <hr />

          {chainId !== order.chainId && (
            <AlertWarning>Connect to correct network to trade</AlertWarning>
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              marginTop: "1rem",
            }}
          >
            {items.map((item, index) => {
              return (
                <NFTCard
                  key={index}
                  orderId={id}
                  order={order}
                  item={item}
                  account={account}
                  library={library}
                  baseMetadata={data}
                  index={index}
                  increaseTick={increaseTick}
                  tick={tick}
                />
              );
            })}
          </div>

          <hr />

          <Attribute>
            <Accordion open={open} toggle={toggle}>
              <AccordionItem>
                <AccordionHeader targetId="1">
                  Attributes ({data && data.metadata.attributes && data.metadata.attributes.length || 0})
                </AccordionHeader>
                <AccordionBody accordionId="1">

                  <Row>
                    {data && data.metadata && data.metadata.attributes && data.metadata.attributes.map((item, index) => {
                      return (
                        <Col sm="3" key={index} style={{ padding: 10 }}>
                          <div style={{ border: "1px solid white", height: "80px", borderRadius: "8px", padding: "10px", fontSize: "12px" }}>
                            <h5 style={{ fontSize: "16px" }}>{item.trait_type || "Key"}</h5>
                            <b>{item.value || "Value"}</b>
                          </div>
                        </Col>
                      )
                    })}
                  </Row>

                </AccordionBody>
              </AccordionItem>
              <AccordionItem>
                <AccordionHeader targetId="2">
                  Information
                </AccordionHeader>
                <AccordionBody accordionId="2">
                  <ListGroup>
                    <ListGroupItem>
                      <div>
                        Contract Addresss
                      </div>
                      <div>
                        <a target="_blank" href={resolveBlockexplorerLink(order.chainId, order.baseAssetAddress)}>
                          {shortAddress(order.baseAssetAddress)}
                        </a>
                      </div>
                    </ListGroupItem>
                    <ListGroupItem>
                      <div>
                        Token ID
                      </div>
                      <div>
                        #{shorterName(order.baseAssetTokenIdOrAmount)}
                      </div>
                    </ListGroupItem>
                    <ListGroupItem>
                      <div>
                        Token Standard
                      </div>
                      <div>
                        {order.baseAssetTokenType === 0 ? "ERC-20" : order.baseAssetTokenType === 1 ? "ERC-721" : "ERC-1155"}
                      </div>
                    </ListGroupItem>
                    <ListGroupItem>
                      <div>
                        Blockchain
                      </div>
                      <div>
                        {resolveNetworkName(order.chainId)}
                      </div>
                    </ListGroupItem>
                    <ListGroupItem>
                      <div>
                        Added
                      </div>
                      <div>
                        {new Date(Number(order.timestamp) * 1000).toLocaleDateString()}
                      </div>
                    </ListGroupItem>
                  </ListGroup>
                </AccordionBody>
              </AccordionItem>
            </Accordion>
          </Attribute>
        </Col>
      </Row>
    </Container > */}
    </Container>

  );
};

export default OrderDetails;