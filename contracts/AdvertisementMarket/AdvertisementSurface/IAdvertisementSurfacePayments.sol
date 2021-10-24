// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAdvertisementSurfacePayments {

    // @description The structure used to define how owner of the surface is paid.
    struct PaymentInfo {
        address erc20;    // The address of ERC20 token contract used for payments.
        uint256 minBid;   // Minimal bid for advertisement per 1 second.
    }

    // @description It gets PaymentInfo by the token id.
    // @param _tokenId The id of the token for which the info is returned.
    function getPaymentInfo(uint256 _tokenId) external view returns(PaymentInfo memory);

    // @description It sets PaymentInfo by the token id.
    // @param _tokenId The id of the token for which the info is set.
    // @param _paymentInfo The paymentInfo to update.
    function setPaymentInfo(uint256 _tokenId, PaymentInfo memory _paymentInfo) external;

}