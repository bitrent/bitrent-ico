var RNTBToken = artifacts.require("./RNTBToken.sol");

module.exports = function(deployer) {
    deployer.deploy(RNTBToken);
};