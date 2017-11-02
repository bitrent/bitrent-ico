pragma solidity ^0.4.15;

import "../library/ownership/HasNoEther.sol";
import "../library/math/SafeMath.sol";
import "./RntPresaleEthereumDeposit.sol";


contract PresaleFinalizeAgent is HasNoEther {
    using SafeMath for uint256;

    RntPresaleEthereumDeposit public deposit;

    mapping (address => uint256) public tokensForAddress;

    uint256 public weiPerToken = 0;

    bool public sane = true;

    function PresaleFinalizeAgent(address _deposit){
        deposit = RntPresaleEthereumDeposit(_deposit);
    }

    function isSane() public constant returns (bool) {
        return sane;
    }

    function finalizePresale(uint256 presaleTokens) public {
        require(sane);
        uint256 overallEther = deposit.overallTakenEther();
        uint256 multiplier = 10 ** 18;
        overallEther = overallEther.mul(multiplier);
        weiPerToken = overallEther.div(presaleTokens);
        require(weiPerToken > 0);
        sane = false;
    }
}
