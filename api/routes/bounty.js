const aws = require("@pulumi/aws");
const { ethers } = require("ethers");
const { headers } = require("./headers")
const { parseBody, verifySignature } = require("../utils")
const { getBountyData, updateBountyData } = require("../controllers/bounties")

const getBounty = async (event, tableName) => {

    if (event && event.pathParameters) {

        const slug = event.pathParameters.proxy

        const data = await getBountyData({
            tableName,
            slug
        })

        if (data) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    status: "ok",
                    ...data
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

const getAllBounties = async (event, tableName) => {

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
                ":version": 1,
                ":from": "1",
                ":to": "z"
            },
            ProjectionExpression: "slug, title, account, concepts, issueStatus, createDate, startDate, submissionCutoffDate"
        };

        const { Items } = await client.query(params).promise()

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                "status": "ok",
                "bounties": Items
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

const createBounty = async (event, tableName) => {

    console.log("creating a new bounty...")

    try {

        console.log("EVENT: \n" + JSON.stringify(event, null, 2))

        const body = parseBody(event)

        console.log("BODY: \n", body)

        const {
            account,
            message,
            signature,
            slug,
            title,
            concepts,
            issueStatus,
            createDate,
            startDate,
            submissionCutoffDate,
            description
        } = body

        verifySignature({
            account,
            message,
            signature
        })

        // TODO : Verify subscriptions

        const params = {
            TableName: tableName,
            Item: {
                version: 1,
                slug,
                account,
                title,
                concepts,
                issueStatus,
                createDate,
                startDate,
                submissionCutoffDate,
                description
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
                "slug": slug
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

const updateBounty = async (event, tableName) => {

    console.log("updating a bounty...")

    try {

        console.log("EVENT: \n" + JSON.stringify(event, null, 2))

        const body = parseBody(event)

        console.log("BODY: \n", body)

        const { account, slug, message, signature, fields } = body

        verifySignature({
            account,
            message,
            signature
        })

        // TODO : Verify subscriptions

        await updateBountyData({
            tableName,
            account,
            slug,
            fields
        })

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                "status": "ok",
                "slug": slug
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


const commentBounty = async (event, tableName) => {

    console.log("Commenting...")

    try {

        console.log("EVENT: \n" + JSON.stringify(event, null, 2))

        const body = parseBody(event)

        console.log("BODY: \n", body)

        const {
            account,
            slug,
            message,
            signature,
            comment
        } = body

        verifySignature({
            account,
            message,
            signature
        })

        let existingData = await getBountyData({
            tableName,
            slug
        })

        const msgData = {
            timestamp: Math.floor(new Date().valueOf() / 1000),
            account,
            comment
        }

        if (!existingData['comments']) {
            existingData['comments'] = [
                msgData
            ]
        } else {
            existingData['comments'] = existingData['comments'].push(msgData)
        }

        const client = new aws.sdk.DynamoDB.DocumentClient()

        const params = {
            TableName: tableName,
            Item: {
                ...existingData,
                version: 1,
                slug
            }
        }

        console.log("updating : ", params)

        await client.put(params).promise()

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                "status": "ok",
                "slug": slug
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


const submitBounty = async (event, tableName) => {

    console.log("Submitting a NFT to the bounty")

    try {

        console.log("EVENT: \n" + JSON.stringify(event, null, 2))

        const body = parseBody(event)

        console.log("BODY: \n", body)

        const {
            account,
            slug,
            message,
            signature,
            conceptId,
            tokenId
        } = body

        verifySignature({
            account,
            message,
            signature
        })

        let existingData = await getBountyData({
            tableName,
            slug
        })

        existingData['concepts'].map((val, index) => {
            if (index === conceptId) {
                // if (val['submission'] && val['submission'].indexOf(Number(tokenId)) === -1) {
                //     val['submission'].push(Number(tokenId))
                // }
                val['submission'].push({
                    tokenId : Number(tokenId),
                    account,
                    timestamp : Math.floor((new Date().valueOf() / 1000))
                })
            }
        })

        const client = new aws.sdk.DynamoDB.DocumentClient()

        const params = {
            TableName: tableName,
            Item: {
                ...existingData,
                version: 1,
                slug
            }
        }

        console.log("updating : ", params)

        await client.put(params).promise()

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                "status": "ok",
                "slug": slug
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
    getBounty,
    getAllBounties,
    createBounty,
    updateBounty,
    submitBounty,
    commentBounty
}