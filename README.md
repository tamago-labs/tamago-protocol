# Tamago Protocol

Tamago Protocol is a multi-chain P2P universal asset trading protocol powered by Filecoin/IPFS networks. It helps anyone create off-chain entries contain assets to be prices and terms and link them to the EVM-based blockchain via the Merkle tree root's hash support of ERC-20, ERC-721 and ERC-1155, after the order is set, potential buyers can check the details retrieved from IPFS and further generate a proof to swap the asset in a decentralized manner. 

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

After the entry is uploaded successfully on IPFS, the merkle tree will be contructed using Keccak for hashing `CID`, `chainId`, `assetAddress`, `assetTokenIdOrAmount` into  a fixed 256-bits long string. The leaves are rolled out the lowest leaf up to the root hash. When buying, the buyer generates a proof with his/her owned asset that matched a list of assets made by the seller in order to swap the asset in a decentralized manner.


## Cross-chain Transactions

The non-cross-chain transaction requires a contract `marketplace.sol` to keeps track of all arbitrary entities, root hashes submitted by its users while multi-chain transactions we seperate the contract into `gateway.sol` that wrapped the marketplace contract with cross-chain capability, it works by off-chain validator nodes that run by the scripts under the `/script` folder, the validator acts as agents that translate off-chain arbitrary data from IPFS  then batch available outstanding requests into a single batch request and submit to every gateway contracts in the system.

![tamago-nft-Page-4 drawio (2) (1)](https://user-images.githubusercontent.com/18402217/185110157-77cf3278-f6e5-4b93-88e7-81f06fe7b017.png)




## Deployment

### Cronos (Chain id : 25)

Contract Name | Contract Address 
--- | --- 
Marketplace | 0xf2260B00250c772CB64606dBb88d9544F709308C
Factory | 0x5eCD2Af4bc20DEebF12f332Eb4812289e3CB9c99
Ticket | 0x505D3E62045829a133D0384f75c8fb4c856A94DB

### Ethereum (Chain id : 1)

Contract Name | Contract Address 
--- | --- 
Marketplace | 0x260fC7251fAe677B6254773d347121862336fb9f

### BNB Chain (Chain id : 56) 

Contract Name | Contract Address 
--- | --- 
Marketplace | 0xC8def0BE43D35a247e03EEd09C9afBd5FC866769
Factory | 0x5eCD2Af4bc20DEebF12f332Eb4812289e3CB9c99
Ticket | 0x505D3E62045829a133D0384f75c8fb4c856A94DB

### Avalanche (Chain id : 43114) 

Contract Name | Contract Address 
--- | --- 
Marketplace | 0x7D17d5903eDEdB8597c9343c94FeD74E93589e47
Factory | 0xb1780D5F7154ce904FA3D164D9Ed63005245c2b9
Ticket | 0xf6A61A2CfCE9F55F4eC19EeBd2750E1C627E6D13

### Polygon (Chain id : 137) 

Contract Name | Contract Address 
--- | --- 
Marketplace | 0xd0B14b314B6B983889b68E6EA307BF210156A050
Factory | 0x5d5b6e0af587633b41eaa89de0a60b3052a13f21

### Mumbai Testnet (Chain Id : 80001)

Contract Name | Contract Address 
--- | --- 
Marketplace | 0x334aB2599bC5ABEbAcA54C3E8aF68ee94Ad586fD
Gateway | 0xD84cE28B4D502237c518328230c39E8A371121a5
Ticket | 0xFdB35092c0cf5e1A5175308CB312613972C3DF3D
Factory | 0x5F7392Ec616F829Ab54092e7F167F518835Ac740

### Avalanche Fuji Testnet (Chain Id : 43113)

Contract Name | Contract Address 
--- | --- 
Marketplace | 0x7D17d5903eDEdB8597c9343c94FeD74E93589e47
Gateway | 0xbF06fEC9271B2440E8f3Be87392e2415025Cd4A9
Ticket | 0x5578D955DC00d2155Ad3420bd1D3b064F6a6F084
Factory | 0xe03dFA1B78e5A25a06b67C73f32f3C8739ADba7c

### BNB Smart Chain Testnet (Chain Id : 97)

Contract Name | Contract Address 
--- | --- 
Marketplace | 0xbF06fEC9271B2440E8f3Be87392e2415025Cd4A9
Gateway | 0x5F7392Ec616F829Ab54092e7F167F518835Ac740
Ticket | 0x2e3D4D9be3a74bfB2D1B61c52018556f7B67d36A
Factory | 0x772195938d86fcf500dF18563876d7Cefcf47e4D

## License

[MIT](./LICENSE)
