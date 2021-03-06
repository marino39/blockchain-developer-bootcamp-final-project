// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./IAdvertisementSurfacePayments.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @author Marcin Gorzynski
/// @title The Advertisement Surface Payments functionality
/// @notice The abstract contract that keeps track of payment method for given advertisement surface token id
abstract contract AdvertisementSurfacePayments is IAdvertisementSurfacePayments {

    using SafeMath for uint256;

    /// @dev The mapping of advertisement surface token to payment info
    mapping(uint256 => PaymentInfo) private tokenIdToPaymentInfo;

    /// @dev Gets payment info for given advertisement surface token
    /// @param _tokenId The advertisement surface token id
    /// @return The payment info
    function _getPaymentInfo(uint256 _tokenId) internal view returns (PaymentInfo memory) {
        return tokenIdToPaymentInfo[_tokenId];
    }

    /// @dev Sets payment info for given advertisement surface token
    /// @param _tokenId The advertisement surface token id
    /// @param _paymentInfo The payment info
    function _setPaymentInfo(uint256 _tokenId, PaymentInfo memory _paymentInfo) internal {
        if (tokenIdToPaymentInfo[_tokenId].erc20 == address(0)) {
            tokenIdToPaymentInfo[_tokenId] = _paymentInfo;
        } else {
            tokenIdToPaymentInfo[_tokenId].minBid = _paymentInfo.minBid;
        }
    }

}