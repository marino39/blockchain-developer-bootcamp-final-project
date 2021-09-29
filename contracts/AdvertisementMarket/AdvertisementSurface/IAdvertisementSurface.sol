// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

// @author Marcin Gorzynski
// @title The Advertisement Surface NFT interface
// @description The contract used to tokenize advertisement infrastructure and bid on it's usage.
interface IAdvertisementSurface is IERC721Metadata, IERC721Enumerable {

    // @description The structure used to define how owner of the surface is paid.
    struct PaymentInfo {
        address erc20;    // The address of ERC20 token contract used for payments.
        uint256 minBid;   // Minimal bid for advertisement per 1 second.
    }

    struct Bid {
        address erc721;    // The contract address for advertisement ERC721 token.
        uint256 tokenId;   // The advertisement to be shown.
        uint256 bid;       // The bid for unit of time(second). The total is bid * duration.
        uint64 startTime;  // The start of the advertisement.
        uint64 duration;   // The duration of the advertisement.
    }

    // @description The function that tokenize the advertisement surface. Once activated
    // advertisement time slots can be auctioned to clients.
    // @param _AdsInfo The advertisement surface description that consists of on-chain data
    // necessary for auctioning process and off-chain metadata useful for clients e.g. location,
    // size, resolution.
    function registerAdvertisementSurface(string memory _tokenURI, PaymentInfo memory _paymentInfo) external;

    // @description It gets PaymentInfo by the token id.
    // @param _tokenId The id of the token for which the info is returned.
    function getPaymentInfo(uint256 _tokenId) external view returns(PaymentInfo memory);

    // @description It sets PaymentInfo by the token id.
    // @param _tokenId The id of the token for which the info is set.
    // @param _paymentInfo The paymentInfo to update.
    function setPaymentInfo(uint256 _tokenId, PaymentInfo memory _paymentInfo) external;

}