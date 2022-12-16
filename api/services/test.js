
const { fetchCollectionInfo,  fetchCollectionInfo2 } = require("./collection")
const { fetchDashboardData } = require("../services/dashboard")

const start = async () => {
    await fetchCollectionInfo(
       {
        chainId : 137,
        contractAddress : "0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f"
       }
    )

    // await fetchDashboardData()

}

start()

