import { InjectedConnector } from "@web3-react/injected-connector" 
import { WalletConnectConnector } from "@web3-react/walletconnect-connector"
import { WalletLinkConnector } from "@web3-react/walletlink-connector"

const RPC = {
  1: "https://mainnet.infura.io/v3",
  42: "https://eth-kovan.alchemyapi.io/v2/6OVAa_B_rypWWl9HqtiYK26IRxXiYqER",
  56: "https://bsc-dataseed1.binance.org",
  137: "https://rpc-mainnet.maticvigil.com",
  80001: "https://rpc-mumbai.matic.today",
}

export const supportedChainIds = [97, 43113, 42, 80001, 137, 56, 43114, 1]

export const injected = new InjectedConnector({ supportedChainIds })

export const walletconnect = new WalletConnectConnector({
  rpc: RPC,
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: 15000,
})

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: RPC[1],
  appName: "Tamago Finance",
  // appLogoUrl: require("../../public/images/tamago-logo-5.png"),
})

export const Connectors = [
  {
    name: "MetaMask",
    connector: injected, 
    image: "../images/wallet-provider/metamask.png",
  },
  {
    name: "imToken",
    connector: walletconnect, 
    image: "../images/wallet-provider/imToken.png",
  },
  // {
  //   name: "Wallet Connect",
  //   connector: walletconnect, 
  //   image: "../images/wallet-provider/wallet-connect.svg",
  // },
  // {
  //   name: "Wallet Link",
  //   connector: walletlink, 
  //   image: "../images/wallet-provider/metamask.png",
  // },
]
