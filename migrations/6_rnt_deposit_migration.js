var RntDeposit = artifacts.require("./RntPresaleEthereumDeposit.sol");
var RNTMultiSigWallet = artifacts.require("./RNTMultiSigWallet.sol");

module.exports = function(deployer) {
    deployer.deploy(RntDeposit, RNTMultiSigWallet.address);
};