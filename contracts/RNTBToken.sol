pragma solidity ^0.4.15;

import "../library/ownership/HasNoEther.sol";
import "../library/interface/IRntToken.sol";
import "../library/token/PausableToken.sol";

contract RNTBToken is HasNoEther, IRntToken, PausableToken {
    function RNTBToken() public {
        totalSupply = 1000000000 * (10 ** uint256(decimals));
        owner = msg.sender;
        balances[owner] = totalSupply;
    }
}
