pragma solidity ^0.4.15;

import "../library/ownership/HasNoEther.sol";
import "../library/math/SafeMath.sol";
import "../library/interface/IPricingStrategy.sol";
import "../library/ownership/AllowedAddresses.sol";

contract PricingStrategy is IPricingStrategy, AllowedAddresses, HasNoEther {
    using SafeMath for uint256;

    /* How many weis one token costs */
    uint256 public oneTokenInWei;

    event TokenPriceInWeiUpdated(address _updatedFrom, uint256 _oneTokenInWei);

    function isPricingStrategy() public constant returns (bool) {
        return true;
    }

    /**
      @notice Calculate tokens amount for ether sent according to oneTokenInWei value
      @param _value Count of ether sent.
      @param _decimals Decimals of the token
     */
    function calculatePrice(uint256 _value, uint256 _decimals) public constant returns (uint256) {
        uint256 multiplier = 10 ** _decimals;
        uint256 weiAmount = _value.mul(multiplier);
        uint256 tokens = weiAmount.div(oneTokenInWei);
        return tokens;
    }

    /**
      @notice Update token price in wei
      @param _oneTokenInWei New price
     */
    function setTokenPriceInWei(uint256 _oneTokenInWei) onlyAllowedAddresses public returns (bool) {
        oneTokenInWei = _oneTokenInWei;
        TokenPriceInWeiUpdated(msg.sender, oneTokenInWei);
        return true;
    }
}