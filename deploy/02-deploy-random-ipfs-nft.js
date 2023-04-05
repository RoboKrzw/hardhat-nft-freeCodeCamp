const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")

const imagesLocation = ("./images/random/")

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "doggy dog",
            value: 100
        }
    ]
}  

let tokenUris = [
    'ipfs://Qma4nYkJVQ1SrZeKzzni2cyR4xV8KWhJ7YZYp5kLG2rJUC',
    'ipfs://Qmd1wZJiwx1eRU3W6oPbWDzG3qzxPbivRwxFiMC2t5TNFT',
    'ipfs://QmYQQkoaEM6vFGreZBTEypjbowa9EmPnKqR5xV4mEYQUC3'
]

const FUND_AMOUNT = "1000000000000000000000"

module.exports = async function({getNamedAccounts, deployments}){
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoordinatorV2Address, subscriptionId, VRFCoordinatorV2Mock
    
    // get IPFS hashes of our png
    if(process.env.UPLOAD_TO_PINATA == "true"){
        tokenUris = await handleTokenUris() 
    }
    
    if(developmentChains.includes(network.name)){
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address
        const tx = await VRFCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait()
        subscriptionId = txReceipt.events[0].args.subId
        // ponizej Fund the subscription
        // Our mock makes it so we don't actually have to worry about sending fund
        await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log("--------------------------------")

    // ponizej bierzemy wszystkie zmienne z konstruktora
    //     address vrfCoordinatorV2,
    //     uint64 subscriptionID,
    //     bytes32 gasLane,
    //     uint32 callbackGasLimit,
    //     string[3] memory dogTokenUris,
    //     uint256 mintFee

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].keyHash,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        networkConfig[chainId].mintFee
    ]

    const randomIpfsNft = await deploy("RandomIpfsNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    await VRFCoordinatorV2Mock.addConsumer(
        subscriptionId,
        randomIpfsNft.address
    )

    log("--------------------------------")

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying.........")
        await verify(randomIpfsNft.address, args)
    }

    await storeImages(imagesLocation)
}

async function handleTokenUris(){
    tokenUris = []
    const {responses: imageUploadResponses, files} = await storeImages(imagesLocation)
    for (imageUploadResponseIndex in imageUploadResponses) {
        // stworzyc metadata
        // uploadowac metadata
        let tokenUriMetadata = {...metadataTemplate}
        // powyzszy zapis sprawia ze rozpakowujemy wszystko z metadataTemplate i wciskamy do zmiennej
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace("png", "")
        tokenUriMetadata.description = `this is ${tokenUriMetadata.name} pup`
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
        // powyzej IpfsHash zwracane jest w response od funkcji pinFileToIPFS - która jest w uploadToPinata.js
        // jest to nam potrzebne aby nadac naszej metadata image
        console.log(`Uploading ${tokenUriMetadata.name}...`)
        // store JSON to pinata/IPFS
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log("Tokens URIs uploaded. They are:")
    console.log(tokenUris)
    return tokenUris
}


module.exports.tags = ["all", "random", "main"]