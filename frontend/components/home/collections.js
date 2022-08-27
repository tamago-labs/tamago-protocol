import react, { useState, useEffect, useContext, useMemo } from "react"
import styled from "styled-components";
import { Puff } from 'react-loading-icons'
import { Flex, Box } from 'reflexbox'
import Slider from "react-slick";
import { NETWORK } from "../../config/network"
import useMarketplace from "../../hooks/useMarketplace"
import useOrder from "../../hooks/useOrder";
import { OrderCard } from "../nftCard"
import { AccountContext } from "../../hooks/useAccount";
import Container from "../container";
import { ToggleButton } from "../button";
import CollectionCard from "./collectionCard"
import COLLECTIONS from "../../data/collections";
import { MAINNET_CHAINS, TESTNET_CHAINS } from "../../constants";

const Title = styled.div`
    font-size: 22px;
    font-weight: 600;
    padding: 10px;
    padding-bottom: 0px; 
`

const CollectionCardContainer = styled.div`
    padding: 10px;
    padding-top; 0px;
`

const Collections = () => {

    const { isMainnet } = useContext(AccountContext)

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 2,
        slidesToScroll: 2
    };

    const collections = useMemo(() => {
        return COLLECTIONS.filter(item => isMainnet ? MAINNET_CHAINS.includes(item.chainId) : TESTNET_CHAINS.includes(item.chainId))
    }, [isMainnet])

    return (
        <>
            <Container>
                <Title>
                    Collections ({collections.length || 0})
                </Title>
                <Slider {...settings}>
                    {collections.map((data, index) => {
                        return (
                            <CollectionCardContainer key={index}>
                                <CollectionCard
                                    data={data}
                                />
                            </CollectionCardContainer>
                        )
                    }) }

                </Slider>
            </Container>
        </>
    )
}

export default Collections