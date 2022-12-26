const aws = require("@pulumi/aws");
const { ethers } = require("ethers");
const { headers } = require("./headers")
const { parseBody } = require("../utils")


const getPrompt = async (event, tableName) => {

    if (event && event.pathParameters) {
        const client = new aws.sdk.DynamoDB.DocumentClient()
        const slug = event.pathParameters.proxy

        const params = {
            TableName: tableName,
            Key: {
                "version": 2,
                "slug": slug
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
            message: "Invalid Slug"
        }),
    }
}

const getAllPrompts = async (event, tableName) => {

    try {

        const client = new aws.sdk.DynamoDB.DocumentClient()

        console.log("EVENT: \n" + JSON.stringify(event, null, 2))

        const params = {
            TableName: tableName,
            KeyConditionExpression: "#version = :version and #slug BETWEEN :from AND :to",
            ExpressionAttributeNames: {
                "#version": "version",
                "#slug": "slug"
            },
            ExpressionAttributeValues: {
                ":version": 2,
                ":from": "1",
                ":to": "z"
            },
            ProjectionExpression: "title, slug, disabled, category, platform, address, created, tokenIds, images"
        };

        const { Items } = await client.query(params).promise()

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                "status": "ok",
                "prompts": Items
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

const createPrompt = async (event, tableName) => {
    console.log("creating a collection record")

    try {

        console.log("EVENT: \n" + JSON.stringify(event, null, 2))

        const body = parseBody(event)

        console.log("BODY: \n", body)

        // verify the address
        console.log("Verifying the address :  ", body.address)

        const recoveredAddress = ethers.utils.verifyMessage(body.message, body.signature)

        console.log("Recovered address : ", recoveredAddress)

        if (recoveredAddress.toLowerCase() === body.address.toLowerCase()) {

            const params = {
                TableName: tableName,
                Item: {
                    ...body,
                    version: 2,
                    disabled: false,
                    created: Math.floor(new Date().valueOf() / 1000)
                }
            }

            console.log("saving : ", params)

            const client = new aws.sdk.DynamoDB.DocumentClient()

            await client.put(params).promise()

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    "status": "ok"
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

const updatePrompt = async (event, tableName) => {

    console.log("Updating a collection entry")

    try {

        console.log("EVENT: \n" + JSON.stringify(event, null, 2))

        if (event && event.pathParameters) {

            const client = new aws.sdk.DynamoDB.DocumentClient()
            const slug = event.pathParameters.proxy

            const params = {
                TableName: tableName,
                Key: {
                    "version": 2,
                    "slug": slug
                }
            };

            const { Item } = await client.get(params).promise()

            if (Item) {

                console.log("Given slug is valid")

                const { owner } = Item

                const body = parseBody(event)

                console.log("BODY: \n", body)

                // verify the address
                console.log("Verifying the address :  ", body.address)

                const recoveredAddress = ethers.utils.verifyMessage(body.message, body.signature)

                console.log("Recovered address : ", recoveredAddress)

                if (recoveredAddress.toLowerCase() === owner.toLowerCase()) {

                    const params = {
                        TableName: tableName,
                        Item: {
                            ...Item,
                            ...body,
                            version: 2,
                            disabled: false,
                            updated: Math.floor(new Date().valueOf() / 1000)
                        }
                    }

                    console.log("updating : ", params)

                    const client = new aws.sdk.DynamoDB.DocumentClient()

                    await client.put(params).promise()

                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            "status": "ok"
                        }),
                    }

                } else {
                    throw new Error("Invalid signed message / owner")
                }

            }

        }

        throw new Error("Invalid slug")

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
    createPrompt,
    getAllPrompts,
    getPrompt,
    updatePrompt
}