export const MORALIS_URL = process.env.MORALIS_MAINNET_SERVER_URL;
export const MORALIS_ID = process.env.MORALIS_MAINNET_APP_ID;
export const NFT_STORAGE_TOKEN = process.env.NFT_STORAGE_TOKEN

export const SUPPORT_CHAINS = [42, 97, 80001, 43113, 137, 56, 43114, 1, 25];

export const MAINNET_CHAINS = [137, 56, 43114, 1, 25];
export const TESTNET_CHAINS = [42, 97, 80001, 43113];

export const COIN_GECKO_API_BASE = "https://api.coingecko.com/api/v3";

export const NFT_MARKETPLACE = [
  {
    chainId: 42,
    contractAddress: "0x49F74a10855288D2f390E784c349dCD3f44499AC",
  },
  {
    chainId: 25,
    contractAddress: "0xf2260B00250c772CB64606dBb88d9544F709308C",
  },
  {
    chainId: 80001,
    contractAddress: "0x9286e7a1f66b6f99dB85A345117a330ED5ED79F1",
  },
  {
    chainId: 97,
    contractAddress: "0x6fdB032668F1F856fbC2e9F5Df348938aFBFBE17",
  },
  {
    chainId: 43113,
    contractAddress: "0x9682DaBf26831523B21759A50b0a45832f82DBa3",
  },
  {
    chainId: 1,
    contractAddress: "0x260fC7251fAe677B6254773d347121862336fb9f",
  },
  {
    chainId: 56,
    contractAddress: "0xC8def0BE43D35a247e03EEd09C9afBd5FC866769",
  },
  {
    chainId: 43114,
    contractAddress: "0x7D17d5903eDEdB8597c9343c94FeD74E93589e47",
  },
  {
    chainId: 137,
    contractAddress: "0xd0B14b314B6B983889b68E6EA307BF210156A050",
  }
];

export const MOCK_NFT = {
  42: {
    list: [
      {
        name: "Mock CloneX",
        address: "0xf4d331039448182cf140de338177706657df8ce9",
        tokenId: "0",
        isERC721: true,
        image:
          "https://img.seadn.io/files/394d49b567bb7fea665326f263cc4b5d.png?auto=format&w=600",
      },
      {
        name: "Moon Birds",
        address: "0x9B13BD06ad29a6f267DDb6d0AbE4c6b1a5862b6A",
        tokenId: "0",
        isERC721: true,
        image: "https://live---metadata-5covpqijaa-uc.a.run.app/images/33",
      },
    ],
  },
  80001: {
    list: [
      {
        name: "Mock CloneX",
        address: "0x65e38111d8e2561aDC0E2EA1eeA856E6a43dC892",
        tokenId: "0",
        isERC721: true,
        image:
          "https://img.seadn.io/files/394d49b567bb7fea665326f263cc4b5d.png?auto=format&w=600",
      },
      {
        name: "Moon Birds",
        address: "0xe5209A4f622C6eD2C158dcCcdDB69B05f9D0E4E0",
        tokenId: "0",
        isERC721: true,
        image: "https://live---metadata-5covpqijaa-uc.a.run.app/images/33",
      },
    ],
  },
  43113: {
    list: [
      {
        name: "Moon Birds",
        address: "0x487f33E1f048159061D059f72a2c165DEc5BCa5c",
        tokenId: "0",
        isERC721: true,
        image: "https://live---metadata-5covpqijaa-uc.a.run.app/images/33",
      },
      {
        name: "Cool Cats",
        address: "0xe5209A4f622C6eD2C158dcCcdDB69B05f9D0E4E0",
        tokenId: "0",
        isERC721: true,
        image:
          "https://drive.google.com/uc?id=15YKL56lgYazC8W-2fX4QJRhYajhYYQA6",
      },
    ],
  },
  97: {
    list: [

      {
        name: "Moon Birds",
        address: "0x487f33E1f048159061D059f72a2c165DEc5BCa5c",
        tokenId: "0",
        isERC721: true,
        image: "https://live---metadata-5covpqijaa-uc.a.run.app/images/33",
      },
      {
        name: "Cool Cats",
        address: "0xe5209A4f622C6eD2C158dcCcdDB69B05f9D0E4E0",
        tokenId: "0",
        isERC721: true,
        image:
          "https://drive.google.com/uc?id=15YKL56lgYazC8W-2fX4QJRhYajhYYQA6",
      },
    ],
  },
};

