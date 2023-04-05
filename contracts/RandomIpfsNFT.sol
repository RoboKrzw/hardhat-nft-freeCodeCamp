// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity ^0.8.7;

// errors
error RandomIpfsNFT__NeedMoreEthSent();
error RandomIpfsNFT__RangeOutOfBounds();
error RandomIpfsNFT__TransferFailed();
error AlreadyInitialized();

contract RandomIpfsNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // w tym kontrakcie wezmiemy random number z chainlinka
    // nastepnie na podstawie tego numeru zostanie nam przyznany losowo jeden z trzech NFT
    // jeden z NFT bedzie super rzadki, drugi sredni, trzeci zwyczajny

    // trzeba bedzie zaplacic pewna ilosc ETH aby zdobyc NFT
    // wlasciciel bedzie mogl wyplacic ETH

    // Type declarations (oprocz uintów, stringów, itd)
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    // ponizej bierzemy zmienne z VRFCoordinatorV2Interface -> requestRandomWords
    // bytes32 keyHash,
    // uint64 subId,
    // uint16 minimumRequestConfirmations,
    // uint32 callbackGasLimit,
    // uint32 numWords
    VRFCoordinatorV2Interface immutable private i_vrfCoordinatorV2;
    uint64 private immutable i_subscriptionID;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // VRF helpers
    // wszędzie tam gdzie nasza zmienna będzie tzw storage-variable, czyli taka której zachowanie kosztuje duzo gazu, to do nazwy mozna dokleic s_....
    mapping(uint256 => address) public s_requestIdToSender;

    // NFT variables
    uint256 public s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_dogTokenUris;
    uint256 internal immutable i_mintFee;
    bool private s_initialized;

    // Events
    event NFTRequested(uint256 indexed requestId, address requester);
    event NFTMinted(Breed dogBreed, address minter);

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionID,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[3] memory dogTokenUris,
        uint256 mintFee
        )
        VRFConsumerBaseV2(vrfCoordinatorV2) ERC721 ("random ipfs NFT", "RIN") Ownable() {
        i_vrfCoordinatorV2 = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionID = subscriptionID;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_dogTokenUris = dogTokenUris;
        i_mintFee = mintFee;
    }

    function requestNFT() public payable returns (uint256 requestId) {
        if(msg.value < i_mintFee){
            revert RandomIpfsNFT__NeedMoreEthSent();
        }
        requestId = i_vrfCoordinatorV2.requestRandomWords(
            i_gasLane,
            i_subscriptionID,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;
        emit NFTRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestID, uint256[] memory randomWords) internal override {
        // tu nalezy stworzyc mapping miedzy osobami ktore zamawiają NFT a zamowieniem
        // dlatego tez nie mozemy od razu uzyc ponizszej funkcji, bo msg.senderem bedzie CHAINLINK
        // _safeMint(msg.sender, s_tokenCounter);
        address dogNFTOwner = s_requestIdToSender[requestID];
        uint256 newTokenId = s_tokenCounter;

        // teraz kreujemy naszego tokena
        uint256 moddedRNG = randomWords[0] % MAX_CHANCE_VALUE;
        // to bedzie działało tak, że 0-9 najrzadszy, 10-39 sredni, 40-99 najczestszy
        
        Breed dogBreed = getBreedFromModdedRNG(moddedRNG);
        s_tokenCounter += s_tokenCounter;

        // dopiero teraz mozemy
        _safeMint(dogNFTOwner, newTokenId);
        _setTokenURI(newTokenId, s_dogTokenUris[uint256(dogBreed)]);

        emit NFTMinted(dogBreed, dogNFTOwner);
    }

    // ponizej korzystamy z modifiera z kotraktu Ownable
    // modifier onlyOwner() {
    //     _checkOwner();
    //     _;
    // }
    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if(!success){
            revert RandomIpfsNFT__TransferFailed();
        }
    }

    function getChanceArray() public pure returns(uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function _initializeContract(string[3] memory dogTokenUris) private {
        if (s_initialized) {
            revert AlreadyInitialized();
        }
        s_dogTokenUris = dogTokenUris;
        s_initialized = true;
    }

    function getBreedFromModdedRNG(uint256 moddedRNG) public pure returns(Breed) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++){
            if(moddedRNG >= cumulativeSum && moddedRNG < cumulativeSum + chanceArray[i]){
                return Breed(i);
            }
            cumulativeSum += chanceArray[i];
        }
        revert RandomIpfsNFT__RangeOutOfBounds();
    }

    function getMintFee() public view returns(uint256) {
        return i_mintFee;
    }

    function getDogTokenUris(uint256 index) public view returns(string memory) {
        return s_dogTokenUris[index];
    }

    function getTokenCounter() public view returns(uint256) {
        return s_tokenCounter;
    }
}