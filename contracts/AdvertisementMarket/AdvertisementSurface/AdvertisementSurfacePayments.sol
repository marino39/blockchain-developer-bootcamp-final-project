// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IAdvertisementSurfacePayments.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

abstract contract AdvertisementSurfacePayments is IAdvertisementSurfacePayments {

    mapping (uint256 => PaymentInfo) private tokenIdToPaymentInfo;

    function _getPaymentInfo(uint256 _tokenId) internal view returns(PaymentInfo memory) {
        return tokenIdToPaymentInfo[_tokenId];
    }

    function _setPaymentInfo(uint256 _tokenId, PaymentInfo memory _paymentInfo) internal {
        tokenIdToPaymentInfo[_tokenId] = _paymentInfo;
    }

}