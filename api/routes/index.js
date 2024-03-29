const { headers } = require("./headers")
const { getCollection, createCollection, getAllCollections } = require("./collections")
const { getMetadata } = require("./metadata")
const { getAccount, createAccount, getAllAccounts } = require("./account")
const { postMessage, readMessages, removeMessage } = require("./messenger")
const { createPrompt, getAllPrompts, getPrompt, updatePrompt } = require("./prompt")
const { uploadImage } = require("./image")

module.exports = {
    headers,
    getCollection,
    getMetadata,
    getAccount,
    createAccount,
    getAllAccounts,
    createCollection,
    getAllCollections,
    createPrompt,
    getAllPrompts,
    getPrompt,
    updatePrompt,
    uploadImage,
    postMessage,
    readMessages,
    removeMessage
}