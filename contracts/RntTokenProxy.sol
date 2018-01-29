pragma solidity ^0.4.15;

import "../library/lifecycle/Destructible.sol";
import "../library/lifecycle/Pausable.sol";
import "../library/interface/ICrowdSale.sol";
import "../library/interface/IPricingStrategy.sol";
import "../library/ownership/AllowedAddresses.sol";
import "../library/ownership/HasNoEther.sol";


contract RntTokenProxy is Destructible, Pausable, AllowedAddresses, HasNoEther {
    ICrowdSale public crowdsale;

    IPricingStrategy public pricingStrategy;

    event CrowdsaleWasSet(address _crowdsale);
    event PricingStrategyWasSet(address _pricingStrategy);
    event TokensAllocated(address _receiver, bytes16 _customerUuid, uint256 _weiAmount);
    event TokenPriceInWeiUpdated(address _updatedFrom, uint256 _oneTokenInWei);

    /**
      @notice Set CrowdSale contract
      @param _crowdSale Address of CrowdSale
    */
    function setCrowdSale(address _crowdSale) onlyOwner external {
        crowdsale = ICrowdSale(_crowdSale);
        require(crowdsale.isCrowdSale());
        CrowdsaleWasSet(_crowdSale);
    }

    /**
      @notice Set pricing strategy contract
      @param _pricingStrategy Address of crowdsale
    */
    function setPricingStrategy(address _pricingStrategy) onlyOwner external {
        pricingStrategy = IPricingStrategy(_pricingStrategy);
        require(pricingStrategy.isPricingStrategy());
        PricingStrategyWasSet(_pricingStrategy);
    }

    /**
      @notice Add tokens to specified address, tokens amount depends of wei amount.
      @dev Tokens acount calculated using token price that specified in Prixing Strategy. This function should be used when tokens was buyed outside ethereum.
      @param _receiver Address, on wich tokens will be added.
      @param _customerUuid Uuid of account that was bought tokens.
      @param _weiAmount Wei that account was invest.
     */
    function allocate(address _receiver, bytes16 _customerUuid, uint256 _weiAmount) onlyAllowedAddresses whenNotPaused external {
        crowdsale.allocateTokens(_receiver, _customerUuid, _weiAmount);
        TokensAllocated(_receiver, _customerUuid, _weiAmount);
    }

    /**
      @notice Update token price in wei. Calling the method of pricing strategy
      @param _oneTokenInWei New price
     */
    function setTokenPriceInWei(uint256 _oneTokenInWei) onlyAllowedAddresses whenNotPaused external {
        pricingStrategy.setTokenPriceInWei(_oneTokenInWei);
        TokenPriceInWeiUpdated(msg.sender, _oneTokenInWei);
    }
}
