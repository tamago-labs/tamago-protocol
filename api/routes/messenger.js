const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");
const awsx = require("@pulumi/awsx");
const { ethers } = require("ethers");
const { headers } = require("./headers")

const { parseBody } = require("../utils")

const postMessage = async (event, tableName) => {

    console.log("Posting messages")

    try {

        console.log("EVENT: \n" + JSON.stringify(event, null, 2))

        const body = parseBody(event)

        console.log("BODY: \n", body)

        const { sender, recipient, message, signature } = body

        // verify the address
        console.log("Verifying the address :  ", sender)

        const recoveredAddress = ethers.utils.verifyMessage(message, signature)

        console.log("Recovered address : ", recoveredAddress)

        if (recoveredAddress.toLowerCase() === sender.toLowerCase()) {

            const timestamp = Math.floor(new Date().valueOf() / 1000)

            let params = {
                TableName: tableName,
                Item: {
                    account: recipient,
                    cc: false,
                    sender,
                    recipient,
                    message,
                    timestamp
                }
            }

            console.log("saving : ", params)

            const client = new aws.sdk.DynamoDB.DocumentClient()

            await client.put(params).promise()

            // keep another copy for the sender
            params.Item.account = sender
            params.Item.cc = true

            await client.put(params).promise()

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    "status": "ok",
                    "timestamp": timestamp
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

const readMessages = async (event, tableName) => {

    if (event && event.pathParameters) {
        const client = new aws.sdk.DynamoDB.DocumentClient()
        const account = event.pathParameters.proxy

        const currentTimestamp = Math.floor(new Date().valueOf() / 1000)
        const last90DayTimestamp = currentTimestamp - (86400 * 90)

        const params = {
            TableName: tableName,
            KeyConditionExpression: "#account = :account and #timestamp BETWEEN :from AND :to",
            ExpressionAttributeNames: {
                "#account": "account",
                "#timestamp": "timestamp"
            },
            ExpressionAttributeValues: {
                ":account": account,
                ":from": last90DayTimestamp,
                ":to": currentTimestamp
            }
        };

        const { Items } = await client.query(params).promise()

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                status: "ok",
                messages: (Buffer.from(JSON.stringify(Items))).toString('base64')
            }),
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

const removeMessage = async (event, tableName) => {

    console.log("removing message...")

    try {

        console.log("EVENT: \n" + JSON.stringify(event, null, 2))

        const body = parseBody(event)

        console.log("BODY: \n", body)

        const { sender, recipient, timestamp, message, signature } = body

        // verify the address
        console.log("Verifying the address :  ", sender)

        const recoveredAddress = ethers.utils.verifyMessage(message, signature)

        console.log("Recovered address : ", recoveredAddress)

        if (recoveredAddress.toLowerCase() === sender.toLowerCase()) {

            const client = new aws.sdk.DynamoDB.DocumentClient()

            let params = {
                TableName: tableName,
                Key: {
                    "account": sender,
                    "timestamp": Number(timestamp)
                }
            }

            await client.delete(params).promise()

            params['Key']['account'] = recipient

            await client.delete(params).promise()

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

module.exports = {
    postMessage,
    readMessages,
    removeMessage
}