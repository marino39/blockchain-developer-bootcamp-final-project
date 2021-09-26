// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";


// @author Marcin Gorzynski
// @title The Advertisement Surface NFT
// @description The contract used to tokenize advertisement infrastructure and bid on it's usage.
contract AdvertisementSurface is ERC721Enumerable {

    using SafeMath for uint256;

    struct AdvertisementSurfaceInfo {
        address erc20;           // The address of ERC20 token contract used for payments.
        uint256 minBid;          // Minimal bid for advertisement per 1 second.
        address defaultERC721;   // The default contract address for advertisement.
        uint256 defaultTokenId;  // The default advertisement that's shown if no bids available.
        string metadataURI;      // The off-chain AdvertisementSurfaceInfo metadata.
        bytes32 metadataHash;    // The hash of off-chain AdvertisementSurfaceInfo metadata.
    }

    struct Bid {
        address erc721;    // The contract address for advertisement ERC721 token.
        uint256 tokenId;   // The advertisement to be shown.
        uint256 bid;       // The bid for unit of time(second). The total is bid * duration.
        uint64 startTime;  // The start of the advertisement.
        uint64 duration;   // The duration of the advertisement.
    }

    mapping (uint256 => AdvertisementSurfaceInfo) private tokenIdToAdvertisementSurfaceInfo;

    constructor() ERC721("Advertisement Surface", "ADS") {}

    // @description It gets AdvertisementSurfaceInfo by the token id.
    // @param _tokenId The id of the token for which the info is returned.
    function getAdvertisementSurfaceInfo(uint256 _tokenId) public view returns(AdvertisementSurfaceInfo memory) {
        return tokenIdToAdvertisementSurfaceInfo[_tokenId];
    }

    // @description The function that tokenize the advertisement surface. Once activated
    // advertisement time slots can be auctioned to clients.
    // @param _AdsInfo The advertisement surface description that consists of on-chain data
    // necessary for auctioning process and off-chain metadata useful for clients e.g. location,
    // size, resolution.
    function registerAdvertisementSurface(AdvertisementSurfaceInfo memory _AdsInfo) external {
        _mint(_AdsInfo);
    }

    function _mint(AdvertisementSurfaceInfo memory _AdsInfo) private {
        _safeMint(msg.sender, totalSupply() + 1);
        tokenIdToAdvertisementSurfaceInfo[totalSupply()] = _AdsInfo;
    }

}