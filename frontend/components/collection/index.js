import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Skeleton from "react-loading-skeleton";
import useOrder from "../../hooks/useOrder";
import NFTCard from "../nftCard";
import { Flex, Box } from 'reflexbox'
import { Puff } from 'react-loading-icons'
import { Button, Button2, ToggleButton } from "../../components/button"
import { AssetCard } from "../card";
import { resolveBlockexplorerLink, resolveNetworkName, shortAddress } from "../../helper";
import { ExternalLink, FileText, Twitter } from "react-feather"
import { OrderCard } from "../nftCard"

const ALT_COVER = "https://img.tamago.finance/bg-2.jpg"

const Container = styled.div`
    margin-top: 1rem;
`

const Header = styled.div`
    position: relative;
    height: 150px; 
`

const Cover = styled.div`
    position: absolute;
    height: 150px;
    top: 0px;
    left: 0px;
    width: 100%;
    background: #CBC3E3;
`

const Image = styled.img`
    width: 100%;
    height: 150px;
    object-fit: cover;
`

const CollectionInfoContainer = styled.div`
    position: absolute;
    height: 60px;
    bottom: 60px; 
    width: 100%;
    display: flex; 
`


const CollectionStatusCard = styled.div`
    background: white;
    width: 800px;
    height: 60px;

    border-radius: 6px;
    padding: 16px;
    margin-left: auto;
    margin-right: auto;
    color: black;
    line-height: 18px;
    display: flex;
    padding: 12px;
    box-shadow: 5px 7px black;
`


const Info = styled(({ className, name, value }) => {
    return (
        <div className={className}>
            <div>{name || <Skeleton />}</div>
            <p>{value || <Skeleton />}</p>
        </div>
    )
})`
    display: inline-block;
    min-width: 100px;
    text-align: left;
    height: 50px;
    margin-top: auto;
    margin-bottom: auto; 
    flex-grow:1;
    div {
      padding: 0px;
      margin: 0px;
      font-weight: 600; 
      font-size: 14px;
    }
    a {
      color: inherit;
      text-decoration: none;
    }
    p {
        margin: 0px;
    }
    margin-right: 10px;
  `


const Body = styled.div.attrs(() => ({}))`
    margin-top: 6rem;
    display: flex;
    flex-direction: column;
    margin-bottom: 3rem;
    width: 100%;
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
`

const CollectionInfoCol = styled.div`
    flex: 3;
    padding: 10px;
`

const CollectionInfoCard = styled.div`
    background: white;   
    width: 100%;
    text-align: left;

    border-radius: 6px; 
    color: black;
    line-height: 18px;
    display: flex;
    flex-direction: column;
    padding: 12px;
    box-shadow: 5px 7px black;
    h5 { 
        font-size: 24px;
        padding: 0px;
        margin: 0px;
        padding-top: 10px; 
    }
    p {
        font-size: 14px;
    }
`

const OrdersPanel = styled.div`
    display: flex;
    flex-wrap: wrap;  
    padding-top: 10px;
`


const CollectionOrderCol = styled.div`
    flex: 9;
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

const Address = styled.div`
    font-size: 14px;
    a {
        color: inherit;
    }
    margin-bottom: 10px;
`

const Icons = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: right;
    padding-right: 10px;
    padding-top: 5px;
    height: 30px; 
`

const Icon = styled.div` 
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    color: white;
    background: black;

  :not(:last-child) {
      margin-right: 3px;
  }

  a {
      color: inherit;
      margin: auto;
  }

`

const Title = styled(Box).attrs(() => ({ width: [1, 1 / 4] }))`
    font-size: 22px;
    font-weight: 600; 
    padding-top: 10px;
`

const Selector = styled(Box).attrs(() => ({ width: [1, 3 / 4] }))`
    font-size: 14px;
    display: flex;
    flex-direction: row; 
    justify-content: flex-end;
    align-items : flex-end; 
`

const Switcher = styled(Flex).attrs(() => ({ flexWrap: "wrap" }))`
    padding: 10px;
`

const MAX_ITEMS = 5;

