pragma solidity ^0.4.15;

import "../library/ownership/HasNoEther.sol";
import "../library/math/SafeMath.sol";


/**
 * Fixed crowdsale pricing - everybody gets the same price.
 */
contract PricingStrategy is HasNoEther {
    using SafeMath for uint;

    /* How many weis one token costs */
    uint256 public oneTokenInWei;

    address public crowdsaleAddress;

    function PricingStrategy(address _crowdsale) {
        crowdsaleAddress = _crowdsale;
    }

    modifier onlyCrowdsale() {
        require(msg.sender == crowdsaleAddress);
        _;
    }

    /**
     * Calculate the current price for buy in amount.
     *
     */
    function calculatePrice(uint256 _value, uint256 _decimals) public constant returns (uint) {
        uint256 multiplier = 10 ** _decimals;
        uint256 weiAmount = _value.mul(multiplier);
        uint256 tokens = weiAmount.div(oneTokenInWei);
        return tokens;
    }

    function setTokenPriceInWei(uint _oneTokenInWei) onlyCrowdsale public returns (bool) {
        oneTokenInWei = _oneTokenInWei;
        return true;
    }
}