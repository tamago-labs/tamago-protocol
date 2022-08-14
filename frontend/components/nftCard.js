
import { useEffect, useMemo, useState } from "react";
import { AssetCard } from "./card";
import useOrder from "../hooks/useOrder";
import { shorterName } from "../helper"

const NFTCard = ({
    delay,
    order,
    children
}) => {

    const { resolveMetadata, resolveTokenValue } = useOrder();
    const [data, setData] = useState();

    useEffect(() => {
        if (order && order.tokenType !== 0) {
            resolveMetadata({
                assetAddress: order.assetAddress,
                tokenId: order.tokenId,
                chainId: order.chainId,
            }).then(setData);
        }

    }, [order, delay]);

    return (
        <>
            <AssetCard
            orderId={order.cid}
            image={order.tokenType === 0 ? "./images/coin.png" : data && data.metadata && data.metadata.image}
            chainId={order.chainId}
        >
            <div className="name">
                {order.tokenType !== 0
                    ?
                    <>{data && data.metadata.name ? data.metadata.name : `#${shorterName(order.tokenId)}`}</>
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
            {children}
        </AssetCard>
        </>
    )
}

export default NFTCard