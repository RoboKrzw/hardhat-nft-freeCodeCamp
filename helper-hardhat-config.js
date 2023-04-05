const networkConfig = {
    // 5: {
    //     name: "goerli",
    //     // poniżej umieszczamy po kolei zmienne z constructora
    //     vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    //     keyHash: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    //     subscriptionId: "8230",
    //     callbackGasLimit: "500000",
    //     interval: "30",
    //     mintFee: "10000000000000000", // 0.01 ETH
    // },
    31337: {
        name: "hardhat",
        keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
        mintFee: "10000000000000000", // 0.01 ETH
        callbackGasLimit: "500000", // 500,000 gas
    },
    11155111: {
        name: "sepolia",
        // aby zrealizować zdeponowanie tokena potrzebujemy ze strony 
        // https://docs.chain.link/data-feeds/price-feeds/addresses
        // wkleić w ethUsdPriceFeed odpowiedni ciąg znaków
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        callbackGasLimit: "500000", // 500,000 gas
        mintFee: "10000000000000000", // 0.01 ETH
        subscriptionId: "994", // add your ID here!
        mintFee: "10000000000000000", // 0.01 ETH
    },
}

const INITIAL_SUPPLY = "1000000000000000000000000"
const developmentChains = ["hardhat"]

module.exports = {networkConfig, developmentChains, INITIAL_SUPPLY}