export const MOCK_TOKEN = [
  {
    symbol: "USDC",
    chainId: 42,
    contract: "0x8F6e0835CCA21892d5296D58EB0C8206B623BF2B",
  },
  {
    symbol: "USDT",
    chainId: 42,
    contract: "0x8afc69A0C245f4d84Ba160F19df1F76a44991d65",
  },
  {
    symbol: "DAI",
    chainId: 42,
    contract: "0xC926A3F31Ad3db8f27Bbfe4aD42a19A0BCaD8059",
  },
  {
    symbol: "USDC",
    chainId: 80001,
    contract: "0x553588e084604a2677e10E46ea0a8A8e9D859146",
  },
  {
    symbol: "DAI",
    chainId: 80001,
    contract: "0x42209A0A2a3D80Ad48B7D25fC6a61ad355901484",
  },
  {
    symbol: "USDC",
    chainId: 43113,
    contract: "0x65e38111d8e2561aDC0E2EA1eeA856E6a43dC892",
  },
  {
    symbol: "DAI",
    chainId: 43113,
    contract: "0x553588e084604a2677e10E46ea0a8A8e9D859146",
  },
  {
    symbol: "USDC",
    chainId: 97,
    contract: "0x65e38111d8e2561aDC0E2EA1eeA856E6a43dC892",
  },
  {
    symbol: "DAI",
    chainId: 97,
    contract: "0x553588e084604a2677e10E46ea0a8A8e9D859146",
  },
];

