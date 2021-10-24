// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

import "./IAdvertisementSurfacePayments.sol";

// @author Marcin Gorzynski
// @title The Advertisement Surface NFT interface
// @description The contract used to tokenize advertisement infrastructure and bid on it's usage.
interface IAdvertisementSurface is IAdvertisementSurfacePayments, IERC721Metadata, IERC721Enumerable {

    // @description The function that tokenize the advertisement surface. Once activated
    // advertisement time slots can be auctioned to clients.
    // @param _AdsInfo The advertisement surface description that consists of on-chain data
    // necessary for auctioning process and off-chain metadata useful for clients e.g. location,
    // size, resolution.
    function registerAdvertisementSurface(string memory _tokenURI, PaymentInfo memory _paymentInfo) external;

}