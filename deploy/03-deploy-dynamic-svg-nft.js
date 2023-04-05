const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")


module.exports = async function({getNamedAccounts, deployments}){
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()
    const chainId = network.config.chainId
    let ethUsdPriceFeedAddress

    if(developmentChains.includes(network.name)) {
        const EthUseAggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeedAddress = EthUseAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    const lowSvg = fs.readFileSync("./images/dynamic/frown.svg", {encoding: "utf-8"})
    const highSvg = fs.readFileSync("./images/dynamic/happy.svg", {encoding: "utf-8"})
    // console.log(lowSvg)
    // console.log(highSvg)
    log("----------------------------------------------------")
    args = [ethUsdPriceFeedAddress, lowSvg, highSvg]
    const dynamicSvgNft = await deploy("DynamicSvgNFT",
        {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1
        }
    )

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying.........")
        await verify(dynamicSvgNft.address, args)
    }
}

module.exports.tags = ["all", "dynamic", "main"]