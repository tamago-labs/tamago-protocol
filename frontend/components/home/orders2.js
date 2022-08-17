import styled from "styled-components";
import { useEffect, useState } from "react";
import { ToggleButton } from "../button";
import { Puff } from 'react-loading-icons'
import { NETWORK } from "../../config/network"
import useMarketplace from "../../hooks/useMarketplace"
import useOrder from "../../hooks/useOrder";
import { OrderCard } from "../nftCard"


const Container = styled.div`

`

const AllOrdersPanel = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 20px;
`;


const MainnetOrTestnetSection = styled.div`
    justify-content: center;
    flex: 1;
    height: 20px;
    font-size: 12px;
    display: flex;
    margin-bottom: 15px;
`

const ChainSelection = styled(MainnetOrTestnetSection)`

`

const ButtonGroup = styled.div`
  display: flex;   
  flex-wrap: wrap; 
  justify-content: center;

  button {
      
      margin-top: 10px;
      :not(:first-child) {
          margin-left: 10px;
      }
  }
`;


const Orders = () => {

    const [isMainnet, setIsMainnet] = useState(false)

    const [chain, setChain] = useState();
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState([]);
    const { getAllOrders } = useOrder()


    useEffect(() => {
        if (chain) {
            setLoading(true)
            setOrders([])
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
                setChain(43114)
            }
        }, 500)
    }, [])

    useEffect(() => {
        setTimeout(() => {
            if (localStorage.getItem("mainnetOrTestnet")) {
                setIsMainnet((localStorage.getItem("mainnetOrTestnet") === "mainnet" ? true : false))
            } else {
                setIsMainnet(false)
            }
        }, 500)
    }, [])

    const getIcon = (chainId) => {
        const network = NETWORK.find(item => parseInt(chainId) === parseInt(item.chainId, 16))
        return network ? network.icon : "https://cdn-icons-png.flaticon.com/512/545/545685.png"
    }

    const updateIsMainnet = (isMainnet) => {
        setIsMainnet(isMainnet)
        localStorage.setItem("mainnetOrTestnet", isMainnet ? "mainnet" : "testnet")
    }

    const updateChain = (chainId) => {
        setChain(chainId)
        localStorage.setItem("chainId", `${chainId}`)
    }
    return (
        <Container>

            <MainnetOrTestnetSection>
                <div style={{ marginTop: "13px" }}>
                    Network :
                </div>
                <ButtonGroup style={{ marginLeft: "10px" }}>
                    <ToggleButton onClick={() => updateIsMainnet(true)} active={isMainnet}>
                        <div>
                            {`Mainnet`}
                        </div>
                    </ToggleButton>
                    {` `}
                    <ToggleButton onClick={() => updateIsMainnet(false)} active={!isMainnet}>
                        <div>
                            {`Testnet`}
                        </div>
                    </ToggleButton>
                </ButtonGroup>
            </MainnetOrTestnetSection>

            <ChainSelection>
                <div style={{ marginTop: "22px" }}>
                    Chain :
                </div>
                <ButtonGroup style={{ marginLeft: "10px" }}>

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
            </ChainSelection>

            {loading &&
                <div style={{ textAlign: "center", padding: "3rem", display: "flex", flexDirection: "row" }}>
                    <div style={{ margin: "auto", display: "flex", flexDirection: "row" }}>
                        <Puff height="24px" />{` `}<div>Loading...</div>
                    </div>
                </div>
            }
            <>
                <AllOrdersPanel>
                    {(orders.length > 0) &&
                        orders.map((order, index) => { 
                            return (
                                <OrderCard key={index} delay={index * 300} order={order}>

                                </OrderCard>
                            );
                        })}

                </AllOrdersPanel>
            </>


        </Container>
    )
}

export default Orders