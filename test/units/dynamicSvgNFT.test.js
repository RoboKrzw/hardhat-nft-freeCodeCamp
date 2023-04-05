const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

const lowSvgImageUri = 
"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8c3ZnIHdpZHRoPSIxMDI0cHgiIGhlaWdodD0iMTAyNHB4IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik01MTIgNjRDMjY0LjYgNjQgNjQgMjY0LjYgNjQgNTEyczIwMC42IDQ0OCA0NDggNDQ4IDQ0OC0yMDAuNiA0NDgtNDQ4Uzc1OS40IDY0IDUxMiA2NHptMCA4MjBjLTIwNS40IDAtMzcyLTE2Ni42LTM3Mi0zNzJzMTY2LjYtMzcyIDM3Mi0zNzIgMzcyIDE2Ni42IDM3MiAzNzItMTY2LjYgMzcyLTM3MiAzNzJ6Ii8+CiAgPHBhdGggZmlsbD0iI0U2RTZFNiIgZD0iTTUxMiAxNDBjLTIwNS40IDAtMzcyIDE2Ni42LTM3MiAzNzJzMTY2LjYgMzcyIDM3MiAzNzIgMzcyLTE2Ni42IDM3Mi0zNzItMTY2LjYtMzcyLTM3Mi0zNzJ6TTI4OCA0MjFhNDguMDEgNDguMDEgMCAwIDEgOTYgMCA0OC4wMSA0OC4wMSAwIDAgMS05NiAwem0zNzYgMjcyaC00OC4xYy00LjIgMC03LjgtMy4yLTguMS03LjRDNjA0IDYzNi4xIDU2Mi41IDU5NyA1MTIgNTk3cy05Mi4xIDM5LjEtOTUuOCA4OC42Yy0uMyA0LjItMy45IDcuNC04LjEgNy40SDM2MGE4IDggMCAwIDEtOC04LjRjNC40LTg0LjMgNzQuNS0xNTEuNiAxNjAtMTUxLjZzMTU1LjYgNjcuMyAxNjAgMTUxLjZhOCA4IDAgMCAxLTggOC40em0yNC0yMjRhNDguMDEgNDguMDEgMCAwIDEgMC05NiA0OC4wMSA0OC4wMSAwIDAgMSAwIDk2eiIvPgogIDxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik0yODggNDIxYTQ4IDQ4IDAgMSAwIDk2IDAgNDggNDggMCAxIDAtOTYgMHptMjI0IDExMmMtODUuNSAwLTE1NS42IDY3LjMtMTYwIDE1MS42YTggOCAwIDAgMCA4IDguNGg0OC4xYzQuMiAwIDcuOC0zLjIgOC4xLTcuNCAzLjctNDkuNSA0NS4zLTg4LjYgOTUuOC04OC42czkyIDM5LjEgOTUuOCA4OC42Yy4zIDQuMiAzLjkgNy40IDguMSA3LjRINjY0YTggOCAwIDAgMCA4LTguNEM2NjcuNiA2MDAuMyA1OTcuNSA1MzMgNTEyIDUzM3ptMTI4LTExMmE0OCA0OCAwIDEgMCA5NiAwIDQ4IDQ4IDAgMSAwLTk2IDB6Ii8+Cjwvc3ZnPgo="
const highSvgImageUri = 
"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgd2lkdGg9IjQwMCIgIGhlaWdodD0iNDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgZmlsbD0ieWVsbG93IiByPSI3OCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPGcgY2xhc3M9ImV5ZXMiPgogICAgPGNpcmNsZSBjeD0iNjEiIGN5PSI4MiIgcj0iMTIiLz4KICAgIDxjaXJjbGUgY3g9IjEyNyIgY3k9IjgyIiByPSIxMiIvPgogIDwvZz4KICA8cGF0aCBkPSJtMTM2LjgxIDExNi41M2MuNjkgMjYuMTctNjQuMTEgNDItODEuNTItLjczIiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6IGJsYWNrOyBzdHJva2Utd2lkdGg6IDM7Ii8+Cjwvc3ZnPg=="

!developmentChains.includes(network.name) 
    ? describe.skip 
    : describe(
        "----> dynamic svg NFT unit test begins <----", function(){
            let dynamicSvgNFT, VRFCoordinatorV2Mock, requestNFT, deployer
            const chainId = network.config

            beforeEach(async function(){
                accounts = await ethers.getSigners()
                deployer = (await getNamedAccounts()).deployer
                // Metoda fixture pozwala na zdeployowanie wszystkich tych, których tag ujęty jest jako argument.
                await deployments.fixture(["all", "dynamic"])
                dynamicSvgNFT = await ethers.getContract("DynamicSvgNFT", deployer)
                VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
                mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
            })

            describe("CONSTRUCTOR", function(){
                it("sets all the values correctly", async function(){
                    const lowSvg = await dynamicSvgNFT.getLowSVG()
                    const highSvg = await dynamicSvgNFT.getHighSVG()
                    const priceFeed = await dynamicSvgNFT.getPriceFeed()
                    assert.equal(lowSvgImageUri, lowSvg)
                    assert.equal(highSvgImageUri, highSvg)
                    assert.equal(priceFeed, mockV3Aggregator.address)
                })
            })

            describe("mintNFT", () => {
                it("emits an event and creates the NFT", async function () {
                    const highValue = ethers.utils.parseEther("1") // 1 dollar per ether
                    await expect(dynamicSvgNFT.mintNFT(highValue)).to.emit(
                        dynamicSvgNFT,
                        "CreatedNFT"
                    )
                    const tokenCounter = await dynamicSvgNFT.getTokenCounter()
                    assert.equal(tokenCounter.toString(), "1")
                    const tokenURI = await dynamicSvgNFT.tokenURI(0)
                    assert.equal(tokenURI, highTokenUri)
                })
                it("shifts the token uri to lower when the price doesn't surpass the highvalue", async function () {
                    const highValue = ethers.utils.parseEther("100000000") // $100,000,000 dollar per ether. Maybe in the distant future this test will fail...
                    const txResponse = await dynamicSvgNFT.mintNFT(highValue)
                    console.log(txResponse)
                    await txResponse.wait(1)
                    const tokenURI = await dynamicSvgNFT.tokenURI(0)
                    assert.equal(tokenURI, lowTokenUri)
                })
            })
        }
    )