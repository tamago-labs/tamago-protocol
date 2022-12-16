"use strict";
const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");
const awsx = require("@pulumi/awsx");

const { resolveChainName, generateMoralisParams } = require("./utils")
const { getCollection, createCollection, getMetadata, getAccount, createAccount, getAllAccounts, getAllCollections, getAllPrompts, createPrompt, getPrompt, postMessage, readMessages, removeMessage } = require("./routes")
const { fetchCollectionInfo, fetchCollectionInfo2, fetchCollectionInfo3 } = require("./services/collection")
const { fetchMetadata } = require("./services/metadata")
// const { fetchDashboardData, fetchItemData } = require("./services/dashboard");
// const { getDashboard, getAllItems } = require("./routes/dashboard");
const { uploadImage, uploadJson } = require("./routes/image")
const { checkActivationCode, claimActivationCode, cancelActivationCode } = require("./routes/redeem")
const { getBounty, getAllBounties, createBounty, updateBounty } = require("./routes/bounty")



const imageBucket = new aws.s3.Bucket("img.tamagonft.xyz", {
    acl: "public-read",
    corsRules: [{
        allowedHeaders: ["*"],
        allowedMethods: [
            "GET",
            "PUT",
            "POST",
        ],
        allowedOrigins: ["*"],
        maxAgeSeconds: 3000,
    }],
});

const bucketPolicy = new aws.s3.BucketPolicy("imageBucket-policy", {
    bucket: imageBucket.bucket,
    policy: imageBucket.bucket.apply(publicReadPolicyForBucket)
})

function publicReadPolicyForBucket(bucketName) {
    return JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Principal: "*",
            Action: [
                "s3:GetObject"
            ],
            Resource: [
                `arn:aws:s3:::${bucketName}/*` // policy refers to bucket name explicitly
            ]
        },
        {
            Effect: "Allow",
            Principal: "*",
            Action: [
                "s3:PutObject"
            ],
            Resource: [
                `arn:aws:s3:::${bucketName}/*` // policy refers to bucket name explicitly
            ]
        }]
    });
}

const dashboardTable = new aws.dynamodb.Table(
    "tamagoDashboardTable",
    {
        attributes: [
            {
                name: "version",
                type: "N"
            },
            {
                name: "entity",
                type: "S"
            }
        ],
        hashKey: "version",
        rangeKey: "entity",
        billingMode: "PAY_PER_REQUEST"
    }
)

const accountTable = new aws.dynamodb.Table(
    "tamagoAccountTable",
    {
        attributes: [
            {
                name: "chainType",
                type: "S"
            },
            {
                name: "address",
                type: "S"
            }
        ],
        hashKey: "chainType",
        rangeKey: "address",
        billingMode: "PAY_PER_REQUEST"
    }
)

const redeemCodeTable = new aws.dynamodb.Table(
    "tamagoRedeemCodeTable",
    {
        attributes: [
            {
                name: "redeemCodeType",
                type: "S"
            },
            {
                name: "activationCode",
                type: "S"
            }
        ],
        hashKey: "redeemCodeType",
        rangeKey: "activationCode",
        billingMode: "PAY_PER_REQUEST"
    }
)

const messageTable = new aws.dynamodb.Table(
    "tamagoMessageTable",
    {
        attributes: [
            {
                name: "account",
                type: "S"
            },
            {
                name: "timestamp",
                type: "N"
            }
        ],
        hashKey: "account",
        rangeKey: "timestamp",
        billingMode: "PAY_PER_REQUEST"
    }
)

const collectionTable = new aws.dynamodb.Table(
    "tamagoCollectionTable",
    {
        attributes: [
            {
                name: "chainId",
                type: "N"
            },
            {
                name: "contractAddress",
                type: "S"
            }
        ],
        hashKey: "chainId",
        rangeKey: "contractAddress",
        billingMode: "PAY_PER_REQUEST"
    }
)

