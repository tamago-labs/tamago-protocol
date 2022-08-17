
import { useEffect, useMemo, useState } from "react";
import Link from "next/link"
import { AssetCard } from "./card";
import useOrder from "../hooks/useOrder";
import { shorterName } from "../helper"
import styled from "styled-components";
import { Flex, Box } from 'reflexbox'
import { PairAssetCardMini } from "./card";


const NFTCard = ({
    delay,
    order,
    children
}) => {

    const { resolveMetadata, resolveTokenValue } = useOrder();
    const [data, setData] = useState();

    useEffect(() => {
        if (order && order.tokenType !== 0) {
            resolveMetadata({
                assetAddress: order.assetAddress,
                tokenId: order.tokenId,
                chainId: order.chainId,
            }).then(setData);
        }

    }, [order, delay]);

    return (
        <>
            <AssetCard
                orderId={order.cid}
                image={order.tokenType === 0 ? "./images/coin.png" : data && data.metadata && data.metadata.image}
                chainId={order.chainId}
            >
                <div className="name">
                    {order.tokenType !== 0
                        ?
                        <>{data && data.metadata.name ? data.metadata.name : `#${shorterName(order.tokenId)}`}</>
                        :
                        <>
                            {resolveTokenValue({
                                assetAddress: order.assetAddress,
                                tokenId: order.tokenId,
                                chainId: order.chainId
                            })}
                        </>
                    }
                </div>
                {children}
            </AssetCard>
        </>
    )
}

const OrderCardContainer = styled.div`
    width: 100%;
    cursor: pointer;
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
    height: 110px;
    margin-top: 15px;
    background-color: white;
    border-radius: 6px;
    padding: 12px;
    border: 1px solid transparent;
    box-shadow: 5px 7px black;
    color: black;

    ${props => props.invert && `
        background: #20283E;
        border: 1px solid white;
        color: white;
    `}

`


const ImagePreview = styled(Box)`
    img {
        width: 80px;
    }
`

const Name = styled(Box)`

    padding-top: 10px; 

    h4, p {
        margin: 0px;
        padding: 0px;
    }
    h4 {
        margin-bottom: 10px;
    }
`

const PairMini = ({
    item,
    delay
}) => {

    const [data, setData] = useState();
    const [tokenValue, setTokenValue] = useState()
    const { resolveMetadata, resolveTokenValue, getOrder } = useOrder();

    useEffect(() => {

        if (item && (item.tokenType === 1 || item.tokenType === 2)) {
            resolveMetadata({
                assetAddress: item.assetAddress,
                tokenId: item.assetTokenIdOrAmount,
                chainId: item.chainId,
            }).then(setData);
        } else {
            if (item && (item.tokenType === 0 || item.tokenType === 3)) {
                const value = resolveTokenValue({
                    assetAddress: item.assetAddress,
                    tokenId: item.assetTokenIdOrAmount,
                    chainId: item.chainId,
                })
                setTokenValue(value)
            }

        }

    }, [item, delay]);


    return (
        <PairAssetCardMini
            image={
                (item.tokenType === 0 || item.tokenType === 3)
                    ? "./images/coin.png"
                    : data && data.metadata && data.metadata.image
            }
            chainId={item.chainId}
            tokenValue={tokenValue}
        >

        </PairAssetCardMini>
    )
}

export const OrderCard = ({
    delay,
    order,
    children
}) => {

    const { fromGateway, cid } = order

    const { resolveMetadata, resolveTokenValue, getOrder } = useOrder();
    const [data, setData] = useState();
    const [orderDetails, setOrderDetails] = useState()

    useEffect(() => {
        if (order && order.tokenType !== 0) {
            resolveMetadata({
                assetAddress: order.assetAddress,
                tokenId: order.tokenId,
                chainId: order.chainId,
            }).then(setData);
        }

    }, [order, delay]);

    useEffect(() => {
        setTimeout(() => {
            cid && getOrder(cid).then(setOrderDetails);
        }, delay);
    }, [cid, getOrder, delay]);

    const items = useMemo(() => {
        if (orderDetails && orderDetails.barterList.length > 0) {
            const list = orderDetails.barterList.map((item, index) => {
                return {
                    ...item,
                    index,
                };
            });

            return list;
        }
        return [];
    }, [orderDetails]);

    return (
        <Link href={fromGateway ? `/order/x?cid=${cid}` : `/order?cid=${cid}`}>
            <OrderCardContainer invert={fromGateway}>
                <Flex flexWrap='wrap'>
                    <ImagePreview
                        width={[2 / 12]}
                    >
                        <img src={order.tokenType === 0 ? "./images/coin.png" : data && data.metadata && data.metadata.image} />
                    </ImagePreview>
                    <Name
                        width={[2 / 12]}
                    >
                        <h4>Name</h4>
                        <p>
                            {order.tokenType !== 0
                                ?
                                <>{data && data.metadata.name ? data.metadata.name : `#${shorterName(order.tokenId)}`}</>
                                :
                                <>
                                    {resolveTokenValue({
                                        assetAddress: order.assetAddress,
                                        tokenId: order.tokenId,
                                        chainId: order.chainId
                                    })}
                                </>
                            }
                        </p>
                    </Name>
                    <Name
                        width={[5 / 12]}
                    >
                        <h4>Available to Swap With</h4>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            {items.map((item, index) => {

                                return (
                                    <PairMini
                                        item={item}
                                        delay={index * 300}
                                    />
                                );
                            })}
                        </div>
                    </Name>
                    <Name
                        width={[3 / 12]}
                    >
                        <h4>Date Created</h4>
                        <p>
                            {new Date(Number(order.timestamp)).toLocaleString()}
                        </p>
                    </Name>
                </Flex>
                {children}
            </OrderCardContainer>
        </Link>
    )
}

export default NFTCard