const aws = require("@pulumi/aws");

exports.getCollectionData = async ({
    tableName,
    chainId,
    contractAddress
}) => {

    const client = new aws.sdk.DynamoDB.DocumentClient()

    const params = {
        TableName: tableName,
        Key: {
            "chainId": Number(chainId),
            "contractAddress": `${contractAddress.toLowerCase()}`
        }
    }

    const { Item } = await client.get(params).promise()

    return Item
}