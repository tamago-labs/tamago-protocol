const aws = require("@pulumi/aws");
const awsx = require("@pulumi/awsx");

const axios = require("axios")

const { resolveChainName, generateMoralisParams } = require("../utils")

const getMetadata = async (nft) => {
    let metadata = JSON.parse(nft.metadata);

    // fetch from token uri
    if (!metadata && nft && nft.token_uri) {
        console.log("no metadata!");

        let uri = nft.token_uri.replaceAll(
            "000000000000000000000000000000000000000000000000000000000000000",
            ""
        );

        if (uri.indexOf("https://") === -1) {
            uri = `https://${uri}`;
        }

        if (uri.indexOf("{id}") !== -1) {
            uri = uri.replaceAll("{id}", nft.token_id);
        }

        try {
            // call
            const { data } = await axios.get(`${uri}`);

            if (data && data.data) {
                metadata = data.data;
                if (!metadata["image"] && data.data["image_url"]) {
                    metadata["image"] = data.data["image_url"];
                }
            }
        } catch (e) { }
    }

    if (
        metadata &&
        metadata.image &&
        metadata.image.indexOf("ipfs://") !== -1
    ) {
        metadata.image = metadata.image.replaceAll(
            "ipfs://",
            "https://nftstorage.link/ipfs/"
        );
    }

    if (metadata && !metadata.image && metadata["image_url"]) {
        metadata.image = metadata["image_url"];
    }

    return {
        ...nft,
        metadata,
    };
};


exports.fetchMetadata = async ({
    chainId,
    contractAddress,
    tokenId,
    metadataTable
}) => {

    const Moralis = require("moralis-v1/node")

    console.log("Fetching Metadata : ", chainId, contractAddress, tokenId)

    await Moralis.start(generateMoralisParams(Number(chainId)))

    const options = {
        address: `${contractAddress}`,
        token_id: `${tokenId}`,
        chain: `0x${Number(chainId).toString(16)}`,
    };

    try {
        const tokenIdMetadata = await Moralis.Web3API.token.getTokenIdMetadata(options);
        const metadata = await getMetadata(tokenIdMetadata)

        // update the record
        // let params = {
        //     TableName: metadataTable.name.get(),
        //     Key: {
        //         "chainIdAndContract": `${chainId.toLowerCase()}/${contractAddress.toLowerCase()}`,
        //         "tokenId": `${tokenId}`
        //     }
        // };

        const client = new aws.sdk.DynamoDB.DocumentClient()
        // let { Item } = await client.get(params).promise()

        const updatedTimestamp = Math.floor(new Date().valueOf() / 1000)

        const updateData = {
            "chainIdAndContract": `${chainId.toLowerCase()}/${contractAddress.toLowerCase()}`,
            "tokenId": `${tokenId}`,
            metadata,
            updatedTimestamp
        }

        const params = {
            TableName: metadataTable.name.get(),
            Item: { ...updateData }

        }

        console.log("saving : ", params)

        await client.put(params).promise()

    } catch (e) {
        console.log(e)
    }

}