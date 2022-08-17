#!/usr/bin/env node

require("dotenv").config();
const retry = require("async-retry");
const logger = require('loglevel');
const Moralis = require("moralis/node")
const { resolveChainName, generateMoralisParams, orderCreatedABI, swapABI, cancelABI, claimedABI, partialSwappedABI } = require("./utils")

logger.enableAll()

// Subscribe Marketplace's contract to Moralis server ex. npm run subscribe chain_id contract_address 

async function SubscribeGateway(callback) {
    try {

        const args = process.argv.slice(2);
        logger.debug("Incoming args : ", args)
        if (!args[0]) {
            throw new Error("Please provide chain ID as argument [0]")
        }

        const chainId = Number(args[0])

        if (!args[1]) {
            throw new Error("Please provide contract address as argument [1]")
        }

        const contractAddress = (args[1])

        logger.debug("Start of process", (new Date()).toLocaleTimeString())

        await Moralis.start(generateMoralisParams(chainId));

        let options = {
            chainId: `0x${chainId.toString(16)}`,
            address: contractAddress.toLowerCase(),
            topic: "OrderCreated(address, string, address, uint256, uint8, bytes32 )",
            abi: orderCreatedABI,
            limit: 500000,
            tableName: `Gateway${resolveChainName(chainId)}OrderCreated`,
            sync_historical: true,
        };

        logger.debug("Subcribe OrderCreated events...")

        try {
             await Moralis.Cloud.run("watchContractEvent", options, { useMasterKey: true });
        } catch (e) {

        }

        // Subcribe swap event

        options.topic = "Swapped(string, address)"
        options.abi = swapABI
        options.tableName = `Gateway${resolveChainName(chainId)}Swapped`,
        
        logger.debug("Subcribe Swapped events...")

        try {
             await Moralis.Cloud.run("watchContractEvent", options, { useMasterKey: true });
        } catch (e) {

        }

        // Subcribe cancel event

        options.topic = "OrderCanceled(string, address)"
        options.abi = cancelABI
        options.tableName = `Gateway${resolveChainName(chainId)}Canceled`,
        
        logger.debug("Subcribe Canceled events...")

        try {
             await Moralis.Cloud.run("watchContractEvent", options, { useMasterKey: true });
        } catch (e) {

        }

        // Partial Swapped
        options.topic = "PartialSwapped(string, address)"
        options.abi = partialSwappedABI
        options.tableName = `Gateway${resolveChainName(chainId)}PartialSwapped`,
        
        logger.debug("Subcribe PartialSwapped events...")

        try {
             await Moralis.Cloud.run("watchContractEvent", options, { useMasterKey: true });
        } catch (e) {

        }

        // Claimed
        options.topic = "Claimed(string, address, bool)"
        options.abi = claimedABI
        options.tableName = `Gateway${resolveChainName(chainId)}Claimed`,
        
        logger.debug("Subcribe Claimed events...")

        try {
             await Moralis.Cloud.run("watchContractEvent", options, { useMasterKey: true });
        } catch (e) {

        }

        logger.debug("the script is successfully running!")

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
    SubscribeGateway(nodeCallback)
        .then(() => { })
        .catch(nodeCallback);
}
