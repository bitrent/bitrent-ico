var PricingStrategy = artifacts.require("./PricingStrategy.sol");
var RntCrowdsale = artifacts.require("./RntCrowdsale.sol");

module.exports = function(deployer) {
    deployer.deploy(PricingStrategy, RntCrowdsale.address);
};