

const COLLECTIONS = [
    {
        chainId : 1  ,
        assetAddress : "0x2aea4add166ebf38b63d09a75de1a7b94aa24163",
        title : "Kudos",
        description: "Kudos is a way of showing your appreciation for another Gitcoin member. It's also a way to showcase special skills that a member might have, such as Pythonista, or Design Star."
    },
    {
        chainId : 1  ,
        assetAddress : "0x22c1f6050e56d2876009903609a2cc3fef83b415",
        title : "POAP",
        description: "The Proof of Attendance Protocol"
    },
    {
        chainId : 1  ,
        assetAddress : "0xcdb7c1a6fe7e112210ca548c214f656763e13533",
        title : "Ready Player Cat NFT",
        cover :"https://lh3.googleusercontent.com/fJWSzAchREPit7YTsQ-KiOclTEaG3qz9Fva81-c8wrzYVqxtAEvEdVpWL_gGzddTtsvgaSqRpiq-SSuWqsvlCCZxVT84yoG3hiuHTlI=h600",
        description: "Ready Player Cat (RPC) is the mascot of the MAO DAO gaming metaverse. They are only born one at a time from loot boxes, and each celebrate distinctive qualities and visual characteristics. RPC Genesis is a curated collection of 5,000 unique RPC NFTs on the Ethereum blockchain that also represent MAO DAO membership. Visit www.maonft.com to learn more."
    },
    {
        chainId : 1  ,
        assetAddress : "0x08e795c30476bac6052b28fcda04e44792c7151f",
        title : "The Alien Doogle",
        cover :"https://lh3.googleusercontent.com/0IvLEKmRY09zZthu4vSlSOreQFu2u-vsmSXLcXFwVXLLjile-iUggTjnL95emLIhriWowCfPCbsMhRItyXtT2_p_6tTPhGS7nX3q=h600",
        description: "The Alien Doogle is a 10k derivative project made with love by The Alien Boy in collaboration with a member of our community pennftyak. It is the first derivative project made by a 180 turn from the art style of the OG collection All traits drawn by Caos Boy Beltracchi 3.0 "
    },
    {
        chainId : 137  ,
        assetAddress : "0x109440e0a0b37c0e2a17f91bdea42a8fb17663fb",
        title : "CryptoEmpire Avatars",
        cover: "https://lh3.googleusercontent.com/b7q9f2eZ6TVYEMhOJsG6j4mxjCKVT4aItqZs75cj-Rf-MmAZz4gsMWlKoOpu8pzDB8gbeUOKabY2rDfaKkTalmwtdQ8lZH8D-78EOA=h600",
        description: "CryptoEmpire Avatars are gifts to the early community members and NFT card holders of the CryptoEmpire project. 3,000 avatars, inspired by the CryptoEmpire NFTs, were distributed to select addresses.CryptoEmpire by Web3Games is a NFT card game based on real-time cryptocurrency markets. Players battle each other using 4-card combinations, with each NFT card representing a unique blockchain project and its token price."
    },
    {
        chainId : 137  ,
        assetAddress : "0x046976f19a14ee7d06cb9e983c8142fb2aac0e5e",
        title : "Naga DAO",
        cover: "https://lh3.googleusercontent.com/3Lm-ixb-fh3he10HRGeKgwZckG-ZyrLMB54vUPsC9OiD1AVQ0OmDwrVG8vjE12_MbkTPpzG3jel5OEQ9Ga6ku2l4P6c0Xv6kU5tWTQ=h600",
        description: "Naga DAO is a Thai NFT Incubator for every people. We are a group of people who believe in NFT technology and want to deliver opportunities to everyone who wants to find out and create value with NFT. We aim to cooperate in educating and helping anyone who wants to learn about NFT."
    },
    {
        chainId : 42  ,
        assetAddress : "0xf4d331039448182cf140de338177706657df8ce9",
        title : "Mock CloneX",
        description: "Mock CloneX for testing purpose"
    },
    {
        chainId : 42  ,
        assetAddress : "0x9b13bd06ad29a6f267ddb6d0abe4c6b1a5862b6a",
        title : "Mock Moonbird",
        description: "Mock Moonbird NFT for testing purpose"
    },
    {
        chainId : 80001  ,
        assetAddress : "0x65e38111d8e2561adc0e2ea1eea856e6a43dc892",
        title : "Mock CloneX",
        description: "Mock CloneX for testing purpose"
    },
    {
        chainId : 97  ,
        assetAddress : "0xe5209a4f622c6ed2c158dcccddb69b05f9d0e4e0",
        title : "Mock Coolcat",
        description: "Mock Coolcat NFT for testing purpose"
    },
    {
        chainId : 97  ,
        assetAddress : "0x487f33e1f048159061d059f72a2c165dec5bca5c",
        title : "Mock Moonbird",
        description: "Mock Moonbird NFT for testing purpose"
    },
    {
        chainId : 97  ,
        assetAddress : "0xaba544c167443f3fee33fb49ee7b1b49594c25f3",
        title : "Mock Cryptokitties",
        description: "Mock Cryptokitties NFT for testing purpose"
    },
    {
        chainId : 97  ,
        assetAddress : "0xb07a6a775c94f8b87f920984534533110814d242",
        title : "100 Yen NFT (Testnet)",
        description: "The first collection on the launchpad made by Tamago team that anyone can mint NFT with $1 (~100 JPY) accept in stablecoins, the NFT represents tools, items that commonly seen in 100 yen shops aim to be used further on any Metaverse platforms with total supply of 10,000. When the event is finished, $10,000 raised will be split equally and given to 3 holders via NFTLuckbox."
    },
    {
        chainId : 43113  ,
        assetAddress : "0xe5209a4f622c6ed2c158dcccddb69b05f9d0e4e0",
        title : "Mock Coolcat",
        description: "Mock Coolcat NFT for testing purpose"
    },
    {
        chainId : 43114  ,
        assetAddress : "0xcfd8402927f07a4d1e4dfe7f9c60f6ebf9ed3673",
        cover :"https://pbs.twimg.com/profile_banners/1511859028913266693/1658090826/600x200",
        title : "MOO",
        description: "2000 Cows discovering the universe of $AVAX. Now they must exploit the biodiversity of these planets to survive and build a community!"
    },
    {
        chainId : 43114  ,
        assetAddress : "0xddccc21fc45e96a04d4213e3b0b9e54498107702",
        cover :"https://pbs.twimg.com/profile_banners/1519803354851037184/1658047522/600x200",
        title : "Scourge Apes",
        description: "WAGMIWAGMIWAGMI"
    },
    {
        chainId : 43114  ,
        assetAddress : "0xdcdeb0268dabdb0b1254cba81e22571be32fb33c",
        cover :"https://pbs.twimg.com/profile_banners/1544770250456977408/1657479650/600x200",
        title : "Fire Frens",
        description: "420 Fire Frens spreading across the Avalanche blockchain"
    },
    {
        chainId : 43114  ,
        assetAddress : "0xbcfdd127187eb44e9154fc17c6157875dcdee6df",
        cover :"https://nftcalendar.io/storage/uploads/2022/01/17/fof_banner_wide_0117202221160661e5dc961c04a.png",
        title : "Friend Forest",
        description: "A community of quirky ffrens regenerating Earth through NFTs. Turning degens into regens."
    },
    {
        chainId : 43114  ,
        assetAddress : "0xecdf378e3c4f3f27791c35206727a00a99711662",
        cover :"https://pbs.twimg.com/profile_banners/1548704896836321280/1658077325/600x200",
        title : "Sports Punks",
        description: "Sports Punks NFTs is the gateway to a betting prediction platform."
    },
    {
        chainId : 56  ,
        assetAddress : "0xcd32d9ba75a1ebe133f7d097e274f1e5dd41327d",
        cover :"https://cdn.tofunft.com/covers/upkdcwvnlvzdt47.jpg/1440.png",
        title : "SuperOmni Cockroaches",
        description: "Next level of omni chain - Long after the bomb falls, you and your good deeds are gone, cockroaches will still be here, prowling the streets like armored cars."
    },
    {
        chainId : 56  ,
        assetAddress : "0x3148955b98699a3d567479da2a8cc02412fd2d48",
        cover :"https://cdn.tofunft.com/covers/xiymnj12m8jkgsd.jpg/1440.png",
        title : "Omni kids",
        description: "Omni Kids is a cc0 omnichain nft project minted on different blockchains and transferrable between each"
    },
    {
        chainId : 137 ,
        assetAddress : "0x85cbf58c9d20459339a0b1f586a5fac643a29286",
        cover :"https://lh3.googleusercontent.com/q8Du69baW7q2kTBk8Iv_i1rxUQ56qSllFSey-cHdFuU7v1KjdqBLE-N4lH0s6gSkVHdCxIS6qF3jJ1Cu_rYzl62YgbpxiaqJ4PtYdw=h600",
        title : "CryptoSharks (SHARK)",
        description: "SOLD OUT! It's summer and the CryptoSharks have spread out in the OpenSea. Hunt 'em all!The CryptoSharks is a collection of unique Sharks living on Polygon Blockchain. Each Shark is one of a kind and 100% owned by you; it cannot be replicated, taken away, or destroyed. Holding a Shark grants you an access to members only channels at our Discord, as well as 25%-50% discount on all future collections.Your NFT metadata is hosted on the IPFS the distributed web with a unique CID that you can find in the beginning of this description. We are also working with Pinata as pinning tool to assure that your NFT Metadata will be on IPFS forever and no risk to lose it. You can know more about the advantage of having your NFT Metadata on IPFS with Pinata at Medium.Contact: shark@originative.io"
    },
    {
        chainId : 137 ,
        assetAddress : "0x8634666ba15ada4bbc83b9dbf285f73d9e46e4c2",
        cover :"https://lh3.googleusercontent.com/deWlGC9DVH4hSXd0NUYsPiuZUUDBWTUF9QIHyTXagBBxMA7DtcmGy8KPmFe4tS3hzZgOtZzcoNPHTaxCIJZrD6AmKx4QrbgwihTsvw=h600",
        title : "Chicken Derby",
        description: "Join the most fun and exciting Ethereum-based game where you can own and race your chicken to earn ETH. Brought by the makers of Ganja Farmer. Play now on Chickenderby.com"
    },
    {
        chainId : 137 ,
        assetAddress : "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
        cover :"https://lh3.googleusercontent.com/XDG_JMl6dbvQOwwmKNIVi4XZkjEFtP2ijc5WSbKQwnYmIcDc8qDRyeTZaz7d0MNJ9axtBTse2njEZD61aZZOV7sDbqx65DdIigbSuA=h600",
        title : "OpenSea Shared Storefront",
        description: "These NFTs were minted using OpenSea’s shared contract."
    },
    {
        chainId : 25 ,
        assetAddress : "0xfa15adecd1cc94bd17cf48dd3b41f066fe2812a7",
        cover :"https://img.tamago.finance/vintage-cover.png",
        title : "Vintage Monitor",
        description: "127 old TV set NFT with different face emotions. No roadmap or promises, purely collectible on Cronos blockchain only."
    },

]

export default COLLECTIONS