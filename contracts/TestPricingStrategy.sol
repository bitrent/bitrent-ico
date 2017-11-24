pragma solidity ^0.4.15;

import "./PricingStrategy.sol";


contract TestPricingStrategy is PricingStrategy{

    function TestPricingStrategy(address _crowdsale) PricingStrategy(_crowdsale) {

    }

    function testSetTokenPriceInWei(uint _oneTokenInWei) public returns (bool) {
        oneTokenInWei = _oneTokenInWei;
        return true;
    }
}
