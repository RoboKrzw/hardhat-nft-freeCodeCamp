// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity ^0.8.7;

error ERC721Metadata__URI_QueryFor_NonExistentToken();

contract DynamicSvgNFT is ERC721, Ownable {
    uint256 private s_tokenCounter;
    string private s_lowImageUri;
    string private s_highImageUri;
    mapping(uint256 => int256) public s_tokenToHighValue;
    AggregatorV3Interface internal immutable i_priceFeed;

    event CreatedNFT(uint256 indexed tokenId, int256 highValue);
    
    constructor(address priceFeedAddress, string memory lowSvg, string memory highSvg) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
        s_lowImageUri = saveSvgToImageUri(lowSvg);
        s_highImageUri = saveSvgToImageUri(highSvg);
    }

    function mintNFT(int256 highValue) public {
        // pozwalamy nabywcom samemu ustalić granicę zmiany z low na high!!
        s_tokenToHighValue[s_tokenCounter] = highValue;
        // dobrze zapdejtować token counter przed _safeMint()
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        // funkcja _safeMint bierze adres nadawcy oraz index
        emit CreatedNFT(s_tokenCounter, highValue);
    }

    // ponizej dlatego pure bo nie mamy do czynienia z zadnymi stanami
    function saveSvgToImageUri(string memory svg) public pure returns (string memory) {
        // ponizsza funkcja wezmie any svg i wypluje nam URL
        // trzeba ją kiedys wykorzystac
        string memory baseUrl = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(baseUrl, svgBase64Encoded));
    }

    function _baseURI() internal pure override returns(string memory) {
        // data:image/svg+xml;base64 <---- to jest przedrostek do pliku svg
        // data:application/json;base64 <---- to jest przedrostek do pliku json
        return "data:application/json;base64";
    }

    // ponizej bierzemy funkcje z kontraktu erc721 i ją overridujemy
    function tokenURI(uint256 tokenId) public view override returns(string memory) {
        if (!_exists(tokenId)) {
        revert ERC721Metadata__URI_QueryFor_NonExistentToken();
        }
        // ponizej mamy funkcje latestRoundData i jej parametry, nas interesuje jedynie drugi, dlatego reszte pozostawiamy blank
        // (
        //     uint80 roundID,
        //     int price,
        //     uint startedAt,
        //     uint timeStamp,
        //     uint80 answeredInRound
        // ) = priceFeed.latestRoundData();
        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageURI = s_lowImageUri;
        if (price >= s_tokenToHighValue[tokenId]) {
            imageURI = s_highImageUri;
        }
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(), // You can add whatever name here
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );            
    }

    function getLowSVG() public view returns (string memory) {
        return s_lowImageUri;
    }

    function getHighSVG() public view returns (string memory) {
        return s_highImageUri;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}