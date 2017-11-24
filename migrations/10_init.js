var RntToken = artifacts.require("./RntToken.sol");
var FinalizeAgent = artifacts.require("./PresaleFinalizeAgent.sol");
var RntDeposit = artifacts.require("./RntPresaleEthereumDeposit.sol");
var RntTokenProxy = artifacts.require("./RntTokenProxy.sol");
var RntTokenVault = artifacts.require("./RntTokenVault.sol");
var RntCrowdsale = artifacts.require("./RntCrowdsale.sol");
var RNTMultiSigWallet = artifacts.require("./RNTMultiSigWallet.sol");
var PricingStrategy = artifacts.require("./PricingStrategy.sol");

var ownerAddress = "";
// const companyAddress = "";
// const teamAddress = "";

const icoTokens =     '690000000000000000000000000';
const companyTokens = '100000000000000000000000000';
const teamTokens =    '5000000000000000000000000';

function bigNumber(n) {
    return new web3.BigNumber(n);
}

module.exports = function(deployer) {

    // Set allowance for tokens
    RntToken.deployed().then(function(token) {
        ownerAddress = token.owner.call().then(function(owner) {
          token.approve(RntCrowdsale.address, bigNumber(icoTokens));
          token.approve(RntTokenProxy.address,  bigNumber(icoTokens));
          // token.approve(companyAddress, bigNumber(companyTokens));
          // token.approve(teamAddress, bigNumber(teamTokens));

          token.setTransferAgent(owner, true);
          token.setTransferAgent(RntCrowdsale.address, true);
          token.setTransferAgent(RntTokenProxy.address, true);
          // token.setTransferAgent(companyAddress, true);
          // token.setTransferAgent(teamAddress, true);

          token.setReleaseAgent(owner);
        });
    });


    // allow proxy interact with vault
    RntTokenVault.deployed().then(function(vault) {
        vault.allowAddress(RntTokenProxy.address, true);
    });

    // init crowdsale
    RntCrowdsale.deployed().then(function(crowdsale) {
        crowdsale.setPresaleFinalizeAgent(FinalizeAgent.address);
        crowdsale.setPricingStartegy(PricingStrategy.address);
        crowdsale.setMultiSigWallet(RNTMultiSigWallet.address);
        crowdsale.setBackendProxyBuyer(RntTokenProxy.address);
        crowdsale.setPresaleEthereumDeposit(RntDeposit.address);
        crowdsale.allowAllocation(RntTokenProxy.address, true);
    });
};