var FinalizeAgent = artifacts.require("./PresaleFinalizeAgent.sol");
var RntDeposit = artifacts.require("./RntPresaleEthereumDeposit.sol");
var RntCrowdsale = artifacts.require("./RntCrowdsale.sol");

module.exports = function(deployer) {
    deployer.deploy(FinalizeAgent, RntDeposit.address, RntCrowdsale.address);
};