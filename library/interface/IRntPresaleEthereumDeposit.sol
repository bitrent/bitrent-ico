pragma solidity ^0.4.15;

contract IRntPresaleEthereumDeposit {
    uint256 public overallTakenEther;

    mapping (address => uint256) public receivedEther;

    function getDonatorsNumber() external constant returns (uint256);

    function getDonator(uint pos) external constant returns (address, uint256);

    function receivedEtherFrom(address _from) constant public returns (uint256);

    function myEther() constant public returns (uint256);
}