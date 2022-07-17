import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Briefcase } from "react-feather"
import styled from "styled-components"
import Skeleton from "react-loading-skeleton"
import { Puff } from "react-loading-icons";
import { useWeb3React } from "@web3-react/core"
import useOrder from "../../hooks/useOrder"
import { Row, Col } from "reactstrap"
import { resolveNetworkName, shortAddress, shorterName } from "../../helper"
import { PairAssetCard } from "../card"
import SwapModal from "../modal/swapModal"
import { useERC1155 } from "../../hooks/useERC1155"
import { useERC20 } from "../../hooks/useERC20"
import { useERC721 } from "../../hooks/useERC721"
import { AlertWarning } from "../../components/alert"
import { Button2 } from "../../components/button"

const Container = styled.div.attrs(() => ({ className: "container" }))`
    margin-top: 1rem;
`

const Image = styled.img`
    width: 100%; 
`

const ImageContainer = styled.div`
    overflow: hidden;
    border-radius: 12px;
    
`

const Title = styled.div`
    font-size: 24px;
`

const Description = styled.div`
    font-size: 14px;
`

const StatusBar = styled.div`
    display: flex;

`

const L1Text = styled.div.attrs(() => ({ className: "name" }))` 
`

const L2Text = styled(L1Text)`
  display: inline;
  font-size: 12px; 
`

export const Info = styled(({ className, name, value, link }) => {
    return (
        <div className={className}>
            <label>{name}</label>
            {!link ? (
                <p>{value || <Skeleton width="80px" />}</p>
            ) : (
                <Link to={`/orders/owner/${link}`}>
                    <p>{value}</p>
                </Link>
            )}
        </div>
    )
})`
    display: inline-block;
    min-width: 100px;
    text-align: left;
    label {
      padding: 0px;
      margin: 0px;
      font-weight: 600;
      color: var(--secondary);
      font-size: 14px;
    }
    a {
      color: inherit;
      text-decoration: none;
    }
    margin-right: 10px;
  `

const NFTCard = ({
    orderId,
    order,
    item,
    account,
    library,
    baseMetadata,
    index,
    increaseTick,
}) => {

    const { resolveMetadata, resolveTokenValue, swap } = useOrder();
    const [data, setData] = useState();
    const [loading, setLoading] = useState()

    const [swapModalVisible, setSwapModalVisible] = useState(false)
    const { chainId } = useWeb3React();
    const [approved, setApproval] = useState(false)
    const [ownedItems, setOwnedItems] = useState(-1);
    const [tick, setTick] = useState()

    useEffect(() => {
        if (item && item.tokenType !== 0) {
            setTimeout(() => {
                resolveMetadata({
                    assetAddress: item.assetAddress,
                    tokenId: item.assetTokenIdOrAmount,
                    chainId: item.chainId,
                }).then(setData);
            }, index * 1000);
        }

    }, [item, index]);

    const assetAddressContractErc721 = useERC721(
        item.assetAddress,
        account,
        library
    );

    const assetAddressContractErc1155 = useERC1155(
        item.assetAddress,
        account,
        library
    );

    const contractErc20 = useERC20(
        item.assetAddress,
        account,
        library
    )

    useEffect(() => {
        if (account) {
            fetchItem();
        } else {
            setOwnedItems(undefined)
        }

    }, [account, item, tick]);

    const onApprove = useCallback(async () => {

        setLoading(true)

        try {

            if (item.tokenType === 0) {
                const { approve } = contractErc20
                await approve()
            }
            else if (item.tokenType === 1) {
                await assetAddressContractErc721.approve();
            }
            else if (item.tokenType === 2) {
                await assetAddressContractErc1155.approve(
                    item.assetTokenIdOrAmount
                );
            }
        } catch (e) {
            console.log(e.message)
        }

        setTick(tick + 1)
        setLoading(false)

    }, [order, item, tick, assetAddressContractErc721, assetAddressContractErc1155, contractErc20])


    const onSwap = useCallback(
        async () => {
            setLoading(true);

            try {

                const { index } = item

                const tx = await swap(orderId, order, index);
                await tx.wait();

                setSwapModalVisible(false)
                // toast.success("Your swap is completed!", {
                //     position: "top-right",
                //     autoClose: 5000,
                //     hideProgressBar: false,
                //     closeOnClick: true,
                //     progress: undefined,
                // });

            } catch (e) {
                console.log(e, e.error);

                const message = e.error && e.error.data && e.error.data.message ? e.error.data.message : e.message

                // toast.error(`${message}`, {
                //     position: "top-right",
                //     autoClose: 5000,
                //     hideProgressBar: false,
                //     closeOnClick: true,
                //     progress: undefined,
                // });

            }

            setLoading(false);
            increaseTick()
        },
        [orderId, order, swap, item]
    );

    const fetchItem = useCallback(async () => {

        console.log("start fetching...")

        setOwnedItems(undefined)
        setApproval(false)

        if (item.tokenType === 0) {
            const { getBalance, isApproved } = contractErc20
            const balance = await getBalance()
            setOwnedItems(balance);
            isApproved().then(setApproval)
        } else if (item.tokenType === 1) {
            const balance = await assetAddressContractErc721.getBalance();
            setOwnedItems(balance);
            assetAddressContractErc721.isApproved().then(setApproval)
        }
        else if (item.tokenType === 2) {
            const balance = await assetAddressContractErc1155.getTokenBalanceId(
                item.assetTokenIdOrAmount
            );
            setOwnedItems(balance.toString());
            assetAddressContractErc1155.isApproved().then(setApproval)
        }
    }, [assetAddressContractErc721, assetAddressContractErc1155, contractErc20])


    return (
        <>
            <SwapModal
                visible={swapModalVisible}
                toggle={() => setSwapModalVisible(!swapModalVisible)}
                loading={loading}
                item={item}
                order={order}
                onApprove={onApprove}
                onSwap={onSwap}
                pairMetadata={data}
                baseMetadata={baseMetadata}
                approved={approved}
            />
            <PairAssetCard
                image={item.tokenType === 0 ? "../images/coin.png" : data && data.metadata && data.metadata.image}
                // chainId={item.chainId}
                balance={(ownedItems !== undefined && item.chainId === chainId) ? <>{` ${ownedItems}`}</> : <>--</>}
            >
                <div className="name">
                    {item.tokenType !== 0
                        ?
                        <>{data && data.metadata && data.metadata.name}{` `}#{shorterName(item.assetTokenIdOrAmount)}</>
                        :
                        <>
                            {resolveTokenValue({
                                assetAddress: item.assetAddress,
                                tokenId: item.assetTokenIdOrAmount,
                                chainId: item.chainId
                            })}
                        </>
                    }
                </div>
                <div style={{ padding: "5px", textAlign: "center" }}>
                    <Button2
                        onClick={() => item.chainId === chainId && setSwapModalVisible(true)}
                        disabled={loading || !account}
                    >
                        {/* {loading && (
                            <Puff height="24px" style={{ marginRight: "5px" }} stroke="#7a0bc0" width="24px" />
                        )} */}
                        Swap
                    </Button2>
                </div>
                {/* <div style={{ textAlign: "center" }}>
                    <L2Text>
                        {(ownedItems !== undefined && item.chainId === chainId) ? <>{` ${ownedItems}`}</> : <Skeleton height="16px" />}
                    </L2Text>
                </div> */}
            </PairAssetCard>
        </>
    )
}

