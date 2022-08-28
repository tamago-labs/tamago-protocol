import styled from "styled-components";
import Link from "next/link";
import { useWeb3React } from "@web3-react/core"
import { useState, useContext } from 'react';
import { Button, ToggleButton } from "./button"
import useEagerConnect from "../hooks/useEagerConnect"
import SwitchChainModal from "../components/modals/switchChain"
import useInactiveListener from "../hooks/useInactiveListener"
import {
    shortAddress,
    resolveNetworkName,
    resolveNetworkIconUrl
} from "../helper";
import { supportedChainIds } from "../config/connectors"
import WalletsModal from "./modals/wallets"
import Image from "next/image"
import { AccountContext } from "../hooks/useAccount"
import AccountModal from "../components/modals/accountModal"


const Container = styled.div.attrs(() => ({}))`
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
    
    padding: 10px;
    width: 350px; 
    display: flex;
    flex-direction: row;

    div {
        cursor: pointer;
    }
 
`

const Menu = styled.div`
    margin: auto;
    font-size: 18px;

    a { 
        margin-right: 7px;
        margin-left: 7px; 
    }

    @media only screen and (max-width: 600px) {
         
    }

`

const Buttons = styled.div` 
    width: 350px; 
    display: flex;
    padding-right: 40px;

    button {
        margin-left: 5px;
    }

    @media only screen and (max-width: 600px) {
        padding-right: 0px;
    }
     
`

const NetworkBadge = styled(({ className, toggleSwitchChain, chainId }) => {
    return (
        <div className={className}>
            <Button
                onClick={toggleSwitchChain}
            >
                <div className="image-container">
                    <img
                        style={{ height: "100%" }}
                        src={resolveNetworkIconUrl(chainId)}
                    />
                </div>
                <div>
                    {resolveNetworkName(chainId)}
                </div>
            </Button>
        </div>
    );
})`

    flex-grow: 1;

    >button {
        display: flex;
        flex-direction: row;
        padding: 3px 10px;
        >div {
            margin: auto;
        }  
    }

    .image-container {
      height: 30px;
      width: 30px;
      margin: auto;
      border-radius: 50%;
      overflow: hidden;
      transform: translateX(-20%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    @media only screen and (max-width: 600px) {
        display: none;
    }
 
  `;

const Header = () => {

    const [switchChainVisible, setSwitchChainVisible] = useState(false);
    const [accountVisible, setAccountVisible] = useState(false)
    const { account, chainId, library } = useWeb3React()
    const { isMainnet, updateNetwork } = useContext(AccountContext)

    const toggleSwitchChain = () => setSwitchChainVisible(!switchChainVisible);

    const [walletLoginVisible, setWalletLoginVisible] = useState(false)
    const [open, setOpen] = useState()

    const toggleWalletConnect = () => setWalletLoginVisible(!walletLoginVisible)
    const toggleAccount = () => setAccountVisible(!accountVisible)

    // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
    const triedEager = useEagerConnect()

    // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
    useInactiveListener(!triedEager)

    const isSupported = chainId && supportedChainIds.indexOf(chainId) !== -1

    return (
        <>
            <WalletsModal
                toggleWalletConnect={toggleWalletConnect}
                walletLoginVisible={walletLoginVisible}
            />
            <SwitchChainModal
                toggleModal={toggleSwitchChain}
                modalVisible={switchChainVisible}
            />
            <AccountModal
                toggle={toggleAccount}
                visible={accountVisible}
            />
            <Container>
                <Brand>
                    <Link href="/">
                        <div>
                            <Image
                                src={"/images/logo-white.svg"}
                                width="180px"
                                height="40px"
                            />
                        </div>
                    </Link>
                    {/* <div style={{ marginTop: "auto", marginBottom: "auto", display: "flex", flexDirection: "row" }}>
                        <ToggleButton active={isMainnet} onClick={() => updateNetwork(true)}>
                            Mainnet
                        </ToggleButton>
                        <ToggleButton style={{ marginLeft: "5px" }} active={!isMainnet} onClick={() => updateNetwork(false)}>
                            Testnet
                        </ToggleButton>
                    </div> */}
                </Brand>
                <Menu>
                    {/* <Link href="/launchpad">
                        Launchpad
                    </Link> */}
                    {isMainnet === true
                        ?
                        <>
                            {/* <Link href="https://testnet.tamagonft.xyz">
                            Testnet Version
                        </Link> */}
                        </>
                        :
                        <Link href="/faucet">
                            Faucet
                        </Link>
                    }
                    <>
                        <Link href="/sell">
                            Sell
                        </Link>
                        <Link href="https://testnet.tamagonft.xyz">
                            Testnet
                        </Link>
                    </>

                    {/* {account && (
                        <>
                            <Link href="/account">
                                Account
                            </Link>
                        </>
                    )} */}
                </Menu>
                <Buttons>
                    <div style={{ marginLeft: "auto" }}>
                        {!account &&
                            (
                                <Button onClick={toggleWalletConnect}>
                                    Connect
                                </Button>
                            )
                        }
                        {account &&
                            (
                                <div style={{ display: "flex", flexDirection: "row" }}>

                                    <NetworkBadge
                                        chainId={chainId}
                                        toggleSwitchChain={toggleSwitchChain}
                                    />
                                    {isSupported && (
                                        <>
                                            {/* <Link href="/sell">
                                                <Button>
                                                    Sell
                                                </Button>
                                            </Link> */}
                                            <Link href="/account">
                                                <Button>
                                                    Account
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )
                        }
                    </div>

                </Buttons>
            </Container>
        </>
    )
}

export default Header