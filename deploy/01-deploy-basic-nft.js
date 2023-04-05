const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")


module.exports = async function({getNamedAccounts, deployments}){
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()

    log("----------------------")

    // ponieważ konstruktor kontraktu basicNFT jest pusty (nie ma zmiennych(?)), dajemy pustą array
    const args = []
    const basicNFT = await deploy("BasicNFTV2", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.waitConfirmations || 1
    })

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying..........")
        await verify(basicNFT.address, args)
    }

    log("----------------------")

}

module.exports.tags = ["all", "basic", "main"]