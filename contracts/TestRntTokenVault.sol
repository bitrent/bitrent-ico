pragma solidity ^0.4.15;


import "./RntTokenVault.sol";


contract TestRntTokenVault is RntTokenVault {
    function TestRntTokenVault(address _rntTokenAddress) RntTokenVault(_rntTokenAddress) {

    }

    function testRemoveTokensFromAccount(bytes16 _uuid, uint256 _tokensCount) returns (bool) {
        super.removeTokensFromAccount(_uuid, _tokensCount);
        return true;
    }
}
