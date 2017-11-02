var RNTMultiSigWallet = artifacts.require("./RNTMultiSigWallet.sol");

// TODO: replace by real admins addresses
const admins = ['0x0748aaecf0bc41a059d5bbdcbe04f12e2e920431', '0x7cb490a613574025b1b898543c2a4e649144694c'];

// TODO: replace by real required confirmations
const requiredConfirmations = 2;

module.exports = function(deployer) {
    deployer.deploy(RNTMultiSigWallet, admins, requiredConfirmations);
};