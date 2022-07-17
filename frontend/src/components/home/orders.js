import styled from "styled-components";
import { useWeb3React } from "@web3-react/core"
import { Container } from "reactstrap";
import { OptionsLarge } from "../input"
import { supportedChainIds } from "../../config/connectors";
import { resolveNetworkName } from "../../helper";
import { AssetCard } from "../card";
import useOrder from "../../hooks/useOrder";
import { useEffect, useState } from "react";
import { Button, ToggleButton } from "../../components/button"
import { Button as Button2 } from "reactstrap"
import { shorterName } from "../../helper"

const ButtonGroup = styled.div`
  display: flex; 
  margin-left: auto;
  margin-right: auto;
  justify-content: center; 

  button {
      :not(:first-child) {
          margin-left: 10px;
      }
  }
  `

const StyledContainer = styled(Container)`

`

const NetworkPanel = styled.div`
    text-align: center;
    padding: 1rem;
`

const Description = styled.p`
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    font-size: 14px;
    padding: 1.5rem;
`

const AllOrdersPanel = styled.div`
    display: flex;
    flex-wrap: wrap;  
`

const MAX_ITEMS = 8;

const NFTCard = ({
    delay,
    order
}) => {

    const { resolveMetadata, resolveTokenValue } = useOrder();
    const [data, setData] = useState();

    useEffect(() => {
        if (order && order.tokenType !== 0) {
            setTimeout(() => {
                resolveMetadata({
                    assetAddress: order.assetAddress,
                    tokenId: order.tokenId,
                    chainId: order.chainId,
                }).then(setData);
            }, delay * 1000);
        }

    }, [order, delay]);

    return (
        <AssetCard
            orderId={order.cid}
            image={order.tokenType === 0 ? "../images/coin.png" : data && data.metadata && data.metadata.image}
            chainId={order.chainId}
        >
            <div className="name">
                {order.tokenType !== 0
                    ?
                    <>{data && data.metadata && data.metadata.name}{` `}#{shorterName(order.tokenId)}</>
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
        </AssetCard>
    )
}

const Orders = () => {

    const [chain, setChain] = useState()
    const [orders, setOrders] = useState([])

    const [max, setMax] = useState(MAX_ITEMS);

    const { getAllOrders } = useOrder()

    useEffect(() => {
        setTimeout(() => {
            setChain(97)
        }, 500)
    }, [])

    useEffect(() => {
        if (chain) {
            setOrders([])
            setMax(MAX_ITEMS)
            getAllOrders(chain).then(setOrders)
        }

    }, [chain])

    return (
        <StyledContainer>

            <NetworkPanel>
                {/* <OptionsLarge
                    options={supportedChainIds.map(item => [item, resolveNetworkName(item)])}
                    setter={setChain}
                    getter={chain}
                /> */}
                
                <ButtonGroup>
                    {
                        supportedChainIds.map((item) => {
                            return (
                                <ToggleButton onClick={() => setChain(item)} active={chain === item}>
                                    {resolveNetworkName(item)}
                                </ToggleButton>
                            )
                        })
                    }
                </ButtonGroup>
                <Description>
                    20x is a decentralized universal marketplace powered by Filecoin allows anyone trade tokens for any tokens
                </Description>
            </NetworkPanel>

            <AllOrdersPanel>

                {(!orders || orders.length === 0) && <AssetCard />}

                {orders.length > 0 &&
                    orders.map((order, index) => {
                        if (index > max - 1) {
                            return;
                        }
                        return (
                            <NFTCard key={index} delay={index % MAX_ITEMS} order={order} />
                        );
                    })}

            </AllOrdersPanel>

            <div style={{ padding: "20px", marginTop: "1rem", textAlign: "center" }}>
                {orders.length > max && (
                    <Button onClick={() => setMax(max + 8)}>More...</Button>
                )}
            </div>

        </StyledContainer>
    )
}

export default Orders
