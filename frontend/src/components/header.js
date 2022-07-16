import styled from "styled-components";
import { useWeb3React } from "@web3-react/core"
import { useState, useContext } from 'react';
import { ChevronDown } from "react-feather";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"
import { Button } from "./button"
import useEagerConnect from "../hooks/useEagerConnect"
import useInactiveListener from "../hooks/useInactiveListener"
import {
    shortAddress
} from "../helper";
import WalletsModal from "./modals/wallets"

const Container = styled.div.attrs(() => ({ className: "container" }))`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;

    a {
        color: inherit; 
        margin-top: 10px;
        font-size: 14px;
    }

`

const Brand = styled.div` 
    
    padding: 10px 0px;
    
    width: 125px;
    a {
        font-weight: 700;
        text-shadow: 3px 3px black;
        font-size: 24px;
        color: inherit;
        text-decoration: none;
    }
`

const Address = styled.div` 
    font-size: 16px;
    padding: 10px 0px;
    font-weight: 600;
    text-shadow: 3px 3px black;
`

const Buttons = styled.div`
    width: 125px;
    text-align: right;
`

const Header = () => {

    const navigate = useNavigate();

    const { account, chainId, library } = useWeb3React()

    const [walletLoginVisible, setWalletLoginVisible] = useState(false)
    const [open, setOpen] = useState()

    const toggleWalletConnect = () => setWalletLoginVisible(!walletLoginVisible)

    // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
    const triedEager = useEagerConnect()

    // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
    useInactiveListener(!triedEager)

    return (
        <>
            <WalletsModal
                toggleWalletConnect={toggleWalletConnect}
                walletLoginVisible={walletLoginVisible}
            />
            <Container>

                <Brand>
                    <Link to="/">
                        20x
                    </Link>
                </Brand>

                <div style={{ marginTop: "auto", paddingBottom: "10px" }}>
                    <Link to="/faucet">
                        {` `}Faucet
                    </Link>
                    {` `}
                    <a target="_blank" href="https://github.com/pisuthd/marketplace-20x">
                        {` `}GitHub
                    </a>
                </div>

                <Buttons>
                    {!account &&
                        (
                            <Button onClick={toggleWalletConnect}>
                                Connect
                            </Button>
                        )
                    }
                    {account &&
                        (

                            <Button onClick={() => navigate("/create")}>
                                Sell
                            </Button>
                        )
                    }
                </Buttons>
            </Container>
        </>
    )
}

export default Header