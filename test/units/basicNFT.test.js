const { assert } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) 
    ? describe.skip 
    : describe(
        "basicNFT unit test", 
        function(){
            let basicNFT, deployer
            const chainId = network.config

            beforeEach(async function(){
                // accounts = await ethers.getSigners()
                deployer = (await getNamedAccounts()).deployer
                await deployments.fixture(["all"])
                basicNFT = await ethers.getContract("BasicNFT", deployer)
                // 1) basicNFT unit test
                // "before each" hook for "initializes the NFT correctly":
                // Error: No Contract deployed with name BasicNFT
                // test nie idzie
            })

            // pierwsze co to trzeba sprawdzić czy w konstruktorze wszystko się zgadza
            describe("Constructor", ()=> {
                it("initializes the NFT correctly", async () => {
                    /**
                     * ponizej konstruktor kontraktu erc721
                    * Initializes the contract by setting a `name` and a `symbol` to the token collection.
                    constructor(string memory name_, string memory symbol_) {
                         _name = name_;
                         _symbol = symbol_;
                    }
                    dlatego bierzemy name i symbol + tokenCounter już z naszego kontraktu
                    */
                    const tokenName = await basicNFT.name()
                    const tokenSymbol = await basicNFT.symbol()
                    const tokenCounter = await basicNFT.getTokenCounter()
                    // assert(tokenName == "Dogie")
                    // assert(tokenSymbol == "DOG")
                    // assert(tokenCounter == 0)
                    assert.equal(tokenName, "Dogie")
                    assert.equal(tokenSymbol, "DOG")
                    assert.equal(tokenCounter.toString(), "0")
                })
            })

            describe("Mint NFT", () => {
                beforeEach(async () => {
                    const txResponse = await basicNFT.mintNFT()
                    await txResponse.wait(1)
                })

                it("Allows users to mint an NFT, and updates their account appropriately", async function() {
                    // czemu ponizej jest (0)? - ponieważ bierze tokena o ID = 0
                    // function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
                    //     _requireMinted(tokenId);
                
                    //     string memory baseURI = _baseURI();
                    //     return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
                    // }
                    const tokenURI = await basicNFT.tokenURI(0)
                    const tokenCounter = await basicNFT.getTokenCounter()

                    assert.equal(tokenCounter.toString(), "1")
                    assert.equal(tokenURI, await basicNFT.TOKEN_URI())
                })

                it("Show the correct balance and owner of an NFT after the transaction", async function() {
                    const deployerAddress = deployer.address
                    const deployerBalance = await basicNFT.balanceOf(deployerAddress)
                    // czemu poniżej jest ("0") - ponieważ bierze tokena o ID, z pozycji = 0
                    const owner = await basicNFT.ownerOf("0")

                    assert.equal(deployerBalance.toString(), "1")
                    assert.equal(owner, deployerAddress)
                })
            })
        }
    )