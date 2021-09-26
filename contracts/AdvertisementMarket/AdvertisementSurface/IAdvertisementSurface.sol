// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

// @author Marcin Gorzynski
// @title The Advertisement Surface NFT interface
// @description The contract used to tokenize advertisement infrastructure and bid on it's usage.
interface IAdvertisementSurface is IERC721Enumerable {

    struct AdvertisementSurfaceInfo {
        address erc20;           // The address of ERC20 token contract used for payments.
        uint256 minBid;          // Minimal bid for advertisement per 1 second.
        address defaultERC721;   // The default contract address for advertisement.
        uint256 defaultTokenId;  // The default advertisement that's shown if no bids available.
        string metadataURI;      // The off-chain AdvertisementSurfaceInfo metadata.
        bytes32 metadataHash;    // The hash of off-chain AdvertisementSurfaceInfo metadata.
    }

    // @description It gets AdvertisementSurfaceInfo by the token id.
    // @param _tokenId The id of the token for which the info is returned.
    function getAdvertisementSurfaceInfo(uint256 _tokenId) external view returns(AdvertisementSurfaceInfo memory);

    // @description The function that tokenize the advertisement surface. Once activated
    // advertisement time slots can be auctioned to clients.
    // @param _AdsInfo The advertisement surface description that consists of on-chain data
    // necessary for auctioning process and off-chain metadata useful for clients e.g. location,
    // size, resolution.
    function registerAdvertisementSurface(AdvertisementSurfaceInfo memory _AdsInfo) external;

}