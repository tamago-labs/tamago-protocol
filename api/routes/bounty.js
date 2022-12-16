const aws = require("@pulumi/aws");
const { ethers } = require("ethers");
const { headers } = require("./headers")
const { parseBody, verifySignature } = require("../utils")



const getBounty = async (event, tableName) => {

    if (event && event.pathParameters) {
        const client = new aws.sdk.DynamoDB.DocumentClient()
        const slug = event.pathParameters.proxy

        const params = {
            TableName: tableName,
            Key: {
                "version": 1,
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

        const params = {
            TableName: tableName,
            Key: {
                "version": 1,
                "slug": slug
            }
        };

        const client = new aws.sdk.DynamoDB.DocumentClient()

        let { Item } = await client.get(params).promise()

        for (let field of fields) {
            const { key, value } = field

            console.log("Updating field : ", key, value)

            Item['key'] = value
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
    updateBounty
}