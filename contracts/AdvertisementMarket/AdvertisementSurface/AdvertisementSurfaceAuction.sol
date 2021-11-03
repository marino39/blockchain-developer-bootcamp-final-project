// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./IAdvertisementSurfaceAuction.sol";
import "./AdvertisementSurfacePayments.sol";
import "./IAdvertisementSurface.sol";

// @author Marcin Gorzynski
// @title The Advertisement Surface Auction functionality
contract AdvertisementSurfaceAuction is IAdvertisementSurfaceAuction {

    using SafeMath for uint256;

    IAdvertisementSurface advertisementSurface;

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

    function getBidCount() public view returns(uint256) {
        return bids.length;
    }

    function getBid(uint256 _bidId) public view returns(Bid memory) {
        return bids[_bidId];
    }

    function getMyBidsCount() public view returns(uint256) {
        return addressToBidIds[msg.sender].length;
    }

    function getMyBid(uint256 _index) public view returns(uint256, Bid memory) {
        uint256 bidId = addressToBidIds[msg.sender][_index];
        return (bidId, bids[bidId]);
    }

    function getSurfaceBidCount(uint256 _tokenId) public view returns(uint256) {
        return surTokenIdToBidIds[_tokenId].length;
    }

    function getSurfaceBid(uint256 _tokenId, uint256 _index) public view returns(uint256, Bid memory) {
        uint256 bidId = surTokenIdToBidIds[_tokenId][_index];
        return (bidId, bids[bidId]);
    }

    function getActiveBidCount(uint256 _tokenId) public view returns(uint256) {
        return surTokenIdToActiveBidIds[_tokenId].length;
    }

    function getActiveBid(uint256 _tokenId, uint256 _index) public view returns(uint256, Bid memory) {
        uint256 bidId = surTokenIdToActiveBidIds[_tokenId][_index];
        return (bidId, bids[bidId]);
    }

    function newBid(Bid memory _bid) public validateBid(_bid) checkPayment(_bid.surTokenId, _bid.bid * _bid.duration) {
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

    function refundBid(uint256 _bidId) isBidder(_bidId) isOutBid(_bidId) public {
        Bid storage bid = bids[_bidId];
        bid.state = BidState.Finished;

        IAdvertisementSurface.PaymentInfo memory paymentInfo = _paymentInfo(bid.surTokenId);
        IERC20(paymentInfo.erc20).transfer(msg.sender, bid.bid * bid.duration);

        emit LogFinished(bid.surTokenId, msg.sender, _bidId);
    }

    function collectBid(uint256 _bidId) isSurfaceOwner(_bidId) isFinished(_bidId) public {
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