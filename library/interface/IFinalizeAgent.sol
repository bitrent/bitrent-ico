pragma solidity ^0.4.15;

import "./IRntPresaleEthereumDeposit.sol";

contract IFinalizeAgent {
    IRntPresaleEthereumDeposit public deposit;

    address public crowdsaleAddress;

    mapping(address => uint256) public tokensForAddress;

    uint256 public weiPerToken = 0;

    bool public sane = true;

    function finalizePresale(uint256 presaleTokens) public;

    function isSane() public constant returns (bool);

    function isFinalizeAgent() public constant returns (bool);
}