const promptTable = new aws.dynamodb.Table(
    "tamagoPromptTable",
    {
        attributes: [
            {
                name: "version",
                type: "N"
            },
            {
                name: "slug",
                type: "S"
            }
        ],
        hashKey: "version",
        rangeKey: "slug",
        billingMode: "PAY_PER_REQUEST"
    }
)

const bountyTable = new aws.dynamodb.Table(
    "tamagobountyTable",
    {
        attributes: [
            {
                name: "version",
                type: "N"
            },
            {
                name: "slug",
                type: "S"
            }
        ],
        hashKey: "version",
        rangeKey: "slug",
        billingMode: "PAY_PER_REQUEST"
    }
)

const metadataTable = new aws.dynamodb.Table(
    "tamagoMetadataTable",
    {
        attributes: [
            {
                name: "chainIdAndContract",
                type: "S"
            },
            {
                name: "tokenId",
                type: "S"
            }
        ],
        hashKey: "chainIdAndContract",
        rangeKey: "tokenId",
        billingMode: "PAY_PER_REQUEST"
    }
)


const collectionQueue = new aws.sqs.Queue("tamago-collection-queue", {
    visibilityTimeoutSeconds: 300
})

const metadataQueue = new aws.sqs.Queue("tamago-metadata-queue", {
    visibilityTimeoutSeconds: 60
})

const dashboardQueue = new aws.sqs.Queue("tamago-dashboard-queue", {
    visibilityTimeoutSeconds: 180
})

