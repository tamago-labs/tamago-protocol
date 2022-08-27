import { useEffect, useMemo } from "react"
import { useWeb3React } from "@web3-react/core";
import { useState } from "react";
import styled from "styled-components"
import useOrder from "../../hooks/useOrder"
import { CollectionCard } from "../collectionCard";
import { Button } from "../button";
import { Flex, Box } from 'reflexbox'
import LoadingIndicator from "../loadingIndicator";

const Wrapper = styled.div`
    padding: 10px;
    padding-bottom: 3rem;
`

const Title = styled.h2`
    padding: 0px;
    margin: 0px;
    margin-top: 10px;
`

const MAX_ITEMS = 6;

const Divider = styled.hr`
    background: white;
    margin-top: 1rem;
    margin-bottom: 1rem;
`

const Body = styled.div`

`

const Disclaimer = styled.div`
    font-size: 14px;
    line-height: 20px;
    padding: 0px;
    border: 1px solid white;
    border-radius: 5px;
`

const MyNFTs = () => {

    const [loading, setLoading] = useState(true)
    const [max, setMax] = useState(MAX_ITEMS);
    const { account, chainId } = useWeb3React();
    const { fetchNFTFromAccount } = useOrder()
    const [items, setItems] = useState([])

    useEffect(() => {
        setItems([])
        setLoading(true)
        setMax(MAX_ITEMS)
        account && chainId && fetchNFTFromAccount({ chainId, account }).then(
            (items) => {
                setItems(items)
                setLoading(false)
            }
        )
    }, [account, chainId])

    const collections = items ? items.reduce((arr, item) => {
        if (arr[item['token_address']]) {
            arr[item['token_address']].push(item['token_id'])
        } else {
            arr[item['token_address']] = [item['token_id']]
        }

        return arr
    }, []) : []

    return (
        <Wrapper>
            <Title>
                Your NFTs ({items.length})
            </Title>
            <Divider />
            <Body>
                <Disclaimer> 
                    <ul>
                        <li>The NFTs displayed are directly fetch from your Web3 wallet </li>
                    </ul>
                </Disclaimer>
                {loading && <LoadingIndicator />}
                <Flex flexWrap="wrap">
                    {Object.keys(collections).map((item, index) => {
                        if (index > max - 1) {
                            return;
                        }
                        return (
                            <Box p={1} width={[1]}>
                                <CollectionCard
                                    key={index}
                                    assetAddress={item}
                                    tokens={collections[item]}
                                    chainId={chainId}
                                />
                            </Box>
                        )
                    })}
                </Flex>

                <div style={{ padding: "20px", marginTop: "1rem", textAlign: "center" }}>
                    {Object.keys(collections).length > max && (
                        <Button style={{ marginLeft: "auto", marginRight: "auto" }} onClick={() => setMax(max + 4)}>View More Items...</Button>
                    )}
                </div>
            </Body>
        </Wrapper>
    )
}

export default MyNFTs