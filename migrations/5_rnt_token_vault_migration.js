var RntTokenVault = artifacts.require("./RntTokenVault.sol");
var RNTBToken = artifacts.require("./RNTBToken.sol");

module.exports = function(deployer) {
    deployer.deploy(RntTokenVault, RNTBToken.address);
};