const OrderDetails = () => {
    const { account, library, chainId } = useWeb3React()

    const { getOrder, resolveMetadata, resolveTokenValue, resolveStatus } = useOrder()

    const [order, setOrder] = useState()
    const [data, setData] = useState()
    const [status, setStatus] = useState()
    const [tick, setTick] = useState(0)

    const { id } = useParams()

    const increaseTick = useCallback(() => {
        setTick(tick + 1)
    }, [tick])

    useEffect(() => {
        id && getOrder(id).then(setOrder)
    }, [id, getOrder])

    useEffect(() => {
        if (order && order.tokenType !== 0) {
            resolveMetadata({
                assetAddress: order.baseAssetAddress,
                tokenId: order.baseAssetTokenIdOrAmount,
                chainId: order.chainId,
            }).then(setData);
        }

    }, [order]);

    useEffect(() => {
        if (order) {
            resolveStatus({
                chainId: order.chainId,
                orderId: id,
            }).then(setStatus)
        }
    }, [id, order, tick])

    const items = useMemo(() => {
        if (order && order.barterList.length > 0) {
            const list = order.barterList.map((item, index) => {
                return {
                    ...item,
                    index,
                }
            })
            return list
        }
        return []
    }, [order])

    if (!order) {
        return <Container>Loading...</Container>
    }

    return (
        <Container>

            <Row>
                <Col sm="5">

                    <ImageContainer>
                        {
                            data && (
                                <Image
                                    src={data && data.metadata && data.metadata.image}
                                    alt="image"
                                />
                            )
                        }
                        {
                            order.baseAssetTokenType === 0 && (
                                <Image
                                    src={"../images/coin.png"}
                                    alt="image"
                                />
                            )
                        }
                        {
                            (order.baseAssetTokenType !== 0 && !data) && (
                                <Skeleton
                                    height="500px"
                                />
                            )
                        }
                    </ImageContainer>


                </Col>
                <Col sm="7">

                    {order.baseAssetTokenType !== 0 && (
                        <>
                            <Title>
                                {data && data.metadata && data.metadata.name ? data.metadata.name : order.title}
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
                                    chainId: order.chainId
                                })}{` `}For Sell
                            </Title>
                            <Description>
                                {/* {data && data.metadata && data.metadata.description} */}
                            </Description>
                        </>
                    )}

                    <div style={{ display: "flex", flexDirection: "row", marginTop: "1rem" }}>
                        <Info name={"Status"} value={status ? "Sold" : "New" } />
                        <Info name={"Chain"} value={resolveNetworkName(order.chainId)} />
                        <Info
                            name={"Added"}
                            value={new Date(
                                Number(order.timestamp) * 1000
                            ).toLocaleString()}
                        />
                    </div>

                    <hr />

                    {(chainId !== order.chainId) && (
                        <AlertWarning  >
                            Connect to correct network to trade
                        </AlertWarning>
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
                            )
                        })}
                    </div>
                </Col>
            </Row>

        </Container>
    )
}

export default OrderDetails