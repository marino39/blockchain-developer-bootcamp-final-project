// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./IAdvertisementSurfaceAuction.sol";
import "./AdvertisementSurfacePayments.sol";
import "./IAdvertisementSurface.sol";

// @author Marcin Gorzynski
// @title The Advertisement Surface Auction functionality
// @notice The contract used to auctioning advertisement on advertisement surfaces
contract AdvertisementSurfaceAuction is IAdvertisementSurfaceAuction {

    using SafeMath for uint256;

    IAdvertisementSurface advertisementSurface;

    event LogActive(uint256 indexed tokenId, address indexed bidder, uint256 indexed bidId);
    event LogOutbid(uint256 indexed tokenId, address indexed bidder, uint256 indexed bidId);
    event LogFinished(uint256 indexed tokenId, address indexed receiver, uint256 indexed bidId);

    Bid[] private bids;

    mapping (uint256 => uint256[]) private surTokenIdToBidIds;
    mapping (uint256 => uint256[]) private surTokenIdToActiveBidIds;
    mapping (address => uint256[]) private addressToBidIds;

    modifier validateBid(Bid memory _bid) {
        require(_surfaceExists(_bid.surTokenId), "advertisement surface do not exist");
        require(_bid.bidder == msg.sender, "bidder must be the same as transaction sender");
        require(_bid.advERC721 != address(0), "the advERC721 can not be 0 address");
        require(_bid.advTokenId != 0, "the advTokenId need to be grater than 0");
        require(_bid.bid >= _paymentInfo(_bid.surTokenId).minBid, "bid must be greater or equal to minBid");
        // todo: use oracle here for time
        require(_bid.startTime > block.timestamp, "the startTime needs to be in the future");
        require(_bid.duration > 0, "the duration needs to be grater than 0");
        require(_bid.state == BidState.Active, "the bid must be active");
        _;
    }

    modifier checkPayment(uint256 _tokenId, uint256 _amount) {
        IERC20 erc20 = IERC20(advertisementSurface.getPaymentInfo(_tokenId).erc20);
        require(erc20.allowance(msg.sender, address(this)) >= _amount, "allowance missing for token transfer");
        require(erc20.balanceOf(msg.sender) >= _amount, "not enough token balance");
        _;
    }

    modifier isBidder(uint256 _bidId) {
        require(msg.sender == bids[_bidId].bidder, "you must be a bidder");
        _;
    }

    modifier isSurfaceOwner(uint256 _bidId) {
        require(msg.sender == advertisementSurface.ownerOf(bids[_bidId].surTokenId), "you must be surface owner");
        _;
    }

    modifier isOutBid(uint256 _bidId) {
        require(bids[_bidId].state == BidState.Outbid, "the state needs to be outbid");
        _;
    }

    modifier isFinished(uint256 _bidId) {
        // todo: use oracle here for time
        require(
            bids[_bidId].state == BidState.Active && bids[_bidId].startTime + bids[_bidId].duration < block.timestamp,
                "the auction must be finished and delivered"
        );
        _;
    }

    constructor(address _advertisementSurface) {
        advertisementSurface = IAdvertisementSurface(_advertisementSurface);
    }

    /// @notice Gets the number of bids in the contract
    /// @return Number of bids
    function getBidCount() external override view returns(uint256) {
        return bids.length;
    }

    /// @notice Gets bid structure for given bid id
    /// @param _bidId The id of the bid
    /// @return The bid structure
    function getBid(uint256 _bidId) external override view returns(Bid memory) {
        return bids[_bidId];
    }

    /// @notice Gets the number of the bids made by msg sender
    /// @return The number of bids made by msg sender
    function getMyBidsCount() external override view returns(uint256) {
        return addressToBidIds[msg.sender].length;
    }

    /// @notice Gets bid id and bid structure for given index od msg sender bids
    /// @param _index The index in the array
    /// @return The bid id and bid structure
    function getMyBid(uint256 _index) external override view returns(uint256, Bid memory) {
        uint256 bidId = addressToBidIds[msg.sender][_index];
        return (bidId, bids[bidId]);
    }

    /// @notice Gets the number of bids for given advertisement surface
    /// @param _tokenId The advertisement surface id
    /// @return The number of bids for advertisement surface
    function getSurfaceBidCount(uint256 _tokenId) external override view returns(uint256) {
        return surTokenIdToBidIds[_tokenId].length;
    }

    /// @notice Gets bid id and bid structure for advertisement surface id and index
    /// @param _tokenId The advertisement surface id
    /// @param _index The index of the bid
    /// @return The bid id and bid structure
    function getSurfaceBid(uint256 _tokenId, uint256 _index) external override view returns(uint256, Bid memory) {
        uint256 bidId = surTokenIdToBidIds[_tokenId][_index];
        return (bidId, bids[bidId]);
    }

    /// @notice Get active bid count. The active bid is winning bid.
    /// @param _tokenId The advertisement surface id
    /// @return The number of active bids
    function getActiveBidCount(uint256 _tokenId) external override view returns(uint256) {
        return surTokenIdToActiveBidIds[_tokenId].length;
    }

    /// @notice Gets active bid id and bid structure for advertisement surface id and index
    /// @param _tokenId The advertisement surface id
    /// @param _index The index of the bid
    /// @return The bid id and bid structure
    function getActiveBid(uint256 _tokenId, uint256 _index) external override view returns(uint256, Bid memory) {
        uint256 bidId = surTokenIdToActiveBidIds[_tokenId][_index];
        return (bidId, bids[bidId]);
    }

    /// @notice Creates new bid for advertisement surface
    /// @param _bid The bid structure defining the bid
    function newBid(Bid memory _bid) external override validateBid(_bid) checkPayment(_bid.surTokenId, _bid.bid * _bid.duration) {
        require(_isBetterBid(_bid), "the bid needs to be better than current bids");
        _bid.state = BidState.Active;

        bids.push(_bid);
        uint256 index = bids.length - 1;
        surTokenIdToBidIds[_bid.surTokenId].push(index);
        surTokenIdToActiveBidIds[_bid.surTokenId].push(index);
        addressToBidIds[msg.sender].push(index);

        IAdvertisementSurface.PaymentInfo memory paymentInfo = _paymentInfo(_bid.surTokenId);
        IERC20(paymentInfo.erc20).transferFrom(msg.sender, address(this), _bid.bid * _bid.duration);

        emit LogActive(_bid.surTokenId, _bid.bidder, index);
    }

    /// @notice Refunds bid in case this bid has been outbid by someone else
    /// @param _bidId The bid id to refund payment
    function refundBid(uint256 _bidId) isBidder(_bidId) isOutBid(_bidId) external override {
        Bid storage bid = bids[_bidId];
        bid.state = BidState.Finished;

        IAdvertisementSurface.PaymentInfo memory paymentInfo = _paymentInfo(bid.surTokenId);
        IERC20(paymentInfo.erc20).transfer(msg.sender, bid.bid * bid.duration);

        emit LogFinished(bid.surTokenId, msg.sender, _bidId);
    }

    /// @notice Collects payment from bid in when advertisement has been already shown
    /// @param _bidId The bid id to collect payment
    function collectBid(uint256 _bidId) isSurfaceOwner(_bidId) isFinished(_bidId) external override {
        Bid storage bid = bids[_bidId];
        if (bid.state == BidState.Active) {
            uint256[] storage activeBids = surTokenIdToActiveBidIds[bid.surTokenId];
            for (uint256 i = 0; i < activeBids.length; i++) {
                if (activeBids[i] == _bidId) {
                    _removeBidFromActive(activeBids, i);
                    break;
                }
            }
        }
        bid.state = BidState.Finished;

        IAdvertisementSurface.PaymentInfo memory paymentInfo = _paymentInfo(bid.surTokenId);
        IERC20(paymentInfo.erc20).transfer(msg.sender, bid.bid * bid.duration);

        emit LogFinished(bid.surTokenId, msg.sender, _bidId);
    }

    /// @notice Calculates how much the bid is worth. It's required to decide which bid outbids the other bid.
    /// @param _bid The bid structure
    /// @return The number of tokens that can be collected or refunded from the bid
    function getBidWorth(Bid memory _bid) external override pure returns(uint256) {
        return _getBidWorth(_bid);
    }

    function _getBidWorth(Bid memory _bid) internal pure returns(uint256) {
        return _bid.duration * _bid.bid;
    }

    function _isBetterBid(Bid memory _bid) internal returns(bool) {
        uint256[] storage activeBids = surTokenIdToActiveBidIds[_bid.surTokenId];

        uint256 overlapBidsWorth;
        for (uint256 i = 0; i < activeBids.length; i++) {
            uint256 _bid2Id = activeBids[i];
            Bid memory _bid2 = bids[_bid2Id];
            if (_bid.startTime <= _bid2.startTime && _bid.startTime + _bid.duration > _bid2.startTime) {
                overlapBidsWorth += _getBidWorth(_bid2);
                continue;
            }
            if (_bid.startTime >= _bid2.startTime && _bid.startTime < _bid2.startTime + _bid2.duration) {
                overlapBidsWorth += _getBidWorth(_bid2);
                continue;
            }
        }

        bool isBetter = _getBidWorth(_bid) > overlapBidsWorth;
        if (isBetter) {
            uint256 i = 0;
            while (i < activeBids.length) {
                uint256 _bid2Id = activeBids[i];
                Bid storage _bid2 = bids[_bid2Id];
                if (_bid.startTime <= _bid2.startTime && _bid.startTime + _bid.duration > _bid2.startTime) {
                    _bid2.state = BidState.Outbid;
                    _removeBidFromActive(activeBids, i);

                    emit LogOutbid(_bid2.surTokenId, _bid2.bidder, _bid2Id);

                    continue;
                }
                if (_bid.startTime >= _bid2.startTime && _bid.startTime < _bid2.startTime + _bid2.duration) {
                    _bid2.state = BidState.Outbid;
                    _removeBidFromActive(activeBids, i);

                    emit LogOutbid(_bid2.surTokenId, _bid2.bidder, _bid2Id);

                    continue;
                }
                i++;
            }
        }

        return isBetter;
    }

    function _removeBidFromActive(uint256[] storage _array, uint256 _index) internal {
        require(_index < _array.length, "index out of bounds");
        _array[_index] = _array[_array.length-1];
        _array.pop();
    }

    function _surfaceExists(uint256 _tokenId) internal view returns(bool) {
        return advertisementSurface.advertisementSurfaceExists(_tokenId);
    }

    function _paymentInfo(uint256 _tokenId) internal view returns(IAdvertisementSurface.PaymentInfo memory) {
        return advertisementSurface.getPaymentInfo(_tokenId);
    }

}