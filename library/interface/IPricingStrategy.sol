pragma solidity ^0.4.15;

/**
 * Fixed crowdsale pricing - everybody gets the same price.
 */
contract IPricingStrategy {
    /**
     * Calculate the current price for buy in amount.
     *
     */
    function calculatePrice(uint256 _value, uint256 _decimals) public constant returns (uint);

    /**
     * Updates token price in wei. Could be changed only from allowed addresses
     *
     */
    function setTokenPriceInWei(uint256 _oneTokenInWei) public returns (bool);

    function isPricingStrategy() public constant returns (bool);
}