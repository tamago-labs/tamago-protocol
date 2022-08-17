import NFTCard from "./nftCard"
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import styled from "styled-components"
import { useWeb3React } from "@web3-react/core";
import { resolveNetworkName } from "../../../helper"
import { Alert } from "../../../components/alert";

const StyledPanel = styled(TabPanel)` 
    
`

const StyledTabs = styled(Tabs)`
 
    .react-tabs__tab--selected {
        background: transparent;
        color: white;
        text-decoration: underline;
    }

`

const Body = styled.div`
    padding-top: 10px;
    display: flex;
    flex-wrap: wrap;
`

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

    const cid = id

    const { chainId } = useWeb3React();

    const chainIds = items.reduce((arr, item) => { 
        if (arr.indexOf(item.chainId) === -1) {
            arr.push(item.chainId)
        }
        return arr
    }, [])

    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                marginTop: "1rem",
            }}
        >
            <StyledTabs>

                <TabList>
                    {chainIds.map((id, index) => (<Tab key={index}>{resolveNetworkName(id)}</Tab>))}
                </TabList>

                {chainIds.map((id, index) =>
                (<StyledPanel key={index}>
                    {chainId !== id && (
                            <div><Alert>Connect to correct network to trade</Alert></div>
                        )}
                    <Body>
                        
                        {items.filter(item => item.chainId === id).map((item, index) => {
                            return (
                                <NFTCard
                                    key={index}
                                    orderId={cid}
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
                    </Body>
                </StyledPanel>))}

            </StyledTabs>


        </div>
    )
}

export default PairAssetList