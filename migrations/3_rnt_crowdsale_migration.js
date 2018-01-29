var RntCrowdsale = artifacts.require("./RntCrowdsale.sol");
var RNTBToken = artifacts.require("./RNTBToken.sol");

module.exports = function(deployer) {
    deployer.deploy(RntCrowdsale, RNTBToken.address);
};
