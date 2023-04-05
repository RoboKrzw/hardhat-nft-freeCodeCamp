const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const fs = require("fs")
const { resolve } = require("path")


module.exports = async function({getNamedAccounts}){
    const {deployer} = await getNamedAccounts()
    const chainId = network.config.chainId

    // -----------------------BASIC NFT-------------------------
    console.log("-------->minting basic nft<---------")
    const basicNFT = await ethers.getContract("BasicNFTV2", deployer)
    const basicMintTx = await basicNFT.mintNFT()
    await basicMintTx.wait(1)
    console.log(basicNFT.tokenURI)
    console.log(`Basic NFT index 0 has tokenUri: ${await basicNFT.tokenURI(0)}`)

    // ---------------------RANDOM IPFS NFT---------------------
    // const randomIpfsNFT = await ethers.getContract("RandomIpfsNFT", deployer)
    // const mintFee = await randomIpfsNFT.getMintFee()

    // await new Promise(async (resolve, reject) => {
    //     setTimeout(resolve, 30000) // 5 min
    //     randomIpfsNFT.once("NFTMinted", async function(){
    //         resolve()
    //     })
    //     const randomIpfsNFTMinttX = await randomIpfsNFT.requestNFT({value: mintFee.toString()})
    //     const randomIpfsNFTMinttXReceipt = await randomIpfsNFTMinttX.wait(1)
    //     console.log(randomIpfsNFTMinttXReceipt)
    //     if(developmentChains.includes(network.name)){
    //         const requestId = randomIpfsNFTMinttXReceipt.events[1].args.requestId.toString()
    //         const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
    //         await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNFT.address)
    //     }
    // })
    // console.log(`random ipfs nft index 0 tokenURI: ${await randomIpfsNFT.tokenURI(0)}`)

    // -----------------DYNAMIC SVG NFT-------------------
    console.log("-------->minting dynamic svg<---------")
    const highValue = ethers.utils.parseEther("1800")
    const dynamicSvgNFT = await ethers.getContract("DynamicSvgNFT", deployer)
    const dynamicSvgNFTMintTx = await dynamicSvgNFT.mintNFT(highValue)
    await dynamicSvgNFTMintTx.wait(1)

    console.log(`dynamic index 0 tokenURI: ${await dynamicSvgNFT.tokenURI(0)}`)
}

module.exports.tags = ["all", "mint"]