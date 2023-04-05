const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) 
    ? describe.skip 
    : describe(
        "----> RandomIpfsNft unit test begins <----", function(){
            let randomIpfsNft, VRFCoordinatorV2Mock, requestNFT, deployer
            const chainId = network.config
            
            beforeEach(async function(){
                accounts = await ethers.getSigners()
                deployer = (await getNamedAccounts()).deployer
                // Metoda fixture pozwala na zdeployowanie wszystkich tych, których tag ujęty jest jako argument.
                await deployments.fixture(["all", "random"])
                randomIpfsNft = await ethers.getContract("RandomIpfsNFT", deployer)
                VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
                mintFee = await randomIpfsNft.getMintFee()
            })

            describe("constructor", () => {
                it("sets starting values correctly", async function () {
                    const tokenCounter = await randomIpfsNft.getTokenCounter()
                    const dogTokenUris = await randomIpfsNft.getDogTokenUris(0)
                    assert.equal(tokenCounter, "0")
                    assert(dogTokenUris.includes("ipfs://"))
                })
            })

            describe("paying for nft", function(){
                it("reverts when you dont pay enough", async function(){
                    await expect(randomIpfsNft.requestNFT()).to.be.revertedWith("RandomIpfsNFT__NeedMoreEthSent")
                })
                it("reverts if not enough for mintFee", async function(){
                    await expect(
                        randomIpfsNft.requestNFT({
                        // ponizsza metoda sub oznacza oczywiscie ze jesli wartosc jest ponizej
                        value: mintFee.sub(ethers.utils.parseEther("0.001")),
                    })
                    ).to.be.revertedWith("RandomIpfsNFT__NeedMoreEthSent")
                })
            })

            // describe("fulfill random words", function(){
            //     it("mints NFT after a random number is returned", async function(){
            //         await new Promise(async (resolve, reject) => {
            //         // ponizej "once" odnosi sie do eventu NFTMinted z kontraktu RandomIpfsNft
            //             randomIpfsNft.once("NFTMinted", async () => {
            //                 try {
            //                     const tokenUri = await randomIpfsNft.dogTokenUris("0")
            //                     const tokenCounter = await randomIpfsNft.getTokenCounter()
            //                     assert.equal(tokenUri.toString().includes("ipfs://"), true)
            //                     assert.equal(tokenCounter.toString(), "1")
            //                     resolve()
            //                 } catch (e) {
            //                     console.log(e)
            //                     reject(e)
            //                 }
            //             })
            //             // try {
            //             //     const requestNftResponse = await randomIpfsNft.requestNFT({
            //             //         value: mintFee.toString(),
            //             //     })
            //             //     const requestNftReceipt = await requestNftResponse.wait(1)
            //             //     await vrfCoordinatorV2Mock.fulfillRandomWords(
            //             //         requestNftReceipt.events[1].args.requestId,
            //             //         randomIpfsNft.address
            //             //     )
            //             // } catch (e) {
            //             //     console.log(e)
            //             //     reject(e)
            //             // }
            //         })
            //     })
            // })

            describe("get the correct breed", function(){
                // assert equal i te numery 1,2,3 - 
                // przedstawiają kolejnosc z ponizszego obiektu
                // który jest jako ENUM w kontrakcie RandomIpfsNft
                // enum Breed {
                //     PUG,
                //     SHIBA_INU,
                //     ST_BERNARD
                // }
                it("should return pug if rng num > 10", async function(){
                    const pug = await randomIpfsNft.getBreedFromModdedRNG(5)
                    assert.equal(0, pug)
                })
                it("should return shiba inu 10 >= num > 40", async function(){
                    const shibaInu = await randomIpfsNft.getBreedFromModdedRNG(14)
                    assert.equal(1, shibaInu)
                })
                it("should return st bernard 40 >= num > 100", async function(){
                    const stBernard = await randomIpfsNft.getBreedFromModdedRNG(66)
                    assert.equal(2, stBernard)
                })
            })
        }
    )
