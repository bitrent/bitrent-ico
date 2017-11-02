var RntCrowdsale = artifacts.require("./RntCrowdsale.sol");
var RntToken = artifacts.require("./RntToken.sol");

module.exports = function(deployer) {
    deployer.deploy(RntCrowdsale, RntToken.address);
};
