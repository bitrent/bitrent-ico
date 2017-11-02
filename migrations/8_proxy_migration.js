var RntTokenProxy = artifacts.require("./RntTokenProxy.sol");
var RntToken = artifacts.require("./RntToken.sol");
var RntTokenVault = artifacts.require("./RntTokenVault.sol");
var RntCrowdsale = artifacts.require("./RntCrowdsale.sol");

// TODO: replace by real address
const defaultAllowedAddress = "0x0";

module.exports = function(deployer) {
    deployer.deploy(RntTokenProxy, RntToken.address, RntTokenVault.address, defaultAllowedAddress, RntCrowdsale.address);
};