// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// @author Marcin Gorzynski
// @title The Advertisement Surface Auction mechanism.
contract AdvertisementSurfaceAuction {

    using SafeMath for uint256;

    struct Bid {
        address erc721;    // The contract address for advertisement ERC721 token.
        uint256 tokenId;   // The advertisement to be shown.
        uint256 bid;       // The bid for unit of time(second). The total is bid * duration.
        uint64 startTime;  // The start of the advertisement.
        uint64 duration;   // The duration of the advertisement.
    }

}