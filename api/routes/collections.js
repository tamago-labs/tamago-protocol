const aws = require("@pulumi/aws");
const { getCollectionData } = require("../controllers/collections");
const { ethers } = require("ethers");

const { headers } = require("./headers")
const { SUPPORT_MAINNET, SUPPORT_TESTNET } = require("../constants")
const { parseBody } = require("../utils")

const getCollection = async (event, tableName, queueName) => {

    console.log("getting collection info...")

    try {

        console.log("EVENT: \n" + JSON.stringify(event, null, 2))

        if (event && event.pathParameters) {

            const proxy = event.pathParameters.proxy

            const chainId = proxy.split("/")[0]
            const contractAddress = proxy.split("/")[1]

            const Item = await getCollectionData({
                tableName,
                chainId,
                contractAddress
            })

            if (Item) {

                let needUpdate = false

                if (!Item.updatedTimestamp) {
                    needUpdate = true
                }

                if (Item.updatedTimestamp) {
                    const currentTimestamp = Math.floor(new Date().valueOf() / 1000)
                    if ((currentTimestamp - Number(Item.updatedTimestamp)) > (86400 * 10)) {
                        needUpdate = true
                    }
                }

                if (needUpdate) {
                    console.log("need update a collection info")
                    const sqs = new aws.sdk.SQS();

                    const message = {
                        operation: "fetchCollectionInfo",
                        contractAddress: Item.contractAddress,
                        chainId: Item.chainId,
                        queueName
                    }

                    const params = {
                        MessageBody: JSON.stringify(message),
                        QueueUrl: queueName,
                    };

                    await sqs.sendMessage(params).promise()
                }

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        status: "ok",
                        ...Item
                    }),
                }
            } else {

                const sqs = new aws.sdk.SQS();

                const message = {
                    operation: "fetchCollectionInfo",
                    contractAddress,
                    chainId,
                    queueName
                }

                const params = {
                    MessageBody: JSON.stringify(message),
                    QueueUrl: queueName,
                };

                await sqs.sendMessage(params).promise()

                throw new Error("Invalid given collection ")
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


const createCollection = async (event, tableName) => {

    console.log("creating a collection record")

    try {

        console.log("EVENT: \n" + JSON.stringify(event, null, 2))

        const body = parseBody(event)

        console.log("BODY: \n", body)

        const {
            chainId,
            category,
            contractAddress,
            description,
            title,
            message,
            signature,
            address,
            links,
            cover
        } = body

        // verify the address
        console.log("Verifying the address :  ", address)

        const recoveredAddress = ethers.utils.verifyMessage(message, signature)

        console.log("Recovered address : ", recoveredAddress)

        if (recoveredAddress.toLowerCase() === address.toLowerCase()) {

            const Item = await getCollectionData({
                tableName,
                chainId,
                contractAddress
            })

            const params = {
                TableName: tableName,
                Item: {
                    ...Item,
                    chainId,
                    contractAddress,
                    description,
                    title,
                    category,
                    links,
                    cover
                }
            }

            console.log("saving : ", params)

            const client = new aws.sdk.DynamoDB.DocumentClient()

            await client.put(params).promise()

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    "status": "ok",
                    "chainId": chainId,
                    "contractAddress": contractAddress
                }),
            }

        } else {
            throw new Error("Invalid signed message")
        }

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

const getAllCollections = async (event, tableName) => {

    try {

        const client = new aws.sdk.DynamoDB.DocumentClient()

        console.log("EVENT: \n" + JSON.stringify(event, null, 2))

        let CHAINS = SUPPORT_MAINNET

        if (event.queryStringParameters && event.queryStringParameters.network === "testnet") {
            CHAINS = SUPPORT_TESTNET
        }

        let output = []

        for (let chainId of CHAINS) {
            const params = {
                TableName: tableName,
                KeyConditionExpression: "#chainId = :chainId and begins_with(#contractAddress , :substring)",
                ExpressionAttributeNames: {
                    "#chainId": "chainId",
                    "#contractAddress": "contractAddress"
                },
                ExpressionAttributeValues: {
                    ":chainId": chainId,
                    ":substring": "0x"
                },
                ProjectionExpression: "chainId, title, contractAddress"
            };

            const { Items } = await client.query(params).promise()

            output = output.concat(Items)
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                "status": "ok",
                "collections": output
            }),
        }

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
    getCollection,
    createCollection,
    getAllCollections
}