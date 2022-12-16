const aws = require("@pulumi/aws");
const awsx = require("@pulumi/awsx");

const { resolveChainName, generateMoralisParams } = require("../utils")
const { SUPPORT_MAINNET, SUPPORT_TESTNET } = require("../constants");
const { getCollectionData } = require("../controllers/collections");

const wait = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, 500)
    })
}

const slugify = (text) => {
    return text
        .toString()
        .normalize('NFD')                   // split an accented letter in the base letter and the acent
        .replace(/[\u0300-\u036f]/g, '')   // remove all previously split accents
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

exports.fetchDashboardData = async ({
    collectionTable,
    dashboardTable
}) => {

    console.log("fetch dashboard data...")

    const Moralis = require("moralis-v1/node")

    const CHAINS = SUPPORT_MAINNET

    let orders = []

    for (let chainId of CHAINS) {

        await Moralis.start(generateMoralisParams(Number(chainId)))

        // total listing 
        try {
            const OrderCreated = Moralis.Object.extend(
                `${resolveChainName(chainId)}OrderCreated`
            );

            const query = new Moralis.Query(OrderCreated);
            query.limit(1000)

            const results = await query.find();

            orders = orders.concat(results.map(item => ({ chainId, assetAddress: item.get("assetAddress"), timestamp: (item.get("block_timestamp")).valueOf() })))

        } catch (e) {
            console.log(e)
            await wait()
            throw new Error(e.message)
        }

    }

    console.log("Total orders : ", orders.length)

    const collections = orders.sort((a, b) => b.timestamp - a.timestamp).reduce((arr, item) => {
        const exist = arr.find(i => i.assetAddress === item.assetAddress && i.chainId === item.chainId)
        if (!exist) {
            arr.push(item)
        }

        return arr
    }, [])

    console.log("collections : ", collections)

    let collectionWithSlug = []



    for (let collection of collections) {
        const data = await getCollectionData({
            tableName: collectionTable,
            chainId: collection.chainId,
            contractAddress: collection.assetAddress
        })
        let slug
        let title

        if (data && data.title) {
            slug = `${resolveChainName(collection.chainId)}-${slugify(data.title)}`
            title = data.title
        } else {
            slug = `${resolveChainName(collection.chainId)}-${slugify(`${collection.assetAddress}`)}`
        }

        let eligible = true

        // if (data && data.totalOrders === 0) {
        //     eligible = false
        // }

        if (data && !data.cover) {
            eligible = false
        }

        if (eligible === true) {
            collectionWithSlug.push({
                ...collection,
                slug,
                title
            })
        }

    }

    console.log("with slug : ", collectionWithSlug)

    const client = new aws.sdk.DynamoDB.DocumentClient()

    const updatedTimestamp = Math.floor(new Date().valueOf() / 1000)

    const updateData = {
        "version": 1,
        "entity": "collection",
        collections: collectionWithSlug,
        updatedTimestamp
    }

    const params = {
        TableName: dashboardTable,
        Item: { ...updateData }

    }

    console.log("saving : ", params)

    await client.put(params).promise()

}

exports.fetchItemData = async ({
    collectionTable,
    dashboardTable
}) => {

    console.log("fetch item data...")

    const Moralis = require("moralis-v1/node")

    const CHAINS = SUPPORT_MAINNET.concat(SUPPORT_TESTNET)

    let orders = []

    for (let chainId of CHAINS) {

        await Moralis.start(generateMoralisParams(Number(chainId)))

        // total listing 
        try {
            const OrderCreated = Moralis.Object.extend(
                `${resolveChainName(chainId)}OrderCreated`
            );

            const query = new Moralis.Query(OrderCreated);
            query.limit(1000)

            const results = await query.find();

            orders = orders.concat(results.map(item => ({ chainId, cid: item.get("cid"), timestamp: (item.get("block_timestamp")).valueOf() })))

            // check swap events
            const Swapped = Moralis.Object.extend(`${resolveChainName(chainId)}Swapped`);
            const querySwap = new Moralis.Query(Swapped);

            querySwap.limit(1000);

            const swapItems = await querySwap.find();

            let swapCompleted = [];

            for (let object of swapItems) {
                const cid = object.get("cid");
                swapCompleted.push(cid);
            }

            orders = orders.filter((item) => swapCompleted.indexOf(item.cid) === -1);

            // check cancel events
            const Canceled = Moralis.Object.extend(`${resolveChainName(chainId)}Canceled`);
            const queryCanceled = new Moralis.Query(Canceled);

            queryCanceled.limit(1000)

            const cancelItems = await queryCanceled.find();

            let cancelCompleted = []

            for (let object of cancelItems) {
                const cid = object.get("cid")
                cancelCompleted.push(cid)
            }

            orders = orders.filter(item => cancelCompleted.indexOf(item.cid) === -1)

        } catch (e) {
            console.log(e)
            await wait()
            throw new Error(e.message)
        }



    }

    orders = orders.sort(function (a, b) {
        return b.timestamp - a.timestamp;
    });

    console.log("all items : ", orders)

    const client = new aws.sdk.DynamoDB.DocumentClient()

    const updatedTimestamp = Math.floor(new Date().valueOf() / 1000)

    const updateData = {
        "version": 1,
        "entity": "item",
        items: orders,
        updatedTimestamp
    }

    const params = {
        TableName: dashboardTable,
        Item: { ...updateData }

    }

    console.log("saving : ", params)

    await client.put(params).promise()

}

