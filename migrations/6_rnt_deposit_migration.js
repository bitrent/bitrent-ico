var RntDeposit = artifacts.require("./RntPresaleEthereumDeposit.sol");
var RNTMultiSigWallet = artifacts.require("./RNTMultiSigWallet.sol");

// TODO: replace by real whitelist addresses
const whitelistedAddresses = ["0x8f4440e9796d5bede600ed20de6aa1da97ac9187", "0x4f42e81e6184098e2fcaf48e0c7d322c3db208bb", "0xe3bdb7f15eaa995cdeac9f57268ad5040a0cabf4"]

module.exports = function(deployer) {
    deployer.deploy(RntDeposit, whitelistedAddresses, RNTMultiSigWallet.address);
};