const TamagoApi = new awsx.apigateway.API("tamago-api", {
    routes: [
        // {
        //     method: "GET",
        //     path: "/collection/{proxy+}",
        //     eventHandler: new aws.lambda.CallbackFunction("getCollectionInfo", {
        //         callback: async (event) => await getCollection(event, collectionTable.name.get(), collectionQueue.url.get())
        //     })
        // },
        // {
        //     method: "GET",
        //     path: "/collections",
        //     eventHandler: new aws.lambda.CallbackFunction("getAllCollections", {
        //         callback: async (event) => await getAllCollections(event, collectionTable.name.get())
        //     })
        // },
        // {
        //     method: "POST",
        //     path: "/collection",
        //     eventHandler: new aws.lambda.CallbackFunction("createCollection", {
        //         memorySize: 256,
        //         callback: async (event) => await createCollection(event, collectionTable.name.get()),
        //     })
        // },
        {
            method: "GET",
            path: "/bounty/{proxy+}",
            eventHandler: new aws.lambda.CallbackFunction("getBounty", {
                callback: async (event) => await getBounty(event, bountyTable.name.get())
            })
        },
        {
            method: "GET",
            path: "/bounties",
            eventHandler: new aws.lambda.CallbackFunction("getAllBounties", {
                callback: async (event) => await getAllBounties(event, bountyTable.name.get())
            })
        },
        {
            method: "POST",
            path: "/bounty",
            eventHandler: new aws.lambda.CallbackFunction("createBounty", {
                callback: async (event) => await createBounty(event, bountyTable.name.get()),
            })
        },
        {
            method: "POST",
            path: "/bounty/update",
            eventHandler: new aws.lambda.CallbackFunction("updateBounty", {
                callback: async (event) => await updateBounty(event, bountyTable.name.get()),
            })
        },
        {
            method: "GET",
            path: "/prompt/{proxy+}",
            eventHandler: new aws.lambda.CallbackFunction("getPrompt", {
                callback: async (event) => await getPrompt(event, promptTable.name.get())
            })
        },
        {
            method: "GET",
            path: "/prompts",
            eventHandler: new aws.lambda.CallbackFunction("getAllPrompts", {
                callback: async (event) => await getAllPrompts(event, promptTable.name.get())
            })
        },
        {
            method: "POST",
            path: "/prompt",
            eventHandler: new aws.lambda.CallbackFunction("createPrompt", {
                memorySize: 256,
                callback: async (event) => await createPrompt(event, promptTable.name.get()),
            })
        },
        {
            method: "GET",
            path: "/messages/{proxy+}",
            eventHandler: new aws.lambda.CallbackFunction("getMessage", {
                callback: async (event) => await readMessages(event, messageTable.name.get())
            })
        },
        {
            method: "POST",
            path: "/message",
            eventHandler: new aws.lambda.CallbackFunction("postMessage", {
                callback: async (event) => await postMessage(event, messageTable.name.get()),
            })
        },
        {
            method: "POST",
            path: "/message/remove",
            eventHandler: new aws.lambda.CallbackFunction("removeMessage", {
                callback: async (event) => await removeMessage(event, messageTable.name.get()),
            })
        },
        {
            method: "GET",
            path: "/activationCode/{proxy+}",
            eventHandler: new aws.lambda.CallbackFunction("checkActivationCode", {
                callback: async (event) => await checkActivationCode(event, {
                    redeemTableName: redeemCodeTable.name.get()
                })
            })
        },
        {
            method: "POST",
            path: "/activationCode",
            eventHandler: new aws.lambda.CallbackFunction("claimActivationCode", {
                callback: async (event) => await claimActivationCode(event, {
                    redeemTableName: redeemCodeTable.name.get(),
                    accountTableName : accountTable.name.get()
                })
            })
        },
        {
            method: "POST",
            path: "/activationCode/cancel",
            eventHandler: new aws.lambda.CallbackFunction("cancelActivationCode", {
                callback: async (event) => await cancelActivationCode(event, {
                    accountTableName : accountTable.name.get()
                })
            })
        },
        // {
        //     method: "GET",
        //     path: "/metadata/{proxy+}",
        //     eventHandler: new aws.lambda.CallbackFunction("getMetadata", {
        //         callback: async (event) => await getMetadata(event, metadataTable.name.get(), metadataQueue.url.get())
        //     })
        // },
        // {
        //     method: "GET",
        //     path: "/dashboard",
        //     eventHandler: new aws.lambda.CallbackFunction("getDashboard", {
        //         callback: async (event) => await getDashboard(event, dashboardTable.name.get())
        //     })
        // },
        // {
        //     method: "GET",
        //     path: "/dashboard/items",
        //     eventHandler: new aws.lambda.CallbackFunction("getItems", {
        //         callback: async (event) => await getAllItems(event, dashboardTable.name.get())
        //     })
        // },
        {
            method: "GET",
            path: "/account/{proxy+}",
            eventHandler: new aws.lambda.CallbackFunction("getAccount", {
                callback: async (event) => await getAccount(event, accountTable.name.get())
            })
        },
        {
            method: "GET",
            path: "/accounts",
            eventHandler: new aws.lambda.CallbackFunction("getAccounts", {
                callback: async (event) => await getAllAccounts(event, accountTable.name.get())
            })
        },
        {
            method: "POST",
            path: "/account",
            eventHandler: new aws.lambda.CallbackFunction("createAccount", {
                memorySize: 256,
                callback: async (event) => await createAccount(event, accountTable.name.get()),
            })
        },
        {
            method: "POST",
            path: "/image",
            eventHandler: new aws.lambda.CallbackFunction("uploadImage", {
                memorySize: 256,
                callback: async (event) => await uploadImage(event, { bucket: imageBucket }),
            })
        },
        {
            method: "POST",
            path: "/json",
            eventHandler: new aws.lambda.CallbackFunction("uploadJson", {
                memorySize: 256,
                callback: async (event) => await uploadJson(event, { bucket: imageBucket }),
            })
        }
    ]
})

// collectionQueue.onEvent("collection-subscription", async (event) => {

//     console.log("Received: " + JSON.stringify(event, null, 2));

//     for (let record of event.Records) {
//         const { body } = record
//         const { operation } = JSON.parse(body)

