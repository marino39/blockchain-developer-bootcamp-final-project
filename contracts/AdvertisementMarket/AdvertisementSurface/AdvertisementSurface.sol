// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "./IAdvertisementSurface.sol";
import "./AdvertisementSurfaceAuction.sol";

// @author Marcin Gorzynski
// @title The Advertisement Surface NFT
contract AdvertisementSurface is AdvertisementSurfaceAuction, IAdvertisementSurface, ERC721URIStorage, ERC721Enumerable {

    using SafeMath for uint256;

    mapping (uint256 => PaymentInfo) private tokenIdToPaymentInfo;
    mapping (uint256 => int64) private tokenIdToLastTimePaid;

    constructor() ERC721("Advertisement Surface", "ADS") {}

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, IERC165, ERC721Enumerable) returns (bool) {
        return ERC721Enumerable.supportsInterface(interfaceId);
    }

    function registerAdvertisementSurface(string memory _tokenURI, PaymentInfo memory _paymentInfo) override external {
        require(_paymentInfo.erc20 != address(0));
        require(_paymentInfo.minBid != 0);

        uint256 tokenId = _mint();
        _setTokenURI(tokenId, _tokenURI);
        tokenIdToPaymentInfo[tokenId] = _paymentInfo;
    }

    function getPaymentInfo(uint256 _tokenId) override public view returns(PaymentInfo memory) {
        require(_exists(_tokenId));
        return tokenIdToPaymentInfo[_tokenId];
    }

    function setPaymentInfo(uint256 _tokenId, PaymentInfo memory _paymentInfo) external override {
        require(_exists(_tokenId));
        require(msg.sender == ownerOf(_tokenId));
        tokenIdToPaymentInfo[_tokenId] = _paymentInfo;
    }

    function _mint() private returns(uint256) {
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

    function _surfaceExists(uint256 tokenId) internal view override returns(bool) {
        return _exists(tokenId);
    }
}