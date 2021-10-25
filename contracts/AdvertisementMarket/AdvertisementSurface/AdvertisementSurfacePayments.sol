// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IAdvertisementSurfacePayments.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// @author Marcin Gorzynski
// @title The Advertisement Surface Payments functionality
abstract contract AdvertisementSurfacePayments is IAdvertisementSurfacePayments {

    using SafeMath for uint256;

    mapping (uint256 => PaymentInfo) private tokenIdToPaymentInfo;

    function _getPaymentInfo(uint256 _tokenId) internal view returns(PaymentInfo memory) {
        return tokenIdToPaymentInfo[_tokenId];
    }

    function _setPaymentInfo(uint256 _tokenId, PaymentInfo memory _paymentInfo) internal {
        tokenIdToPaymentInfo[_tokenId] = _paymentInfo;
    }

}