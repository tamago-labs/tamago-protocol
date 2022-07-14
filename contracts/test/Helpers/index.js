const { ethers } = require("ethers")

exports.fromEther = (value) => {
    return ethers.utils.formatEther(value)
}

exports.fromUsdc = (value) => {
    return ethers.utils.formatUnits(value, 6)
}

exports.toEther = (value) => {
    return ethers.utils.parseEther(`${value}`)
}

exports.toUsdc = (value) => {
    return ethers.utils.parseUnits(`${value}`, 6)
}
