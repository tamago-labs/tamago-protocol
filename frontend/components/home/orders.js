import styled from "styled-components";
import { useWeb3React } from "@web3-react/core";
import { Flex, Box } from 'reflexbox'
import { OptionsLarge } from "../input";
import { supportedChainIds } from "../../config/connectors";
import { resolveNetworkName, shortAddress } from "../../helper";
import { AssetCard } from "../card";
import { Puff } from 'react-loading-icons'
import useOrder from "../../hooks/useOrder";
import { useEffect, useMemo, useState } from "react";
import { Button, Button2, ToggleButton } from "../../components/button"
import { shorterName } from "../../helper"
import { ERC20_TOKENS } from "../../constants";
import Skeleton from "react-loading-skeleton";
import { Options } from "../input"
import NFTCard from "../nftCard"
import Collection from "./collectionCard"
import { NETWORK } from "../../config/network"
import useCoingecko from "../../hooks/useCoingecko";

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

const TypeGroup = styled(ButtonGroup)`
    justify-content: center;
    flex: 1;
    height: 20px;
    font-size: 12px;
    display: flex;
    margin-bottom: 15px;
`

const StyledContainer = styled.div`

`

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const NetworkPanel = styled.div`
  text-align: center;
  padding: 1rem;
  padding-top: 0rem;
  padding-bottom: 0rem;
`;

const Description = styled.p`
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  font-size: 14px;
  padding: 1.5rem;
`;

const AllOrdersPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding-top: 20px;
`;

const CollectionsPanel = styled(Flex).attrs(() => ({ flexWrap: "wrap" }))`
   
`

const SearchSection = styled.div`
     max-width: 800px;
     margin-left: auto;
     margin-right: auto;
     text-align: center;
`

const MainSection = styled.div`
  padding: 20px;
  padding-top: 0.5rem;
  max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
`

const MAX_ITEMS = 15;



const OptionsPanel = styled.div`
    padding: 20px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
`

const OptionsRow = styled.div`
    display: flex; 
    flex-direction: row;   
    div {
        font-size: 12px;
        margin: auto;
        ${props => props.disabled && "opacity: 0.6;"}
    }
    label {
        margin-right: 10px;
    }
    :first-child {
        margin-right: 10px;
    }
    
