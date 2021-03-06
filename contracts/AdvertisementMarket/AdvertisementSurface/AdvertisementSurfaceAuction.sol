// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./IAdvertisementSurfaceAuction.sol";
import "./AdvertisementSurfacePayments.sol";
import "./IAdvertisementSurface.sol";

/// @author Marcin Gorzynski
/// @title The Advertisement Surface Auction functionality
/// @notice The contract used to auctioning advertisement on advertisement surfaces
contract AdvertisementSurfaceAuction is IAdvertisementSurfaceAuction {

    using SafeMath for uint256;

    /// @dev The advertisement surface ERC721 contract
    IAdvertisementSurface private advertisementSurface;

    /// @notice The event emitted when new highest bid is added
    event LogActive(uint256 indexed tokenId, address indexed bidder, uint256 indexed bidId);
    /// @notice The event emitted when bid is outbid by another bid
    event LogOutbid(uint256 indexed tokenId, address indexed bidder, uint256 indexed bidId);
    /// @notice The event emitted when bid is finished, advertisement has been executed and ERC721 has been paid
    event LogFinished(uint256 indexed tokenId, address indexed receiver, uint256 indexed bidId);

    /// @dev The array of all bids ever made
    Bid[] private bids;

    /// @dev The count of all bids made
    uint256 private bidsCount;

    /// @dev The mapping between advertisement surface token id and bool that indicates if there are any bid for that token
    mapping(uint256 => bool) private surTokenIdHasBids;
    /// @dev The mapping between advertisement surface token id and array of the bids made for that surface
    mapping(uint256 => uint256[]) private surTokenIdToBidIds;
    /// @dev The mapping between advertisement surface token id and array of active the bids made for that surface
    mapping(uint256 => uint256[]) private surTokenIdToActiveBidIds;
    /// @dev The mapping between bidders address and array of the bids made from that address
    mapping(address => uint256[]) private addressToBidIds;

    /// @notice The modifier validating bid structure
    /// @param _bid The bid to be validated
    modifier validateBid(Bid memory _bid) {
        require(_surfaceExists(_bid.surTokenId), "advertisement surface do not exist");
        require(_bid.bidder == msg.sender, "bidder must be the same as transaction sender");
        require(_bid.advERC721 != address(0), "the advERC721 can not be 0 address");
        require(_bid.advTokenId != 0, "the advTokenId need to be grater than 0");
        require(_bid.bid >= _paymentInfo(_bid.surTokenId).minBid, "bid must be greater or equal to minBid");
        require(_bid.startTime > block.timestamp, "the startTime needs to be in the future");
        require(_bid.duration > 0, "the duration needs to be grater than 0");
        require(_bid.state == BidState.Active, "the bid must be active");
        _;
    }

    /// @notice The modifier checking if payment can be done from msg.sender
    /// @param _tokenId The advertisement surface token id
    /// @param _amount The amount of erc20 token to be transferred
    modifier checkPayment(uint256 _tokenId, uint256 _amount) {
        IERC20 erc20 = IERC20(advertisementSurface.getPaymentInfo(_tokenId).erc20);
        require(erc20.allowance(msg.sender, address(this)) >= _amount, "allowance missing for token transfer");
        require(erc20.balanceOf(msg.sender) >= _amount, "not enough token balance");
        _;
    }

    /// @notice The modifier checking is bidder is executing transaction
    /// @param _bidId The bid id for which check is being done
    modifier isBidder(uint256 _bidId) {
        require(msg.sender == bids[_bidId].bidder, "you must be a bidder");
        _;
    }

    /// @notice The modifier checking if advertisement surface owner is executing transaction
    /// @param _bidId The bid id for which check is being done
    modifier isSurfaceOwner(uint256 _bidId) {
        require(msg.sender == advertisementSurface.ownerOf(bids[_bidId].surTokenId), "you must be surface owner");
        _;
    }

    /// @notice The modifier checking if bid has been outbid
    /// @param _bidId The bid id for which check is being done
    modifier isOutBid(uint256 _bidId) {
        require(bids[_bidId].state == BidState.Outbid, "the state needs to be outbid");
        _;
    }

    /// @notice The modifier checking if bid has been finished and executed
    /// @param _bidId The bid id for which check is being done
    modifier isFinished(uint256 _bidId) {
        require(
            bids[_bidId].state == BidState.Active && bids[_bidId].startTime + bids[_bidId].duration < block.timestamp,
            "the auction must be finished and delivered"
        );
        _;
    }

    /// @notice The constructor of advertisement surface auction contract
    /// @param _advertisementSurface The advertisement surface ERC721 contract address
    constructor(address _advertisementSurface) {
        advertisementSurface = IAdvertisementSurface(_advertisementSurface);
    }

    /// @notice Gets the number of bids in the contract
    /// @return Number of bids
    function getBidCount() external override view returns (uint256) {
        return bidsCount;
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
        if (surTokenIdHasBids[_tokenId] == false) {
            return 0;
        }
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
        if (surTokenIdHasBids[_tokenId] == false) {
            return 0;
        }
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
        _processBid(_bid);

        bids.push(_bid);
        bidsCount = bidsCount + 1;

        uint256 index = bidsCount - 1;
        surTokenIdToBidIds[_bid.surTokenId].push(index);
        surTokenIdToActiveBidIds[_bid.surTokenId].push(index);
        addressToBidIds[msg.sender].push(index);

        surTokenIdHasBids[_bid.surTokenId] = true;

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
        IERC20 erc20Contract = IERC20(paymentInfo.erc20);

        uint256 preBalance = erc20Contract.balanceOf(address(this));
        erc20Contract.transfer(msg.sender, bid.bid * bid.duration);

        assert(preBalance - erc20Contract.balanceOf(address(this)) == bid.bid * bid.duration);

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
        IERC20 erc20Contract = IERC20(paymentInfo.erc20);

        uint256 preBalance = erc20Contract.balanceOf(address(this));
        erc20Contract.transfer(msg.sender, bid.bid * bid.duration);

        assert(preBalance - erc20Contract.balanceOf(address(this)) == bid.bid * bid.duration);

        emit LogFinished(bid.surTokenId, msg.sender, _bidId);
    }

    /// @notice Calculates how much the bid is worth. It's required to decide which bid outbids the other bid.
    /// @param _bid The bid structure
    /// @return The number of tokens that can be collected or refunded from the bid
    function getBidWorth(Bid memory _bid) external override pure returns (uint256) {
        return _getBidWorth(_bid);
    }

    function _getBidWorth(Bid memory _bid) internal pure returns (uint256) {
        return _bid.duration * _bid.bid;
    }

    /// @notice Process new bid checking if it's highest bid and altering states of all bids
    /// @param _bid The new bid
    function _processBid(Bid memory _bid) internal {
        uint256[] storage activeBids = surTokenIdToActiveBidIds[_bid.surTokenId];

        uint256 i = 0;
        uint256 overlapBidsWorth;
        for (i = 0; i < activeBids.length; i++) {
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
        if (!isBetter) {
            revert("the bid needs to be better than current bids");
        }
        _bid.state = BidState.Active;

        i = 0;
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

    /// @notice Removed the bid from the array
    /// @param _array The array from which bid should be removed
    /// @param _index The index of the bid
    function _removeBidFromActive(uint256[] storage _array, uint256 _index) internal {
        require(_index < _array.length, "index out of bounds");
        _array[_index] = _array[_array.length - 1];
        _array.pop();
    }

    /// @notice Checks if advertisement surface exists
    /// @param _tokenId The token id existence to be checked
    function _surfaceExists(uint256 _tokenId) internal view returns (bool) {
        return advertisementSurface.advertisementSurfaceExists(_tokenId);
    }

    /// @notice Gets payment info for given advertisement surface token
    /// @param _tokenId The token id of the advertisement surface
    function _paymentInfo(uint256 _tokenId) internal view returns (IAdvertisementSurface.PaymentInfo memory) {
        return advertisementSurface.getPaymentInfo(_tokenId);
    }

}