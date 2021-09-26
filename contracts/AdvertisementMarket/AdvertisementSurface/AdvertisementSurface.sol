// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

import "./IAdvertisementSurface.sol";


// @author Marcin Gorzynski
// @title The Advertisement Surface NFT
contract AdvertisementSurface is IAdvertisementSurface, ERC721Enumerable {

    using SafeMath for uint256;

    mapping (uint256 => AdvertisementSurfaceInfo) private tokenIdToAdvertisementSurfaceInfo;

    constructor() ERC721("Advertisement Surface", "ADS") {}

    function getAdvertisementSurfaceInfo(uint256 _tokenId) override public view returns(AdvertisementSurfaceInfo memory) {
        return tokenIdToAdvertisementSurfaceInfo[_tokenId];
    }

    function registerAdvertisementSurface(AdvertisementSurfaceInfo memory _AdsInfo) override external {
        _mint(_AdsInfo);
    }

    function _mint(AdvertisementSurfaceInfo memory _AdsInfo) private {
        _safeMint(msg.sender, totalSupply() + 1);
        tokenIdToAdvertisementSurfaceInfo[totalSupply()] = _AdsInfo;
    }

}