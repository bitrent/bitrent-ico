var FinalizeAgent = artifacts.require("./PresaleFinalizeAgent.sol");
var RntDeposit = artifacts.require("./RntPresaleEthereumDeposit.sol");

module.exports = function(deployer) {
    deployer.deploy(FinalizeAgent, RntDeposit.address);
};