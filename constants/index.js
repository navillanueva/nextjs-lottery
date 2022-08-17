// we can use this file to export the constants so it is more comfortable to access them
// from the porject repository

const contractAddresses = require("./contractAddresses.json")
const abi = require("./abi.json")

module.exports = {
    abi,
    contractAddresses,
}
