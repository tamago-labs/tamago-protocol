# 20x

![20x-logo-2](https://user-images.githubusercontent.com/18402217/179379473-8f4272c8-2dfb-4730-bed6-d1e2c3638949.png)

20x (https://20x.market) is a decentralized universal marketplace powered by Filecoin networks. It helps anyone create off-chain entries contain assets to be prices and terms and link them to the EVM-based blockchain via the Merkle tree root's hash support of ERC-20, ERC-721 and ERC-1155, after the order is set, potential buyers can check the details retrieved from IPFS and further generate a proof to swap the asset in a decentralized manner. 

### Tech Stack

- Ethereum Soldiity, Hardhat - Smart Contract
- React, Node.js, Merkletree.js, ethers.js, web3-react libraries - Frontend and handy scripts
- Filecoin/IPFS via NFT.storage - Persist of JSON entries
- Moralis  - Catch and store events emitted from the contract 

### Motivation

Blockchain runs computations on all nodes of the network, resulting in high costs to implement a truly P2P marketplace that any type of tokens can be traded as the surge of GameFi/Metaverse popularity we yet have no sustainable solution to trade gamefi items from one platform to another without exchange them into high-volatile native tokens first.

## Payload

A payload is basically the core element of the project defining the way to store asset information to be traded, the Merkle tree root's hash will be created upon its data and attach to the contract. 

```
{
    "category": Name of the category,
    "timestamp": Timestamp,
    "chainId": Chain ID of the base asset,
    "ownerAddress": Wallet address of the owner,
    "baseAssetAddress": Contract address of the NFT or ERC-20,
    "baseAssetTokenIdOrAmount": NFT's Token ID or ERC-20 amount,
    "baseAssetTokenType": Asset Type - 0 - ERC-20, 1 - ERC-721, 2- ERC-1155,
    "barterList": [
        {
            "assetAddress": Contract address of the NFT or ERC-20 to be traded,
            "assetTokenIdOrAmount": NFT's Token ID or ERC-20 amount to be traded,
            "tokenType": Asset Type to be traded,
            "chainId": Chain ID of the asset to be traded
        }
    ]
}
```

One of the example payload:
https://bafkreiayczhsojnlcm7ra6iok6wpwlxznwtfsfzhbrxftog4fxdgq4rkvq.ipfs.nftstorage.link/

After the entry is uploaded successfully on IPFS, the merkle tree will be contructed using the Keccak hash from 4 pieces of information `CID`, `chainId`, `assetAddress`, `assetTokenIdOrAmount`.

## Deployment

### Kovan Testnet (Chain Id : 42)

Contract Name | Contract Address 
--- | --- 
Marketplace | 0x49F74a10855288D2f390E784c349dCD3f44499AC

### Mumbai Testnet (Chain Id : 80001)

Contract Name | Contract Address 
--- | --- 
Marketplace | 0x9286e7a1f66b6f99dB85A345117a330ED5ED79F1

### Avalanche Fuji Testnet (Chain Id : 43113)

Contract Name | Contract Address 
--- | --- 
Marketplace | 0x9682DaBf26831523B21759A50b0a45832f82DBa3

### BNB Smart Chain Testnet (Chain Id : 97)

Contract Name | Contract Address 
--- | --- 
Marketplace | 0x6fdB032668F1F856fbC2e9F5Df348938aFBFBE17

## License

[MIT](./LICENSE)
