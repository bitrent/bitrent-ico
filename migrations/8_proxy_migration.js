var RntTokenProxy = artifacts.require("./RntTokenProxy.sol");
var RNTBToken = artifacts.require("./RNTBToken.sol");
var RntTokenVault = artifacts.require("./RntTokenVault.sol");
var RntCrowdsale = artifacts.require("./RntCrowdsale.sol");

module.exports = function(deployer) {
    deployer.deploy(RntTokenProxy);
};