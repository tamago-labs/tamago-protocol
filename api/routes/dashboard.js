const aws = require("@pulumi/aws");
const { getDashboardData } = require("../controllers/dashboard")

const { headers } = require("./headers")

const getDashboard = async (event, tableName) => {

    console.log("getting Dashboard info...")

    try {

        const result = await getDashboardData({
            tableName,
            entity : "collection"
        })

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                status: "ok",
                ...result
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

const getAllItems = async (event, tableName) => {

    console.log("getting getAllItems info...")

    try {

        const result = await getDashboardData({
            tableName,
            entity : "item"
        })

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                status: "ok",
                ...result
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
    getDashboard,
    getAllItems
}