const Collection = ({
    address,
    chain
}) => {

    const [max, setMax] = useState(MAX_ITEMS);

    const { getOrdersFromCollection, getCollectionInfo, getCollectionOwners } = useOrder()
    const [orders, setOrders] = useState([])
    const [info, setInfo] = useState()
    const [isListed, setIsListed] = useState(true)
    const [owners, setOwners] = useState()

    useEffect(() => {
        if (chain) {
            setOrders([])
            setMax(MAX_ITEMS)
            getOrdersFromCollection(Number(chain), address).then(setOrders)
            getCollectionInfo(address, Number(chain)).then(setInfo)
        }

    }, [chain, address])

    useEffect(() => {

        if (isListed) {
            setMax(MAX_ITEMS)
        }

    }, [isListed])

    const filtered = useMemo(() => {

        if (isListed) {
            return orders
        } else {
            const existingTokens = orders.map(item => item.tokenId)
            return info && info.tokens ? info.tokens.filter(item => !existingTokens.includes(item)).map((item) => {
                return {
                    assetAddress: address,
                    chainId: chain,
                    tokenId: item
                }
            }) : []
        }

    }, [isListed, orders, info, chain, address])



    return (
        <Container>
            <Header>
                <Cover>
                    <Image src={info && info.cover ? info.cover : ALT_COVER} />
                </Cover>
                <CollectionInfoContainer>
                    <Flex style={{ width: "100%", maxWidth: "1000px", marginLeft: "auto", marginRight: "auto" }} flexWrap={"wrap"}>
                        <Box width={[1, 9 / 12]} >
                            <CollectionInfoCard>
                                <div style={{ display: "flex", flexDirection: "row" }}>
                                    <div style={{ flex: 1 }}>
                                        <h5>{info && info.title ? info.title : <Skeleton />}</h5>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        {info && (
                                            <>
                                                <Icons>
                                                    <Icon>
                                                        <a rel="noreferrer" target="_blank" href={resolveBlockexplorerLink(Number(chain), address)}>
                                                            <FileText size={16} />
                                                        </a>
                                                    </Icon>
                                                    {info.links && info.links.website && (
                                                        <Icon>
                                                            <a rel="noreferrer" target="_blank" href={info.links.website}>
                                                                <ExternalLink style={{ margin: "auto" }} size={16} />
                                                            </a>
                                                        </Icon>
                                                    )}
                                                    {info.links && info.links.twitterLink && (
                                                        <Icon>
                                                            <a rel="noreferrer" target="_blank" href={info.links.twitterLink}>
                                                                <Twitter size={16} />
                                                            </a>
                                                        </Icon>
                                                    )}
                                                </Icons>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <p>{info && info.description ? info.description : <Skeleton />}</p>
                                <div>
                                    <Info
                                        name="Chain"
                                        value={resolveNetworkName(Number(chain))}
                                    />
                                    <Info
                                        name="Items"
                                        value={info && info.totalSupply}
                                    />
                                    <Info
                                        name="Owners"
                                        value={info && info.totalOwners}
                                    />
                                    <Info
                                        name="Listing"
                                        value={orders ? orders.length : null}
                                    />
                                </div>
                            </CollectionInfoCard>
                        </Box>
                        {/* <Box width={[1, 3 / 12]}>
                            RIGHT
                        </Box> */}
                    </Flex>
                </CollectionInfoContainer>
            </Header>
            <Body>
                <Switcher>
                    <Title>
                        Items
                    </Title>
                    <Selector>
                        <ButtonGroup>
                            <>
                                <ToggleButton onClick={() => setIsListed(true)} active={isListed}>
                                    Listed
                                </ToggleButton>
                                <ToggleButton onClick={() => setIsListed(false)} active={!isListed}>
                                    Unlisted
                                </ToggleButton>
                            </>
                        </ButtonGroup>
                    </Selector>
                </Switcher>
                <>

                    {filtered.length === 0 &&
                        <div style={{ textAlign: "center", padding: "3rem", display: "flex", flexDirection: "row" }}>
                            <div style={{ margin: "auto", display: "flex", flexDirection: "row" }}>
                                <Puff height="24px" />{` `}<div>Loading...</div>
                            </div>
                        </div>
                    }

                    {(filtered.length > 0) &&
                        filtered.map((order, index) => {
                            if (index > max - 1) {
                                return;
                            }
                            return (
                                <OrderCard key={index} delay={index % MAX_ITEMS} order={order} />);
                        })}
                    <div style={{ padding: "20px", marginTop: "1rem", textAlign: "center" }}>
                        {filtered.length > max && (
                            <Button style={{ marginLeft: "auto", marginRight: "auto" }} onClick={() => setMax(max + 5)}>View More Items...</Button>
                        )}
                    </div>
                </>
            </Body>
        </Container>
    )
}

export default Collection