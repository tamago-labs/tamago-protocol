const aws = require("@pulumi/aws");
const awsx = require("@pulumi/awsx");

const { resolveChainName, generateMoralisParams } = require("../utils")


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

const IGNORE_LIST = [
    "0x22c1f6050e56d2876009903609a2cc3fef83b415"
]

exports.fetchCollectionInfo = async ({
    chainId,
    contractAddress,
    queueName,
    collectionTable
}) => {

    console.log("Fetching Collection Info : ", chainId, contractAddress)

    if (IGNORE_LIST.includes(contractAddress)) {
        return
    }

    // check if duplicate
    const client = new aws.sdk.DynamoDB.DocumentClient()
    const { Item } = await client.get({
        TableName: collectionTable.name.get(),
        Key: {
            "chainId": Number(chainId),
            "contractAddress": `${contractAddress.toLowerCase()}`
        }
    }).promise()

    if (Item) {

        let needUpdate = false

        if (!Item.updatedTimestamp) {
            needUpdate = true
        }

        if (Item.updatedTimestamp) {
            const currentTimestamp = Math.floor(new Date().valueOf() / 1000)
            if ((currentTimestamp - Number(Item.updatedTimestamp)) > (86400 * 10)) {
                needUpdate = true
            }
        }

        if (!needUpdate) {
            console.log("No need to update.")
            return
        }
    }

    const Moralis = require("moralis-v1/node")

    await Moralis.start(generateMoralisParams(Number(chainId)))

    let totalOrders = 0

    console.log("Getting total orders...")
    // total listing 
    try {
        const OrderCreated = Moralis.Object.extend(
            `${resolveChainName(Number(chainId))}OrderCreated`
        );

        const query = new Moralis.Query(OrderCreated);

        query.equalTo("assetAddress", (contractAddress).toLowerCase());
        query.limit(1000)

        const results = await query.find();

        console.log("total OrderCreated events : ", results.length)

        totalOrders = results.length

    } catch (e) {
        console.log(e)
        await wait()
        throw new Error(e.message)
    }

    // // TODO : combine gateway's orders

    console.log("Total orders : ", totalOrders)

    const sqs = new aws.sdk.SQS();

    const message = {
        operation: "fetchCollectionInfo2",
        contractAddress,
        chainId,
        queueName,
        totalOrders
    }

    const params = {
        MessageBody: JSON.stringify(message),
        QueueUrl: queueName,
    };

    await sqs.sendMessage(params).promise()
}

exports.fetchCollectionInfo2 = async ({
    chainId,
    contractAddress,
    queueName,
    collectionTable,
    totalOrders
}) => {


    const Moralis = require("moralis-v1/node")

    console.log("Fetching Collection Info Stage #2 : ", chainId, contractAddress)

    await Moralis.start(generateMoralisParams(Number(chainId)))

    let totalOwners = 0

    console.log("Getting total owners...")
    // total owners 
    try {
        if (contractAddress !== "0x2953399124f0cbb46d2cbacd8a89cf0599974963") {

            const options = {
                address: `${contractAddress}`,
                chain: `0x${Number(chainId).toString(16)}`,
            };

            let result = await Moralis.Web3API.token.getNFTOwners(options);
            let owners = result.result.map(item => item['owner_of'])

            let count = 0

            while (result.next) {
                result = await result.next()
                const o = result.result.map(item => item['owner_of'])
                owners = owners.concat(o)
                count += 1
                if (count > 100) {
                    break
                }
            }

            console.log("owner count --> ", count)

            owners = Array.from(new Set(owners));
            totalOwners = owners.length
        } else {
            totalOwners = 1000000
        }
    } catch (e) {
        console.log(e)
        await wait()
        throw new Error(e.message)
    }
    console.log("Total owners : ", totalOwners)


    const sqs = new aws.sdk.SQS();

    const message = {
        operation: "fetchCollectionInfo3",
        contractAddress,
        chainId,
        queueName,
        totalOrders,
        totalOwners
    }

    const params = {
        MessageBody: JSON.stringify(message),
        QueueUrl: queueName,
    };

    await sqs.sendMessage(params).promise()
}

exports.fetchCollectionInfo3 = async ({
    chainId,
    contractAddress,
    queueName,
    collectionTable,
    totalOrders,
    totalOwners
}) => {

    const Moralis = require("moralis-v1/node")

    console.log("Fetching Collection Info Stage #3 : ", chainId, contractAddress)

    await Moralis.start(generateMoralisParams(Number(chainId)))

    let totalSupply = 0
    let tokens = []

    const options = {
        address: `${contractAddress}`,
        chain: `0x${Number(chainId).toString(16)}`,
    };

    // get total items first
    console.log("Getting total items...")
    try {
        if (contractAddress !== "0x2953399124f0cbb46d2cbacd8a89cf0599974963") {
            let result = await Moralis.Web3API.token.getAllTokenIds(options);

            tokens = result.result.map(item => {
                return item['token_id']
            })

            let count = 0

            while (result.next) {
                result = await result.next()
                const output = result.result.map(item => {
                    return item['token_id']
                })
                tokens = tokens.concat(output)

                count += 1

                if (count > 100) {
                    break
                }

            }

            console.log("items count --> ", count)

            totalSupply = tokens.length
        } else {
            totalSupply = 1655037
        }

    } catch (e) {
        console.log(e)
        await wait()
        throw new Error(e.message)
    }

    console.log("Total items : ", totalSupply)
    console.log("Total tokens : ", tokens)

    const client = new aws.sdk.DynamoDB.DocumentClient()

    const updatedTimestamp = Math.floor(new Date().valueOf() / 1000)

    const existing = await client.get({
        TableName: collectionTable.name.get(),
        Key: {
            "chainId": Number(chainId),
            "contractAddress": `${contractAddress.toLowerCase()}`
        }
    }).promise()


    let existingData = {}

    if (existing && existing.Item) {
        existingData = existing.Item
    }


    const updateData = {
        "chainId": Number(chainId),
        "contractAddress": `${contractAddress.toLowerCase()}`,
        ...existingData,
        totalOrders,
        totalSupply,
        tokens,
        totalOwners,
        updatedTimestamp
    }

    const params = {
        TableName: collectionTable.name.get(),
        Item: { ...updateData }
    }

    console.log("saving : ", params)

    await client.put(params).promise()
}
