// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "./IAdvertisementSurface.sol";
import "./AdvertisementSurfacePayments.sol";

/// @author Marcin Gorzynski
/// @title The Advertisement Surface NFT
/// @notice The ERC721 tokenized advertisement surface
contract AdvertisementSurface is IAdvertisementSurface, AdvertisementSurfacePayments, ERC721URIStorage, ERC721Enumerable {

    using SafeMath for uint256;

    /// @notice The contract constructor
    constructor() ERC721("Advertisement Surface", "ADS") {}

    ///
    /// @dev See {IERC165-supportsInterface}.
    ///
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, IERC165, ERC721Enumerable) returns (bool) {
        return ERC721Enumerable.supportsInterface(interfaceId) ||
        interfaceId == type(IAdvertisementSurface).interfaceId ||
        interfaceId == type(IAdvertisementSurfacePayments).interfaceId;
    }

    /// @notice The function that tokenize the advertisement surface. Once activated
    /// advertisement time slots can be auctioned to clients.
    /// @param _tokenURI The advertisement surface token id
    /// @param _paymentInfo The advertisement surface payment structure
    function registerAdvertisementSurface(string memory _tokenURI, PaymentInfo memory _paymentInfo) external override {
        require(_paymentInfo.erc20 != address(0));
        require(_paymentInfo.minBid != 0);

        uint256 tokenId = _mint();
        _setTokenURI(tokenId, _tokenURI);
        _setPaymentInfo(tokenId, _paymentInfo);
    }

    /// @notice The function that checks is given tokenId exists
    /// @param _tokenId The id of the advertisement surface
    /// @return If token id exists
    function advertisementSurfaceExists(uint256 _tokenId) external view override returns (bool) {
        return _exists(_tokenId);
    }

    /// @notice It gets PaymentInfo by the token id
    /// @param _tokenId The id of the token for which the info is returned
    /// @return The payment info structure
    function getPaymentInfo(uint256 _tokenId) public view override returns (PaymentInfo memory) {
        require(_exists(_tokenId));
        return _getPaymentInfo(_tokenId);
    }

    /// @notice It sets PaymentInfo by the token id
    /// @param _tokenId The id of the token for which the info is set
    /// @param _paymentInfo The paymentInfo to update
    function setPaymentInfo(uint256 _tokenId, PaymentInfo memory _paymentInfo) external override {
        require(_exists(_tokenId));
        require(msg.sender == ownerOf(_tokenId));
        _setPaymentInfo(_tokenId, _paymentInfo);
    }

    function _mint() private returns (uint256) {
        uint256 tokenId = totalSupply().add(1);
        _safeMint(msg.sender, tokenId);
        return tokenId;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override(ERC721, IERC721Metadata, ERC721URIStorage) returns (string memory) {
        return ERC721URIStorage.tokenURI(tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return "ipfs://";
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable) {
        ERC721Enumerable._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721URIStorage) {
        ERC721URIStorage._burn(tokenId);
    }

}