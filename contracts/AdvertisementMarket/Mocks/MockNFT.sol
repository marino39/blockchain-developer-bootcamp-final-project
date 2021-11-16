// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MockNFT is ERC721URIStorage, ERC721Enumerable {

    using SafeMath for uint256;

    constructor() ERC721("Advertisement NFT", "ADV") {}

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
        return ERC721Enumerable.supportsInterface(interfaceId);
    }

    function _baseURI() internal view override returns (string memory) {
        return "ipfs://";
    }

    function mint(address _account, string memory _tokenURI) external {
        uint256 tokenId = totalSupply().add(1);
        _safeMint(_account, tokenId);
        _setTokenURI(tokenId, _tokenURI);
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return ERC721URIStorage.tokenURI(tokenId);
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