//         if (operation === "fetchCollectionInfo") {
//             const { chainId, contractAddress, queueName } = JSON.parse(body)
//             await fetchCollectionInfo({
//                 chainId,
//                 contractAddress,
//                 collectionTable,
//                 queueName
//             })
//         } else if (operation === "fetchCollectionInfo2") {
//             const { chainId, contractAddress, queueName, totalOrders } = JSON.parse(body)
//             await fetchCollectionInfo2({
//                 chainId,
//                 contractAddress,
//                 collectionTable,
//                 queueName,
//                 totalOrders
//             })
//         } else if (operation === "fetchCollectionInfo3") {
//             const { chainId, contractAddress, queueName, totalOrders, totalOwners } = JSON.parse(body)
//             await fetchCollectionInfo3({
//                 chainId,
//                 contractAddress,
//                 collectionTable,
//                 queueName,
//                 totalOrders,
//                 totalOwners
//             })
//         }

//     }
// }, { batchSize: 1 });

// metadataQueue.onEvent("metadata-subscription", async (event) => {

//     console.log("Received: " + JSON.stringify(event, null, 2));

//     for (let record of event.Records) {
//         const { body } = record
//         const { operation } = JSON.parse(body)

//         if (operation === "fetchMetadata") {
//             const { chainId, contractAddress, tokenId } = JSON.parse(body)
//             await fetchMetadata({
//                 chainId,
//                 contractAddress,
//                 tokenId,
//                 metadataTable
//             })
//         }

//     }
// }, { batchSize: 1 });

// dashboardQueue.onEvent("dashboard-subscription", async (event) => {

//     console.log("Received: " + JSON.stringify(event, null, 2));

//     for (let record of event.Records) {
//         const { body } = record
//         const { operation } = JSON.parse(body)

//         if (operation === "fetchDashboard") {
//             await fetchDashboardData({
//                 collectionTable: collectionTable.name.get(),
//                 dashboardTable: dashboardTable.name.get()
//             })
//         } else if (operation === "fetchItems") {
//             await fetchItemData({
//                 collectionTable: collectionTable.name.get(),
//                 dashboardTable: dashboardTable.name.get()
//             })
//         }

//     }
// }, { batchSize: 1 });

// const fetchDashboard = async (
//     event
// ) => {

//     const queueName = dashboardQueue.url.get()

//     const sqs = new aws.sdk.SQS();

//     const message = {
//         operation: "fetchDashboard",
//     }

//     const params = {
//         MessageBody: JSON.stringify(message),
//         QueueUrl: queueName,
//     };

//     await sqs.sendMessage(params).promise()
// };

// const fetchItems = async (
//     event
// ) => {

//     const queueName = dashboardQueue.url.get()

//     const sqs = new aws.sdk.SQS();

//     const message = {
//         operation: "fetchItems",
//     }

//     const params = {
//         MessageBody: JSON.stringify(message),
//         QueueUrl: queueName,
//     };

//     await sqs.sendMessage(params).promise()
// };

// PRODUCTION constants 
const domainName = "api.tamagonft.xyz";
const route53DomainZoneId = "Z10028361K27B58WP2R28";
const certARN = "arn:aws:acm:us-east-1:057386374967:certificate/74047fd0-6974-487a-ac9f-227189f03497";

const domain = new aws.apigateway.DomainName("domain", {
    certificateArn: certARN,
    domainName: domainName,
});

const mapping = new aws.apigateway.BasePathMapping("mapping", {
    restApi: TamagoApi.restAPI,
    basePath: "v1",
    stageName: TamagoApi.stage.stageName,
    domainName: domain.domainName,
});

const record = new aws.route53.Record("record", {
    type: "A",
    zoneId: route53DomainZoneId,
    name: domainName,
    aliases: [{
        name: domain.cloudfrontDomainName,
        zoneId: domain.cloudfrontZoneId,
        evaluateTargetHealth: true,
    }],
});

// const fetchDashboardSchedule = aws.cloudwatch.onSchedule(
//     "fetchDashboard",
//     "rate(2 hours)",
//     fetchDashboard,
// );

// const fetchItemsSchedule = aws.cloudwatch.onSchedule(
//     "fetchItems",
//     "rate(1 hour)",
//     fetchItems,
// );

exports.collectionTable = collectionTable.name
exports.TamagoApi = TamagoApi.url;