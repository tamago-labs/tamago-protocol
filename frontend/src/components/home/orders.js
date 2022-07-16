import styled from "styled-components";
import { useWeb3React } from "@web3-react/core"
import { Container } from "reactstrap";
import { OptionsLarge } from "../input"
import { supportedChainIds } from "../../config/connectors";
import { resolveNetworkName } from "../../helper";
import { AssetCard } from "../card";

const StyledContainer = styled(Container)`

`

const NetworkPanel = styled.div`
    text-align: center;
    padding: 1rem;
`

const Description = styled.p`
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    font-size: 14px;
    padding: 1.5rem;
`

const AllOrdersPanel = styled.div`
    display: flex;
    flex-wrap: wrap;  
`

const Orders = () => {
    return (
        <StyledContainer>

            <NetworkPanel>
                <OptionsLarge
                    options={supportedChainIds.map(item => [item, resolveNetworkName(item)])}
                />
                <Description>
                    20x is a universal multi-chain marketplace, select the network to see all ERC-20, ERC-721, ERC-1155 listed in the system
                </Description>
            </NetworkPanel>

            <AllOrdersPanel>

                <AssetCard>

                </AssetCard>

            </AllOrdersPanel>

        </StyledContainer>
    )
}

export default Orders
