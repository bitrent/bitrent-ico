var RntTokenVault = artifacts.require("./RntTokenVault.sol");
var RntToken = artifacts.require("./RntToken.sol");

module.exports = function(deployer) {
    deployer.deploy(RntTokenVault, RntToken.address);
};