`

const Orders = () => {

  const [isMainnet, setIsMainnet] = useState(false)

  const [chain, setChain] = useState();
  const [showCollection, setShowCollection] = useState(true);
  const [orders, setOrders] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false)

  const [filter, setFilter] = useState({})

  const [max, setMax] = useState(MAX_ITEMS);

  const { getAllOrders, getCollectionInfo } = useOrder()

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
    if (chain) {
      setLoading(true)
      setOrders([])
      setFilter({})
      setCollections([])
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

  const getCollection = async (address, chainId) => {

    const data = await getCollectionInfo(address, chainId)

    return {
      ...data,
      assetAddress: address,
      chainId
    }
  }

  useEffect(() => {
    const collections = orders.reduce((array, item) => {

      if (item.tokenType !== 0) {
        if (array.find(i => i.key === item.assetAddress)) {
          array = array.map(i => i.key === item.assetAddress ? ({ key: i.key, value: i.value + 1 }) : i)
        } else {
          array.push({
            key: item.assetAddress,
            value: 1
          })
        }
      }
      return array
    }, []).sort(function (a, b) {
      return b.value - a.value;
    });

    const chainId = orders && orders.length > 0 ? orders[0].chainId : 1

    Promise.all(collections.map(item => getCollection(item.key, chainId))).then(setCollections)

  }, [orders])

  const updateChain = (chainId) => {
    setChain(chainId)
    localStorage.setItem("chainId", `${chainId}`)
  }

  const getIcon = (chainId) => {
    const network = NETWORK.find(item => parseInt(chainId) === parseInt(item.chainId, 16))
    return network ? network.icon : "https://cdn-icons-png.flaticon.com/512/545/545685.png"
  }

  const updateShowCollection = (showing) => {
    setShowCollection(showing);
  };

  const filtered = useMemo(() => {

    if (Object.keys(filter).length === 0) {
      return orders
    }

    let output = orders

    if (filter['collection']) {
      const c = collections.find((item, index) => (index + 1) === filter['collection'])
      output = output.filter(item => item.assetAddress.toLowerCase() === c.assetAddress.toLowerCase())
    }

    if (filter['type']) {
      console.log(filter['type'], output)
      output = output.filter(item => (item.tokenType + 1) === filter['type'])
    }

    return output

  }, [orders, collections, filter])

  return (
    <StyledContainer>
      <SearchSection>
        {/* <NetworkPanel>
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
        </NetworkPanel> */}
      </SearchSection>
      {/* {loading &&
        <div style={{ textAlign: "center", padding: "3rem", display: "flex", flexDirection: "row" }}>
          <div style={{ margin: "auto", display: "flex", flexDirection: "row" }}>
            <Puff height="24px" />{` `}<div>Loading...</div>
          </div>
        </div>} */}

      <MainSection>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <TypeGroup>
            <div style={{ marginTop: "auto", marginBottom: "auto", display: "flex", flexDirection: "row" }}>
              <div style={{ marginTop: "13px" }}>
                Network :
              </div>
              <ButtonGroup style={{ marginLeft: "10px" }}>
                <ToggleButton onClick={() => setIsMainnet(true)} active={isMainnet}>
                  <div>
                    {`Mainnet`}
                  </div>
                </ToggleButton>
                {` `}
                <ToggleButton onClick={() => setIsMainnet(false)} active={!isMainnet}>
                  <div>
                    {`Testnet`}
                  </div>
                </ToggleButton>
              </ButtonGroup>
              <div style={{ marginTop: "13px", marginLeft: "15px" }}>
                Display :
              </div>
              <ToggleButton onClick={() => updateShowCollection(true)} active={showCollection === true}>
                Collections
              </ToggleButton>
              <ToggleButton onClick={() => updateShowCollection(false)} active={showCollection === false}>
                Items
              </ToggleButton>
            </div>

          </TypeGroup>
          {/* <div style={{ flex: 1 }}>
            <OptionsPanel>

              <OptionsRow>
                <div>
                  <label>Network</label>
                  <Options
                    // disabled={showCollection === true}
                    getter={isMainnet ? 1 : 2}
                    setter={(value) => value === 2 ? setIsMainnet(false) : setIsMainnet(true)}
                    options={[
                      [1, "Mainnet"],
                      [2, "Testnet"]
                    ]}
                  />
                </div>
              </OptionsRow>

              <OptionsRow disabled={showCollection === true}>
                <div>
                  <label>Collection</label>
                  <Options
                    disabled={showCollection === true}
                    getter={filter['collection']}
                    setter={(value) => setFilter({ ...filter, collection: value })}
                    options={[[0, ""]].concat(collections.map((value, index) => {

                      return [index + 1, value.title || shortAddress(value.assetAddress)]
                    }))}
                  />
                </div>
              </OptionsRow>
              <OptionsRow disabled={showCollection === true}>
                <div>
                  <label>Token Type</label>
                  <Options
                    disabled={showCollection === true}
                    getter={filter['type']}
                    setter={(value) => setFilter({ ...filter, type: value })}
                    options={[
                      [0, ""],
                      [1, "ERC-20"],
                      [2, "ERC-721"],
                      [3, "ERC-1155"]
                    ]}
                  />
                </div>
              </OptionsRow>
            </OptionsPanel>
          </div> */}
        </div>

        <div style={{marginBottom: "20px"}}>
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
        </div>

        {/* SHOW ORDERS */}
        {!showCollection &&
          (
            <>
              <AllOrdersPanel>

                {(!orders || orders.length === 0) && <AssetCard />}

                {(filtered.length > 0) &&
                  filtered.map((order, index) => {
                    if (index > max - 1) {
                      return;
                    }
                    return (
                      <NFTCard key={index} delay={index % MAX_ITEMS} order={order}>

                      </NFTCard>
                    );
                  })}

              </AllOrdersPanel>
              <div style={{ padding: "20px", marginTop: "1rem", textAlign: "center" }}>
                {orders.length > max && (
                  <Button onClick={() => setMax(max + 5)}>View More Items...</Button>
                )}
              </div>
            </>
          )
        }
        {/* SHOW COLLECTIONS */}
        {showCollection && (
          <>
            <CollectionsPanel>
              {(!collections || collections.length === 0) && <Box width={[1/3]} p={3}><Collection orders={[]} /></Box>}

              {collections.map((collection, index) => {
                const { assetAddress } = collection
                const collectionOrders = orders.filter(item => item.assetAddress === assetAddress)
                return (
                  <Box  width={[1/3]} p={3}>
                    <Collection
                      delay={index}
                      orders={collectionOrders}
                      collection={collection}
                    >

                    </Collection>
                  </Box>
                )
              })
              }
            </CollectionsPanel>
          </>
        )
        }
      </MainSection>

    </StyledContainer >
  )
}

export default Orders
