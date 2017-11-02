var RntToken = artifacts.require("./RntToken.sol");

module.exports = function(deployer) {
    deployer.deploy(RntToken);
};