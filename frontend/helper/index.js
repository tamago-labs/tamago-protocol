
import { SUPPORT_CHAINS } from "../constants";
import { ethers } from "ethers";

export const shortAddress = (address, first = 6, last = -4) => {
  return `${address.slice(0, first)}...${address.slice(last)}`
}

export const resolveNetworkName = (networkId) => {
  switch (networkId) {
    case 1:
      return "Ethereum"
    case 25:
      return "Cronos"
    case 42:
      return "Kovan Testnet"
    case 56:
      return "BNB Chain"
    case 97:
      return "BNB Testnet"
    case 137:
      return "Polygon"
    case 80001:
      return "Mumbai Testnet"
    case 43113:
      return "Fuji Testnet"
    case 43114:
      return "Avalanche"
    default:
      return "Not Support Chain"
  }
}


export const resolveBlockexplorerLink = (networkId, assetAddress, isAddress = true) => {

  const prefix = isAddress ? "address" : "tx"

  switch (networkId) {
    case 1:
      return `https://etherscan.io/${prefix}/${assetAddress}`
    case 25:
      return `https://cronoscan.com/${prefix}/${assetAddress}`
    case 42:
      return `https://kovan.etherscan.io/${prefix}/${assetAddress}`
    case 97:
      return `https://testnet.bscscan.com/${prefix}/${assetAddress}`
    case 80001:
      return `https://mumbai.polygonscan.com/${prefix}/${assetAddress}`
    case 137:
      return `https://polygonscan.com/${prefix}/${assetAddress}`
    case 56:
      return `https://bscscan.com/${prefix}/${assetAddress}`
    case 43113:
      return `https://testnet.avascan.info/blockchain/c/${prefix}/${assetAddress}`
    case 43114:
      return `https://snowtrace.io/${prefix}/${assetAddress}`
    default:
      return "#"
  }
}

export const resolveNetworkIconUrl = (networkId) => {
  switch (networkId) {
    case 1:
      return "https://raw.githubusercontent.com/sushiswap/icons/master/network/mainnet.jpg"
    case 25:
      return "https://cronoscan.com/images/svg/brands/main.svg?v=22.7.3.0"
    case 42:
      return "https://raw.githubusercontent.com/sushiswap/icons/master/network/kovan.jpg"
    case 56:
      return "https://raw.githubusercontent.com/sushiswap/icons/master/network/bsc.jpg"
    case 97:
      return "https://raw.githubusercontent.com/sushiswap/icons/master/network/bsc.jpg"
    case 137:
      return "https://raw.githubusercontent.com/sushiswap/icons/master/network/polygon.jpg"
    case 80001:
      return "https://raw.githubusercontent.com/sushiswap/icons/master/network/polygon.jpg"
    case 43113:
      return "https://raw.githubusercontent.com/sushiswap/icons/master/network/avalanche.jpg"
    case 43114:
      return "https://raw.githubusercontent.com/sushiswap/icons/master/network/avalanche.jpg"
    default:
      return "https://via.placeholder.com/30x30"
  }
}

export const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
}

export const getProviders = () => {

  const chainIds = SUPPORT_CHAINS

  return chainIds.map(chainId => {

    let url

    if (chainId === 42) {
      url = "https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
    } else if (chainId === 25) {
      url = "https://evm.cronos.org"
    } else if (chainId === 137) {
      url = "https://nd-643-057-168.p2pify.com/2ffe10d04df48d14f0e9ff6e0409f649"
    } else if (chainId === 80001) {
      url = "https://nd-546-345-588.p2pify.com/8947d77065859cda88213b612a0f8679"
    } else if (chainId === 97) { 
      url = getRandomItem(["https://data-seed-prebsc-1-s1.binance.org:8545", "https://data-seed-prebsc-2-s1.binance.org:8545", "https://data-seed-prebsc-1-s3.binance.org:8545", "https://data-seed-prebsc-2-s3.binance.org:8545"])
    } else if (chainId === 56) {
      url = getRandomItem(["https://bsc-dataseed1.binance.org","https://bsc-dataseed2.binance.org" ,"https://bsc-dataseed3.binance.org", "https://bsc-dataseed4.binance.org"])
    } else if (chainId === 43113) {
      url = "https://nd-473-270-876.p2pify.com/613a7805f3d64a52349b6ca19b6e27a7/ext/bc/C/rpc"
    } else if (chainId === 43114) {
      url = "https://nd-752-163-197.p2pify.com/fd84ccbd64f32d8f8a99adb5d4557b0e/ext/bc/C/rpc"
    } else if (chainId === 1) {
      url = "https://nd-814-913-142.p2pify.com/cb3fe487ef9afa11bda3c38e54b868a3"
    }

    if (!url) {
      return
    }

    const provider = new ethers.providers.JsonRpcProvider(url)

    return {
      chainId,
      provider
    }
  })
}


export const shorterName = (name) => {
  return name.length > 28 ? `${name.slice(0, 15)}...${name.slice(-4)}` : name
}

export const shorterText = (name) => {
  return name.length > 150 ? `${name.slice(0, 150)}...` : name
}

