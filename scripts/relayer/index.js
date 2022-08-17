#!/usr/bin/env node

require("dotenv").config();
const retry = require("async-retry");
const logger = require('loglevel');
const { ethers } = require("ethers")
const { MerkleTree } = require('merkletreejs')
const keccak256 = require("keccak256")
const axios = require("axios")

const Moralis = require("moralis/node")

logger.enableAll()

const {
    delay,
    getProviders,
    generateRelayMessages,
    getRelayerKey,
    getGasPrices,
    getAllOrders
} = require("../helper")
const { API_BASE, NFT_MARKETPLACE, SUPPORT_CHAINS } = require("../constants")
const { GATEWAY_ABI } = require("../abi")


async function run({
    pollingDelay,
    errorRetries,
    errorRetriesTimeout
}) {

    try {

        while (true) {

            let retries = 0

            await retry(
                async () => {
                    // get all orders

                    let orders = []

                    for (let id of SUPPORT_CHAINS) {
                        orders = orders.concat(await getAllOrders(id))
                    }

                    let ordersWithDetails = []
                    // get the full data
                    for (let order of orders) {
                        const { cid } = order
                        const { data } = await axios.get(
                            `https://${cid}.ipfs.nftstorage.link/`
                        );
                        const orderWithDetails = {
                            ...order,
                            ...data
                        }
                        ordersWithDetails.push(orderWithDetails)
                    }

                    logger.debug(`Prepare providers for chain : ${SUPPORT_CHAINS}`)

                    const providers = getProviders(SUPPORT_CHAINS)

                    // Prepare the message
                    const messages = generateRelayMessages(ordersWithDetails)

                    logger.debug("Total messages : ", messages.length)

                    // Construct the merkle 
                    const leaves = messages.map(({ cid, chainId, assetAddress, assetTokenIdOrAmount }) => ethers.utils.keccak256(ethers.utils.solidityPack(["string", "uint256", "address", "uint256"], [cid, chainId, assetAddress.toLowerCase(), assetTokenIdOrAmount]))) // Order ID, Chain ID, Asset Address, Token ID
                     
                    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
                    const hexRoot = tree.getHexRoot()

                    logger.debug("Merkle root to push : ", hexRoot)

                    const push = async (obj) => {
                        const { provider, chainId } = obj

                        try {

                            const currentBlock = await provider.getBlockNumber()

                            logger.debug(`chain id : ${chainId} stamped at block : ${Number(currentBlock)}`)

                            const wallet = new ethers.Wallet(getRelayerKey(), provider)
                            const walletAddress = wallet.address

                            const row = NFT_MARKETPLACE.find(item => item.chainId === chainId)
                            const { gatewayAddress } = row
                            const gatewayContract = new ethers.Contract(gatewayAddress, GATEWAY_ABI, wallet)

                            const currentRoot = await gatewayContract.relayRoot()

                            logger.debug("Current root on chain : ", chainId, " is : ", currentRoot)

                            let { BASE_GAS, gasLimit } = await getGasPrices(chainId)

                            if (currentRoot !== hexRoot) {
                                const tx = await gatewayContract.updateRelayMessage(hexRoot, {
                                    from: walletAddress,
                                    gasPrice: ethers.utils.parseUnits(`${BASE_GAS * (retries + 1)}`, 'gwei'),
                                    gasLimit: gasLimit * (retries + 1)
                                })
                                logger.debug("tx on chain : ", chainId, " is being processed...")
                                await tx.wait()
                                logger.debug("update root on chain id : ", chainId, " completed")
                            }
                        } catch (e) {
                            logger.debug(`update failed on : ${chainId}`, e)
                        }

                    }

                    await Promise.all(providers.map(item => push(item)))
                }, {
                retries: errorRetries,
                minTimeout: errorRetriesTimeout * 1000, // delay between retries in ms
                randomize: false,
                onRetry: error => {
                    console.log(error)
                    retries += 1
                    logger.debug(error.message)
                }
            })

            logger.debug("End of execution loop ", (new Date()).toLocaleTimeString())
            await delay(Number(pollingDelay));
        }
    }
    catch (error) {
        // If any error is thrown, catch it and bubble up to the main try-catch for error processing in the Poll function.
        throw typeof error === "string" ? new Error(error) : error;
    }

}

async function Poll(callback) {
    try {

        console.log("Start of process", (new Date()).toLocaleTimeString())

        const executionParameters = {
            pollingDelay: Number(process.env.POLLING_DELAY) || 180, // 3 minutes
            queryDelay: Number(process.env.QUERY_DELAY) || 40,
            queryInterval: { 137: 40000, 1: 4000 },
            errorRetries: Number(process.env.ERROR_RETRIES) || 5,
            errorRetriesTimeout: Number(process.env.ERROR_RETRIES_TIMEOUT) || 10
        }

        await run({ ...executionParameters });

    } catch (error) {

        logger.error(error.message)

        callback(error)
    }
    callback()
}


function nodeCallback(err) {
    if (err) {
        console.error(err);
        process.exit(1);
    } else process.exit(0);
}


// If called directly by node, execute the Poll Function. This lets the script be run as a node process.
if (require.main === module) {
    Poll(nodeCallback)
        .then(() => { })
        .catch(nodeCallback);
}