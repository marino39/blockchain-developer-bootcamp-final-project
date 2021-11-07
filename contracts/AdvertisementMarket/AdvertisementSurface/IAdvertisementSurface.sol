// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

import "./IAdvertisementSurfacePayments.sol";

/// @author Marcin Gorzynski
/// @title The Advertisement Surface NFT interface
/// @notice The contract used to tokenize advertisement infrastructure and bid on it's usage.
interface IAdvertisementSurface is IAdvertisementSurfacePayments, IERC721Metadata, IERC721Enumerable {

    /// @notice The function that tokenize the advertisement surface. Once activated
    /// advertisement time slots can be auctioned to clients.
    /// @param _tokenURI The advertisement surface token id
    /// @param _paymentInfo The advertisement surface payment structure
    function registerAdvertisementSurface(string memory _tokenURI, PaymentInfo memory _paymentInfo) external;

    /// @notice The function that checks is given tokenId exists
    /// @param _tokenId The id of the advertisement surface
    /// @return If token id exists
    function advertisementSurfaceExists(uint256 _tokenId) external view returns (bool);

}