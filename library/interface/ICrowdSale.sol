pragma solidity ^0.4.15;

contract ICrowdSale {
    function allocateTokens(address _receiver, bytes16 _customerUuid, uint256 _weiAmount) public;

    function isCrowdSale() public constant returns (bool);
}