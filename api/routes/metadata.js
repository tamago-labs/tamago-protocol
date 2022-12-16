const aws = require("@pulumi/aws");

const { headers } = require("./headers")

const getMetadata = async (event, tableName, queueName) => {

    console.log("getting metadata...")

    try {

        console.log("EVENT: \n" + JSON.stringify(event, null, 2))

        if (event && event.pathParameters) {
            const client = new aws.sdk.DynamoDB.DocumentClient()

            const proxy = event.pathParameters.proxy

            const chainId = proxy.split("/")[0]
            const contractAddress = proxy.split("/")[1]
            const tokenId = proxy.split("/")[2]

            const params = {
                TableName: tableName,
                Key: {
                    "chainIdAndContract": `${chainId.toLowerCase()}/${contractAddress.toLowerCase()}`,
                    "tokenId": `${tokenId.toLowerCase()}`
                }
            }

            const { Item } = await client.get(params).promise()

            if (Item) {

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        status: "ok",
                        ...Item
                    }),
                }
            } else {

                console.log("enlisting for fetching metadata")

                const sqs = new aws.sdk.SQS();

                const message = {
                    operation: "fetchMetadata",
                    contractAddress,
                    chainId,
                    tokenId
                }

                const params = {
                    MessageBody: JSON.stringify(message),
                    QueueUrl: queueName,
                };

                await sqs.sendMessage(params).promise()

                throw new Error("No metadata for this")
            }
        }

        throw new Error("Invalid query params")

    } catch (error) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
                status: "error",
                message: `${error.message || "Unknown error."}`
            }),
        };
    }

}

module.exports = {
    getMetadata
}