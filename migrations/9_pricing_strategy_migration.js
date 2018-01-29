var PricingStrategy = artifacts.require("./PricingStrategy.sol");

module.exports = function(deployer) {
    deployer.deploy(PricingStrategy);
};