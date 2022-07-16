
export const shortAddress = (address, first = 6, last = -4) => {
  return `${address.slice(0, first)}...${address.slice(last)}`
}

export const resolveNetworkName = (networkId) => {
  switch (networkId) {
    case 1:
      return "Ethereum"
    case 42:
      return "Kovan"
    case 56:
      return "BNB Smart Chain"
    case 97:
      return "BNB Testnet"
    case 137:
      return "Polygon"
    case 80001:
      return "Mumbai"
    case 43113:
      return "Fuji Testnet"
    case 43114:
      return "Avalanche"
    default:
      return "Not Support Chain"
  }
}


export const shorterName = (name) => {
  return name.length > 28 ? `${name.slice(0, 15)}...${name.slice(-4)}` : name
}