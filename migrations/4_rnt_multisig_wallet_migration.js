var RNTMultiSigWallet = artifacts.require("./RNTMultiSigWallet.sol");

// TODO: replace by real admins addresses
const admins = ['0x00D41eF4F599efc76dd5613E8FD0C6a1a9B1016B', '0x005E4541A332d6E05601c8d397bac92476919150'];

// TODO: replace by real required confirmations
const requiredConfirmations = 2;

module.exports = function(deployer) {
    deployer.deploy(RNTMultiSigWallet, admins, requiredConfirmations);
};