pragma solidity ^0.4.15;


contract IRntToken {
    uint256 public decimals = 18;

    uint256 public totalSupply = 1000000000 * (10 ** 18);

    string public name = "RNT Token";

    string public code = "RNT";


    function balanceOf() public constant returns (uint256 balance);

    function transfer(address _to, uint _value) public returns (bool success);

    function transferFrom(address _from, address _to, uint _value) public returns (bool success);
}
