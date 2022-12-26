const aws = require("@pulumi/aws");

const getBountyData = async ({
    tableName,
    slug
}) => {

    const client = new aws.sdk.DynamoDB.DocumentClient()

    const params = {
        TableName: tableName,
        Key: {
            "version": 1,
            "slug": slug
        }
    };

    const { Item } = await client.get(params).promise()

    return Item
}


const updateBountyData = async ({
    tableName,
    account,
    slug,
    fields
}) => {

    const client = new aws.sdk.DynamoDB.DocumentClient()

    let existingData = await getBountyData({
        tableName,
        slug
    })

    if ( (existingData.account.toLowerCase()) !== account.toLowerCase() ) {
        throw new Error("Unauthorized")
    }

    for (let field of fields) {
        const { key, value } = field

        console.log("Updating field : ", key, value)

        existingData['key'] = value
    }

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
}

module.exports = {
    getBountyData,
    updateBountyData
}