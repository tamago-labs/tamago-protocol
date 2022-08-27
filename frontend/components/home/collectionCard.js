import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import Link from "next/link"
import { CollectionCard } from "../card"
import { ERC20_TOKENS } from "../../constants";
import useOrder from "../../hooks/useOrder";
import { resolveNetworkName, shortAddress, shorterText } from "../../helper";

const Info = styled(({ className, name, value }) => {
    return (
        <div className={className}>
            <div>{name || <Skeleton />}</div>
            <p>{value || <Skeleton />}</p>
        </div>
    )
})`
    display: inline-block;
    text-align: left;
    height: 50px;
    min-width: 90px;
    margin-top: auto;
    margin-bottom: auto; 
    flex-grow: 1;
    font-size: 12px;

    div {
      padding: 0px;
      margin: 0px;
      font-weight: 600; 
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

const Card = styled.div`
    background: white; 
    height: 180px;
    overflow: hidden;
    border-radius: 6px;
    color: black;
    margin-top: 15px;
    line-height: 18px;
    display: flex;
    flex-direction: column;
    box-shadow: 5px 7px black;
    position: relative;
    cursor: pointer;

`

const CardCover = styled.div`
    position: absolute;
    height: 80px;
    top: 0px;
    left: 0px;
    width: 100%;
    background: #CBC3E3;
`

const CardBody = styled.div`
    position: absolute;
    height: 280px;
    top: 70px;
    left: 0px;
    width: 100%;
    padding: 10px;
    h5 {
        font-size: 18px;
        padding: 0px;
        margin: 0px;
        margin-top: 10px;
        padding: 0px;
        margin-bottom: 10px;
    }
    p {
        padding: 0px;
        font-size: 14px;
        line-height: 18px;
    }
`

const Image = styled.img`
    width: 100%;
    height: 80px;
    object-fit: cover;
`

const ALT_COVER = "https://img.tamago.finance/bg-2.jpg"

const Collection = ({ data, collection, delay }) => {

    const { getCollectionInfo, getFloorPrice, getCollectionOwners } = useOrder()
    const [info, setInfo] = useState()
    const [floorPrice, setFloorPrice] = useState()
    const [owners, setOwners] = useState()

    useEffect(() => {
        if (data) {
            getCollectionInfo(data.assetAddress, Number(data.chainId)).then(setInfo)
        }
    }, [data]);

    return (
        <Link href={data && data.chainId && data.assetAddress ? `/collection?chain=${data.chainId}&address=${data.assetAddress}` : "/"}>
            <Card>
                <CardCover>
                    <Image src={data && data.cover ? data.cover : ALT_COVER} />
                </CardCover>

                <CardBody>
                    <h5>{data && data.title ? data.title : shortAddress(data.assetAddress)}</h5>
                     <Info
                        name="Chain"
                        value={resolveNetworkName(data.chainId)}
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
                        value={info && info.totalOrders}
                    /> 
                </CardBody>
            </Card>
        </Link>
    )
}

export default Collection