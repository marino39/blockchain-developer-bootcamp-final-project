// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

abstract contract AdvertisementSurfaceAuction {

    using SafeMath for uint256;

    enum BidState {Outbid, Active, Finished, FinishedPaid}

    struct Bid {
        address bidder;       // The address making a bid.
        uint256 surTokenId;   // The surface token id;
        address advERC721;    // The contract address for advertisement ERC721 token.
        uint256 advTokenId;   // The advertisement to be shown.
        uint256 bid;          // The bid for unit of time(second). The total is bid * duration.
        uint64 startTime;     // The start of the advertisement.
        uint64 duration;      // The duration of the advertisement.
        BidState state;          // The bid state.
    }

    uint256 bidCount;
    Bid[] private bids;

    mapping (uint256 => uint256[]) private surTokenIdToBidIds;
    mapping (uint256 => uint256[]) private surTokenIdToActiveBidIds;
    mapping (address => uint256[]) private addressToBidIds;

    modifier validateBid(Bid memory _bid) {
        // todo: validation in here
        require(_surfaceExists(_bid.surTokenId), "advertisement surface do not exist");
        _;
    }

    function getBidCount() public view returns(uint256) {
        return bids.length;
    }

    function getBid(uint256 _bidId) public view returns(Bid memory) {
        return bids[_bidId];
    }

    function getMyBidsCount() public view returns(uint256) {
        return addressToBidIds[msg.sender].length;
    }

    function getMyBid(uint256 index) public view returns(Bid memory) {
        return bids[addressToBidIds[msg.sender][index]];
    }

    function getSurfaceBidCount(uint256 tokenId) public view returns(uint256) {
        return surTokenIdToBidIds[tokenId].length;
    }

    function getSurfaceBid(uint256 tokenId, uint256 index) public view returns(Bid memory) {
        return bids[surTokenIdToBidIds[tokenId][index]];
    }

    function getActiveBidCount(uint256 tokenId)  public view returns(uint256) {
        return surTokenIdToActiveBidIds[tokenId].length;
    }

    function newBid(Bid memory _bid) public validateBid(_bid) {
        require(_isBetterBid(_bid));
        _bid.state = BidState.Active;

        bids.push(_bid);
        uint256 index = bids.length - 1;
        surTokenIdToBidIds[_bid.surTokenId].push(index);
        surTokenIdToActiveBidIds[_bid.surTokenId].push(index);
        addressToBidIds[msg.sender].push(index);
    }

    function getBidWorth(Bid memory _bid) public pure returns(uint256) {
        return _bid.duration * _bid.bid;
    }

    function _isBetterBid(Bid memory _bid) internal returns(bool) {
        uint256[] storage activeBids = surTokenIdToActiveBidIds[_bid.surTokenId];

        uint256 overlapBidsWorth;
        for (uint256 i = 0; i < activeBids.length; i++) {
            uint256 _bid2Id = activeBids[i];
            Bid memory _bid2 = bids[_bid2Id];
            if (_bid.startTime <= _bid2.startTime && _bid.startTime + _bid.duration > _bid2.startTime) {
                overlapBidsWorth += getBidWorth(_bid2);
                continue;
            }
            if (_bid.startTime >= _bid2.startTime && _bid.startTime < _bid2.startTime + _bid2.duration) {
                overlapBidsWorth += getBidWorth(_bid2);
                continue;
            }
        }

        bool isBetter = getBidWorth(_bid) > overlapBidsWorth;
        if (isBetter) {
            uint256 i = 0;
            while (i < activeBids.length) {
                uint256 _bid2Id = activeBids[i];
                Bid storage _bid2 = bids[_bid2Id];
                if (_bid.startTime <= _bid2.startTime && _bid.startTime + _bid.duration > _bid2.startTime) {
                    _bid2.state = BidState.Outbid;
                    _removeBidFromActive(activeBids, i);
                    continue;
                }
                if (_bid.startTime >= _bid2.startTime && _bid.startTime < _bid2.startTime + _bid2.duration) {
                    _bid2.state = BidState.Outbid;
                    _removeBidFromActive(activeBids, i);
                    continue;
                }
                i++;
            }
        }

        return isBetter;
    }

    function _removeBidFromActive(uint256[] storage array, uint256 index) internal {
        require(index < array.length);
        array[index] = array[array.length-1];
        array.pop();
    }

    function _surfaceExists(uint256 tokenId) internal view virtual returns(bool) { return false; }

    function _executePayment(Bid storage bid) internal virtual {}

}