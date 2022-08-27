import react, { useState, useEffect, useContext } from "react"
import styled from "styled-components";
import { ToggleButton, Button } from "../button";
import { Puff } from 'react-loading-icons'
import { Flex, Box } from 'reflexbox'
import { NETWORK } from "../../config/network"
import useMarketplace from "../../hooks/useMarketplace"
import useOrder from "../../hooks/useOrder";
import { OrderCard } from "../nftCard"
import { AccountContext } from "../../hooks/useAccount";
import Container from "../container";

const MAX_ITEMS = 5;

const Header = styled(Flex).attrs(() => ({ flexWrap: "wrap" }))`
    padding: 10px;
`

const Title = styled(Box).attrs(() => ({ width: [1, 1 / 4] }))`
    font-size: 22px;
    font-weight: 600; 
    padding-top: 10px;
`

const ChainSelector = styled(Box).attrs(() => ({ width: [1, 3 / 4] }))`
    font-size: 14px;
    display: flex;
    flex-direction: row; 
    justify-content: flex-end;
    align-items : flex-end; 
`

const ButtonGroup = styled.div`
  display: flex;   
  flex-wrap: wrap;

  button {
      
      margin-top: 10px;
      :not(:first-child) {
          margin-left: 10px;
      }
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column; 
  width: 100%;
`;


const Orders = () => {

    const { isMainnet } = useContext(AccountContext)

    const [chain, setChain] = useState();
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState([]);
    const { getAllOrders } = useOrder()
    const [max, setMax] = useState(MAX_ITEMS);

    const getIcon = (chainId) => {
        const network = NETWORK.find(item => parseInt(chainId) === parseInt(item.chainId, 16))
        return network ? network.icon : "https://cdn-icons-png.flaticon.com/512/545/545685.png"
    }

    useEffect(() => {
        if (chain) {
            setLoading(true)
            setOrders([])
            setMax(MAX_ITEMS)
            getAllOrders(chain).then(
                (orders) => {
                    setOrders(orders)
                }
            ).finally(
                () => {
                    setLoading(false)
                }
            )
        }

    }, [chain])

    useEffect(() => {
        setTimeout(() => {
            if (localStorage.getItem("chainId")) {
                setChain(Number(localStorage.getItem("chainId")))
            } else {
                setChain(isMainnet ? 43114 : 42)
            }
        }, 500)
    }, [isMainnet])

    const updateChain = (chainId) => {
        setChain(chainId)
        localStorage.setItem("chainId", `${chainId}`)
    }

    return (
        <Container>
            <Header>
                <Title>
                    Recent Listings ({orders.length || 0})
                </Title>
                <ChainSelector>
                    <ButtonGroup>
                        {isMainnet ?
                            <>
                                <ToggleButton onClick={() => updateChain(43114)} active={chain === 43114}>
                                    <img src={getIcon(43114)} />{` `}<div>Avalanche</div>
                                </ToggleButton>
                                <ToggleButton onClick={() => updateChain(56)} active={chain === 56}>
                                    <img style={{ borderRadius: "50%" }} width={30} src={getIcon(56)} />{` `}<div>BNB</div>
                                </ToggleButton>
                                <ToggleButton onClick={() => updateChain(25)} active={chain === 25}>
                                    <img style={{ borderRadius: "50%" }} width={30} src={getIcon(25)} />{` `}<div>Cronos</div>
                                </ToggleButton>
                                <ToggleButton onClick={() => updateChain(1)} active={chain === 1}>
                                    <img style={{ borderRadius: "50%" }} width={30} src={getIcon(1)} />{` `}<div>Ethereum</div>
                                </ToggleButton>
                                <ToggleButton onClick={() => updateChain(137)} active={chain === 137}>
                                    <img style={{ borderRadius: "50%" }} width={30} src={getIcon(137)} />{` `}<div>Polygon</div>
                                </ToggleButton>
                            </>
                            :
                            <>
                                <ToggleButton onClick={() => updateChain(42)} active={chain === 42}>
                                    <img src={getIcon(42)} />{` `}
                                    <div>
                                        Kovan
                                    </div>
                                </ToggleButton>
                                <ToggleButton onClick={() => updateChain(80001)} active={chain === 80001}>
                                    <img src={getIcon(80001)} />{` `}
                                    <div>
                                        Mumbai
                                    </div>
                                </ToggleButton>
                                <ToggleButton onClick={() => updateChain(97)} active={chain === 97}>
                                    <img src={getIcon(97)} />{` `}
                                    <div>
                                        BNB Testnet
                                    </div>
                                </ToggleButton>
                                <ToggleButton onClick={() => updateChain(43113)} active={chain === 43113}>
                                    <img src={getIcon(43113)} />{` `}
                                    <div>
                                        Fuji Testnet
                                    </div>
                                </ToggleButton>
                            </>
                        }
                    </ButtonGroup>
                </ChainSelector>
            </Header>
            {loading &&
                <div style={{ textAlign: "center", padding: "3rem", display: "flex", flexDirection: "row" }}>
                    <div style={{ margin: "auto", display: "flex", flexDirection: "row" }}>
                        <Puff height="24px" />{` `}<div>Loading...</div>
                    </div>
                </div>
            }
            <>
                <Body>
                    {(orders.length > 0) &&
                        orders.map((order, index) => {
                            if (index > max - 1) {
                                return;
                              }
                            return (
                                <OrderCard key={index} delay={index % MAX_ITEMS} order={order}>

                                </OrderCard>
                            );
                        })}

                </Body>
                <div style={{ padding: "20px", marginTop: "1rem", textAlign: "center"}}>
                    {orders.length > max && (
                        <Button style={{marginLeft : "auto", marginRight: "auto"}} onClick={() => setMax(max + 5)}>View More Items...</Button>
                    )}
                </div>
            </>
        </Container>
    )
}

export default Orders