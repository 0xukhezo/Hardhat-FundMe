// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/** @title A contract for price converter
 * @author Alvaro Teran
 * @notice This contract is a demo of a simple funding contract
 * @dev This implements price feeds as our library
 */

library PriceConverter {
    function getPrice(AggregatorV3Interface _priceFeed)
        internal
        view
        returns (uint256)
    {
        (, int256 price, , , ) = _priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }

    function getConversionRate(
        uint256 _ethAmount,
        AggregatorV3Interface _priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(_priceFeed);
        uint256 ethAmountInUSDC = (ethPrice * _ethAmount) / 1e18;
        return ethAmountInUSDC;
    }
}
