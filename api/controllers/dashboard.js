const aws = require("@pulumi/aws");

exports.getDashboardData = async ({
    tableName,
    entity
}) => {

    const client = new aws.sdk.DynamoDB.DocumentClient()

    const params = {
        TableName: tableName,
        Key: {
            "version": 1,
            "entity": `${entity}`
        }
    }

    const { Item } = await client.get(params).promise()

    return Item
}

