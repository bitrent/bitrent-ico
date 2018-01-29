var RNTBToken = artifacts.require("./RNTBToken.sol");
var RntDeposit = artifacts.require("./RntPresaleEthereumDeposit.sol");
var RntTokenProxy = artifacts.require("./RntTokenProxy.sol");
var RntTokenVault = artifacts.require("./RntTokenVault.sol");
var RntCrowdsale = artifacts.require("./RntCrowdsale.sol");
var RNTMultiSigWallet = artifacts.require("./RNTMultiSigWallet.sol");
var PricingStrategy = artifacts.require("./PricingStrategy.sol");

const icoTokens =     '690000000000000000000000000';

function bigNumber(n) {
    return new web3.BigNumber(n);
}

module.exports = function(deployer) {

    // Set allowance for tokens
    RNTBToken.deployed().then(function(token) {
      token.approve(RntCrowdsale.address, bigNumber(icoTokens));
      token.approve(RntTokenProxy.address,  bigNumber(icoTokens));
    });


    // allow proxy interact with vault
    RntTokenVault.deployed().then(function(vault) {
        vault.allowAddress(RntTokenProxy.address, true);
    });

    // init crowdsale
    RntCrowdsale.deployed().then(function(crowdsale) {
        crowdsale.setPricingStrategy(PricingStrategy.address);
        crowdsale.setMultiSigWallet(RNTMultiSigWallet.address);
        crowdsale.setBackendProxyBuyer(RntTokenProxy.address);
        crowdsale.setPresaleEthereumDeposit(RntDeposit.address);
        crowdsale.allowAllocation(RntTokenProxy.address, true);
    });


    RntTokenProxy.deployed().then(function (proxy) {
        proxy.setCrowdSale(RntCrowdsale.address);
        proxy.setPricingStrategy(PricingStrategy.address);
    });

    PricingStrategy.deployed().then(function (pricingStrategy) {
        pricingStrategy.allowAddress(RntTokenProxy.address, true);
    });
};