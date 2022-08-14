import NFTCard from "./nftCard"


const PairAssetList = ({
    id,
    account,
    library,
    data,
    increaseTick,
    tick,
    items,
    order
}) => {

    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                marginTop: "1rem",
            }}
        >
            {items.map((item, index) => {
                return (
                    <NFTCard
                        key={index}
                        orderId={id}
                        order={order}
                        item={item}
                        account={account}
                        library={library}
                        baseMetadata={data}
                        index={index}
                        increaseTick={increaseTick}
                        tick={tick}
                    />
                );
            })}
        </div>
    )
}

export default PairAssetList