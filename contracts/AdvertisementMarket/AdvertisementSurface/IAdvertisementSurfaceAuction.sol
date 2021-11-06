// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// @author Marcin Gorzynski
// @title The Advertisement Surface Auction interface
// @description The interface used to bid on advertisement surfaces and collect payments and refunds.
interface IAdvertisementSurfaceAuction {

    enum BidState {Outbid, Active, Finished}

    struct Bid {
        address bidder;       // The address making a bid.
        uint256 surTokenId;   // The surface token id;
        address advERC721;    // The contract address for advertisement ERC721 token.
        uint256 advTokenId;   // The advertisement to be shown.
        uint256 bid;          // The bid for unit of time(second). The total is bid * duration.
        uint64 startTime;     // The start of the advertisement.
        uint64 duration;      // The duration of the advertisement.
        BidState state;       // The bid state.
    }

    /// @notice Gets the number of bids in the contract
    /// @return Number of bids
    function getBidCount() external view returns(uint256);

    /// @notice Gets bid structure for given bid id
    /// @param _bidId The id of the bid
    /// @return The bid structure
    function getBid(uint256 _bidId) external view returns(Bid memory);

    /// @notice Gets the number of the bids made by msg sender
    /// @return The number of bids made by msg sender
    function getMyBidsCount() external view returns(uint256);

    /// @notice Gets bid id and bid structure for given index od msg sender bids
    /// @param _index The index in the array
    /// @return The bid id and bid structure
    function getMyBid(uint256 _index) external view returns(uint256, Bid memory);

    /// @notice Gets the number of bids for given advertisement surface
    /// @param _tokenId The advertisement surface id
    /// @return The number of bids for advertisement surface
    function getSurfaceBidCount(uint256 _tokenId) external view returns(uint256);

    /// @notice Gets bid id and bid structure for advertisement surface id and index
    /// @param _tokenId The advertisement surface id
    /// @param _index The index of the bid
    /// @return The bid id and bid structure
    function getSurfaceBid(uint256 _tokenId, uint256 _index) external view returns(uint256, Bid memory);

    /// @notice Get active bid count. The active bid is winning bid.
    /// @param _tokenId The advertisement surface id
    /// @return The number of active bids
    function getActiveBidCount(uint256 _tokenId) external view returns(uint256);

    /// @notice Gets active bid id and bid structure for advertisement surface id and index
    /// @param _tokenId The advertisement surface id
    /// @param _index The index of the bid
    /// @return The bid id and bid structure
    function getActiveBid(uint256 _tokenId, uint256 _index) external view returns(uint256, Bid memory);

    /// @notice Creates new bid for advertisement surface
    /// @param _bid The bid structure defining the bid
    function newBid(Bid memory _bid) external;

    /// @notice Refunds bid in case this bid has been outbid by someone else
    /// @param _bidId The bid id to refund payment
    function refundBid(uint256 _bidId) external;

    /// @notice Collects payment from bid in when advertisement has been already shown
    /// @param _bidId The bid id to collect payment
    function collectBid(uint256 _bidId) external;

    /// @notice Calculates how much the bid is worth. It's required to decide which bid outbids the other bid.
    /// @param _bid The bid structure
    /// @return The number of tokens that can be collected or refunded from the bid
    function getBidWorth(Bid memory _bid) external pure returns(uint256);

}