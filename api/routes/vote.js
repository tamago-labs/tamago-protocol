const aws = require("@pulumi/aws");
const { ethers } = require("ethers");
const { headers } = require("./headers")
const { parseBody, verifySignature } = require("../utils")

const postVote = async (event, tableName) => {

    console.log("Vote...")

    try {

        console.log("EVENT: \n" + JSON.stringify(event, null, 2))

        if (event && event.pathParameters) {

            const client = new aws.sdk.DynamoDB.DocumentClient()
            const tokenId = event.pathParameters.proxy

            let params = {
                TableName: tableName,
                Key: {
                    "chainType": "evm",
                    "tokenId": Number(tokenId)
                }
            };

            const { Item } = await client.get(params).promise()

            const body = parseBody(event)

            console.log("BODY: \n", body)

            const {
                account,
                message,
                signature,
                remove = false
            } = body

            verifySignature({
                account,
                message,
                signature
            })

            // TODO : Verify subscriptions

            params = {
                TableName: tableName,
                Item: {
                    "chainType": "evm",
                    "tokenId": Number(tokenId)
                }
            }

            let accounts = []

            if (!remove) {
                if (Item) {
                    accounts = accounts.concat(Item.accounts)
                    if (accounts.indexOf(account) === -1) {
                        accounts.push(account)
                    }
                } else {
                    accounts = [account]
                }
            } else {

                if (Item) {
                    accounts = accounts.concat(Item.accounts)
                    if (accounts.indexOf(account) !== -1) {
                        accounts = accounts.filter(item => item !== account)
                    }
                }  
            }

            params['Item']['accounts'] = accounts
            params['Item']['updated'] = Math.floor(new Date().valueOf() / 1000)

            console.log("updating : ", params)

            await client.put(params).promise()

                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            "status": "ok"
                        }),
                    }
        }

        throw new Error("Invalid given token ID")

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

const getVote = async (event, tableName) => {

    if (event && event.pathParameters) {
        const client = new aws.sdk.DynamoDB.DocumentClient()
        const tokenId = event.pathParameters.proxy

        const params = {
            TableName: tableName,
            Key: { 
                    "chainType": "evm",
                    "tokenId": Number(tokenId)
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
        } else {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    status: "ok",
                    accounts : []
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

module.exports = {
    postVote,
    getVote
} 