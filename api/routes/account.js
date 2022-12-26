const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");
const awsx = require("@pulumi/awsx");
const { ethers } = require("ethers");
const { headers } = require("./headers")

const { parseBody } = require("../utils")

const getAccount = async (event, tableName) => {

    if (event && event.pathParameters) {
        const client = new aws.sdk.DynamoDB.DocumentClient()
        const address = event.pathParameters.proxy

        const params = {
            TableName: tableName,
            Key: {
                "chainType": "evm",
                "address": address
            }
        };

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
        }
    }

    return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
            status: "error",
            message: "Invalid Address"
        }),
    }
}


const getAllAccounts = async (event, tableName) => {

    try {

        const client = new aws.sdk.DynamoDB.DocumentClient()

        console.log("EVENT: \n" + JSON.stringify(event, null, 2))

        const params = {
            TableName: tableName,
            KeyConditionExpression: "#chainType = :chainType and begins_with(#address , :substring)",
            ExpressionAttributeNames: {
                "#chainType": "chainType",
                "#address": "address"
            },
            ExpressionAttributeValues: {
                ":chainType": "evm",
                ":substring": "0x"
            },
            ProjectionExpression: "image, slug, address, alias"
        };

        const { Items } = await client.query(params).promise()

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                "status": "ok",
                "accounts": Items
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

const createAccount = async (event, tableName) => {

    console.log("Createing an account")

    try {

        console.log("EVENT: \n" + JSON.stringify(event, null, 2))

        const body = parseBody(event)

        console.log("BODY: \n", body)

        const { address, alias, image, description, slug, location, collections, message, signature } = body

        // verify the address
        console.log("Verifying the address :  ", address)

        const recoveredAddress = ethers.utils.verifyMessage(message, signature)

        console.log("Recovered address : ", recoveredAddress)

        if (recoveredAddress.toLowerCase() === address.toLowerCase()) {

            const params = {
                TableName: tableName,
                Item: {
                    ...body,
                    "chainType": "evm",
                    "address": address
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
                    "address": address
                }),
            }

        } else {
            throw new Error("Invalid singed message")
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
    getAccount,
    createAccount,
    getAllAccounts
}