export const ERC20_TOKENS = [
  {
    chainId: 137,
    contractAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    tokenType: 3,
    symbol: "MATIC",
    decimals: 18
  },
  {
    chainId: 137,
    contractAddress: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    tokenType: 0,
    symbol: "WMATIC",
    decimals: 18,
  },
  {
    chainId: 137,
    contractAddress: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    tokenType: 0,
    symbol: "USDC",
    decimals: 6,
  },
  {
    chainId: 137,
    contractAddress: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    tokenType: 0,
    symbol: "WETH",
    decimals: 18,
  },
  {
    chainId: 137,
    contractAddress: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    tokenType: 0,
    symbol: "DAI",
    decimals: 18,
  },
  {
    chainId: 137,
    contractAddress: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    tokenType: 0,
    symbol: "USDT",
    decimals: 6,
  },
  {
    chainId: 137,
    contractAddress: "0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB",
    tokenType: 0,
    symbol: "JPYC",
    decimals: 18,
  },
  {
    chainId: 56,
    contractAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    tokenType: 3,
    symbol: "BNB",
    decimals: 18
  },
  {
    chainId: 56,
    contractAddress: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    tokenType: 0,
    symbol: "WBNB",
    decimals: 18,
  },
  {
    chainId: 56,
    contractAddress: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    tokenType: 0,
    symbol: "BUSD",
    decimals: 18,
  },
  {
    chainId: 56,
    contractAddress: "0x55d398326f99059fF775485246999027B3197955",
    tokenType: 0,
    symbol: "USDT",
    decimals: 18,
  },
  {
    chainId: 56,
    contractAddress: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    tokenType: 0,
    symbol: "USDC",
    decimals: 18,
  },
  {
    chainId: 43114,
    contractAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    tokenType: 3,
    symbol: "AVAX",
    decimals: 18
  },
  {
    chainId: 43114,
    contractAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    tokenType: 0,
    symbol: "USDC",
    decimals: 6,
  },
  {
    chainId: 43114,
    contractAddress: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
    tokenType: 0,
    symbol: "USDC.e",
    decimals: 6,
  },
  {
    chainId: 43114,
    contractAddress: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
    tokenType: 0,
    symbol: "USDT",
    decimals: 6,
  },
  {
    chainId: 43114,
    contractAddress: "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",
    tokenType: 0,
    symbol: "USDT.e",
    decimals: 6,
  },
  {
    chainId: 43114,
    contractAddress: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
    tokenType: 0,
    symbol: "WETH.e",
    decimals: 18,
  },
  {
    chainId: 43114,
    contractAddress: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
    tokenType: 0,
    symbol: "DAI.e",
    decimals: 18,
  },
  {
    chainId: 43114,
    contractAddress: "0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB",
    tokenType: 0,
    symbol: "JPYC",
    decimals: 18,
  },
  {
    chainId: 1,
    contractAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    tokenType: 0,
    symbol: "WETH",
    decimals: 18,
  },
  {
    chainId: 1,
    contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    tokenType: 0,
    symbol: "USDC",
    decimals: 6,
  },
  {
    chainId: 1,
    contractAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
    tokenType: 0,
    symbol: "DAI",
    decimals: 18,
  },
  {
    chainId: 1,
    contractAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    tokenType: 0,
    symbol: "USDT",
    decimals: 6,
  },
  {
    chainId: 1,
    contractAddress: "0x2370f9d504c7a6e775bf6e14b3f12846b594cd53",
    tokenType: 0,
    symbol: "JPYC",
    decimals: 18,
  },
  {
    chainId: 42,
    contractAddress: "0x8F6e0835CCA21892d5296D58EB0C8206B623BF2B",
    tokenType: 0,
    symbol: "USDC",
    decimals: 6
  },
  {
    chainId: 42,
    contractAddress: "0x8afc69A0C245f4d84Ba160F19df1F76a44991d65",
    tokenType: 0,
    symbol: "USDT",
    decimals: 6
  },
  {
    chainId: 42,
    contractAddress: "0xC926A3F31Ad3db8f27Bbfe4aD42a19A0BCaD8059",
    tokenType: 0,
    symbol: "DAI",
    decimals: 18
  },
  {
    chainId: 80001,
    contractAddress: "0x553588e084604a2677e10E46ea0a8A8e9D859146",
    tokenType: 0,
    symbol: "USDC",
    decimals: 6
  },
  {
    chainId: 80001,
    contractAddress: "0x42209A0A2a3D80Ad48B7D25fC6a61ad355901484",
    tokenType: 0,
    symbol: "DAI",
    decimals: 18
  },
  {
    chainId: 97,
    contractAddress: "0x65e38111d8e2561aDC0E2EA1eeA856E6a43dC892",
    tokenType: 0,
    symbol: "USDC",
    decimals: 6
  },
  {
    chainId: 97,
    contractAddress: "0x553588e084604a2677e10E46ea0a8A8e9D859146",
    tokenType: 0,
    symbol: "DAI",
    decimals: 18
  },
  {
    chainId: 43113,
    contractAddress: "0x65e38111d8e2561aDC0E2EA1eeA856E6a43dC892",
    tokenType: 0,
    symbol: "USDC",
    decimals: 6
  },
  {
    chainId: 43113,
    contractAddress: "0x553588e084604a2677e10E46ea0a8A8e9D859146",
    tokenType: 0,
    symbol: "DAI",
    decimals: 18
  },
  {
    chainId: 25,
    contractAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    tokenType: 3,
    symbol: "CRO",
    decimals: 18
  },
  {
    chainId: 25,
    contractAddress: "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
    tokenType: 0,
    symbol: "WCRO",
    decimals: 18
  },
  // {
  //   chainId: 25,
  //   contractAddress: "0xe44Fd7fCb2b1581822D0c862B68222998a0c299a",
  //   tokenType: 0,
  //   symbol: "WETH",
  //   decimals: 18
  // },
  // {
  //   chainId: 25,
  //   contractAddress: "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
  //   tokenType: 0,
  //   symbol: "USDC",
  //   decimals: 6
  // },
  // {
  //   chainId: 25,
  //   contractAddress: "0x66e428c3f67a68878562e79A0234c1F83c208770",
  //   tokenType: 0,
  //   symbol: "USDT",
  //   decimals: 6
  // },
  // {
  //   chainId: 25,
  //   contractAddress: "0xF2001B145b43032AAF5Ee2884e456CCd805F677D",
  //   tokenType: 0,
  //   symbol: "DAI",
  //   decimals: 18
  // },
  
];
