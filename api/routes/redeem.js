const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");
const awsx = require("@pulumi/awsx");
const { ethers } = require("ethers");
const { headers } = require("./headers")

const { parseBody, verifySignature } = require("../utils")

const REDEEM_CODES = [
    "2-years-pro",
    "2-years-rising",
    "3-months-rising",
    "4-months-rising"
]

const checkActivationCode = async (event, {
    redeemTableName
}) => {

    if (event && event.pathParameters) {
        const client = new aws.sdk.DynamoDB.DocumentClient()
        const activationCode = event.pathParameters.proxy

        for (let redeemCodeType of REDEEM_CODES) {

            try {
                const { Item } = await client.get({
                    TableName: redeemTableName,
                    Key: {
                        "redeemCodeType": `${redeemCodeType}`,
                        "activationCode": `${activationCode}`
                    }
                }).promise()

                if (Item) {
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            status: "ok",
                            redeemCodeType
                        }),
                    }
                }

            } catch (e) {

            }

        }
    }

    return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
            status: "error",
            message: "Invalid Activation Code"
        }),
    }

}

const claimActivationCode = async (event, {
    redeemTableName,
    accountTableName
}) => {

    console.log("claimActivationCode...")

    try {

        const client = new aws.sdk.DynamoDB.DocumentClient()

        console.log("EVENT: \n" + JSON.stringify(event, null, 2))

        const body = parseBody(event)

        console.log("BODY: \n", body)

        const { account, redeemCodeType, activationCode, message, signature } = body

        verifySignature({
            account,
            message,
            signature
        })

        const redeemResponse = await client.get({
            TableName: redeemTableName,
            Key: {
                "redeemCodeType": `${redeemCodeType}`,
                "activationCode": `${activationCode}`
            }
        }).promise()

        if (redeemResponse && redeemResponse['Item']) {

            const accountResponse = await client.get({
                TableName: accountTableName,
                Key: {
                    "chainType": `evm`,
                    "address": account
                }
            }).promise()

            if (accountResponse && accountResponse['Item']) {

                let accountData = accountResponse['Item']

                if (!accountData['activations']) {
                    accountData['activations'] = []
                }

                accountData['activations'].push({
                    redeemCodeType,
                    activationCode,
                    claimedDate: Math.floor(new Date().valueOf() / 1000),
                    active: true
                })

                console.log("saving : ", accountData)

                await client.put({
                    TableName: accountTableName,
                    Item: accountData
                }).promise()

                console.log("deleting activation code...", activationCode)

                await client.delete({
                    TableName: redeemTableName,
                    Key: {
                        "redeemCodeType": `${redeemCodeType}`,
                        "activationCode": `${activationCode}`
                    }
                }).promise()

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        "status": "ok",
                        "message": "Successfully claimed ✔️",
                        "account": account,
                        "activationCode": activationCode
                    }),
                }

            } else {
                throw new Error("Invalid account")
            }

        } else {
            throw new Error("Invalid activation code")
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


const cancelActivationCode = async (event, {
    accountTableName
}) => {

    console.log("cancelling...")

    try {

        const client = new aws.sdk.DynamoDB.DocumentClient()

        console.log("EVENT: \n" + JSON.stringify(event, null, 2))

        const body = parseBody(event)

        console.log("BODY: \n", body)

        const { account, redeemCodeType, activationCode, message, signature } = body

        verifySignature({
            account,
            message,
            signature
        })

        let { Item } = await client.get({
            TableName: accountTableName,
            Key: {
                "chainType": `evm`,
                "address": account
            }
        }).promise()

        if (!Item['activations']) {
            Item['activations'] = []
        }

        Item['activations'].map((item) => {
            if (item.activationCode === activationCode && item.redeemCodeType === redeemCodeType) {
                item['active'] = false
            }
            return item
        })

        console.log("saving : ", Item)

        await client.put({
            TableName: accountTableName,
            Item
        }).promise()

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                "status": "ok"
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
    checkActivationCode,
    claimActivationCode,
    cancelActivationCode
}