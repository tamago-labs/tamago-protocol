
import { useEffect, useMemo, useState } from "react";
import Link from "next/link"
import { SelectableCard } from "./card";
import useOrder from "../hooks/useOrder";
import { shorterName, shortAddress, resolveBlockexplorerLink } from "../helper"
import styled from "styled-components";
import { Flex, Box } from 'reflexbox'
import { PairAssetCardMini } from "./card";
import Skeleton from "react-loading-skeleton";
import CollectionModal from "../components/modals/collectionModal"

const CollectionCardContainer = styled.div`
    ${props => props.clickable && "cursor: pointer; "}
 
    margin-top: 10px;
    cursor: pointer;
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

const Name = styled(Box)`

    padding-top: 5px; 

    h4, p {
        margin: 0px;
        padding: 0px;
    }
    h4 {
        margin-bottom: 10px;
    }
`

const Title = styled.h4`
    margin: 0px;
    padding: 0px;
    text-align: center;
`

const AssetCardMini = ({
    item,
    delay
}) => {

    const [data, setData] = useState();
    const { resolveMetadata } = useOrder();

    useEffect(() => {

        if (item && !item.metadata) { 
            resolveMetadata({
                assetAddress: item.assetAddress,
                tokenId: item.assetTokenIdOrAmount,
                chainId: item.chainId,
            }).then(setData);
        }

    }, [item, delay]);

    useEffect(() => {
        if (item && item.metadata) {
            setData(item)
        }
    }, [item])

    return (
        <PairAssetCardMini
            image={
                (item.tokenType === 0 || item.tokenType === 3)
                    ? "./images/coin.png"
                    : data && data.metadata && data.metadata.image
            }
            chainId={item.chainId}
        >

        </PairAssetCardMini>
    )
}

const AssetCard = ({
    item,
    delay,
    disabledCard,
    fromData,
    chainId,
    onClickCard
}) => {

    const [data, setData] = useState();
    const { resolveMetadata } = useOrder();

    useEffect(() => {

        if (item && !item.metadata) {
            resolveMetadata({
                assetAddress: item.assetAddress,
                tokenId: item.assetTokenIdOrAmount,
                chainId: item.chainId,
            }).then(setData);
        }

    }, [item, delay]);

    useEffect(() => {
        if (item && item.metadata) {
            setData(item)
        }
    }, [item])

    const simpleHash = str => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash &= hash; // Convert to 32bit integer
        }
        return new Uint32Array([hash])[0].toString(36);
    };

    const token_hash = simpleHash(`${item.assetAddress}${item.assetTokenIdOrAmount}${item.chainId}`)

    return (
        <SelectableCard
            image={data && data.metadata && data.metadata.image}
            chainId={item.chainId}
            disabled={disabledCard}
            selected={fromData && fromData.find(
                (data) => data.token_hash === token_hash
            )}
            onClick={() => onClickCard({ ...item, chainId, token_hash, metadata: data && data.metadata, name: data && data.name })}
        >
            <div style={{ textAlign: "center", color: "black", fontSize: "14px", marginTop: "10px" }}>
                {data && data.metadata ? data.metadata.name : <Skeleton />}
            </div>
        </SelectableCard>
    )
}

const MiniCard = styled.div`
    margin: 3px; 
    width: 180px;
    border-radius: 5px; 
    flex: 1;
    h4, p {
        padding: 0px;
        margin: 0px;
    } 
    p {
        margin-top: 10px;
    }
`

export const CollectionCard = ({
    tokens,
    assetAddress,
    chainId,
    disabledCard,
    onClickCard,
    fromData,
    metadata // override metadata if set
}) => {

    const [info, setInfo] = useState();
    const { getCollectionInfo } = useOrder()
    const [modalVisible, setModalVisible] = useState()

    // item.contract_type === "ERC1155" ? 2 : 1;

    const assets = tokens.map((token, index) => ({ assetAddress, chainId, assetTokenIdOrAmount: token, metadata: metadata && metadata[index] }))

    const previews = assets.length > 10 ? assets.slice(0, 10) : assets

    useEffect(() => {
        assetAddress && chainId && getCollectionInfo(assetAddress, chainId).then(setInfo)
    }, [assetAddress, chainId])

    const toggleModal = () => {
        setModalVisible(!modalVisible)
    }

    const collectionName = (info && info.title) ? info.title : "Unknown Collection"

    return (
        <>
            <CollectionModal
                visible={modalVisible}
                toggle={toggleModal}
                collectionName={collectionName}
                total={tokens.length}
            >
                <div style={{ display: "flex", flexDirection: "row", textAlign : "center", marginBottom: "15px" }}>
                    <MiniCard>
                        <b><a target="_blank" href={resolveBlockexplorerLink(chainId, assetAddress)}>Contract Address : {shortAddress(assetAddress, 12, -8)}</a></b>
                    </MiniCard>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {assets.map((asset, index) => {
                        return (
                            <AssetCard
                                item={asset}
                                delay={index * 300}
                                disabledCard={disabledCard}
                                fromData={fromData}
                                chainId={chainId}
                                onClickCard={onClickCard}
                            />
                        )
                    })}
                </div>
            </CollectionModal>
            <CollectionCardContainer onClick={toggleModal}>
                <Title>
                    {collectionName}{` `}({tokens.length})
                </Title>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: "5px" }}>
                    {previews.map((item, index) => {
                        return (
                            <AssetCardMini
                                item={item}
                                delay={index * 300}
                            />
                        );
                    })}
                </div>
            </CollectionCardContainer>
        </>
    )
}