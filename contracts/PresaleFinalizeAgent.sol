pragma solidity ^0.4.15;

import "../library/ownership/HasNoEther.sol";
import "../library/math/SafeMath.sol";
import "../library/interface/IFinalizeAgent.sol";
import "../library/interface/IRntPresaleEthereumDeposit.sol";

contract PresaleFinalizeAgent is IFinalizeAgent, HasNoEther {
    using SafeMath for uint256;

    function PresaleFinalizeAgent(address _deposit, address _crowdsale){
        deposit = IRntPresaleEthereumDeposit(_deposit);
        crowdsaleAddress = _crowdsale;
    }

    modifier onlyCrowdsale() {
        require(msg.sender == crowdsaleAddress);
        _;
    }

    function isSane() public constant returns (bool) {
        return sane;
    }

    function setCrowdsaleAddress(address _address) onlyOwner public {
        crowdsaleAddress = _address;
    }

    function finalizePresale(uint256 presaleTokens) onlyCrowdsale public {
        require(sane);
        uint256 overallEther = deposit.overallTakenEther();
        uint256 multiplier = 10 ** 18;
        overallEther = overallEther.mul(multiplier);
        weiPerToken = overallEther.div(presaleTokens);
        require(weiPerToken > 0);
        sane = false;
    }

    function isFinalizeAgent() public constant returns (bool) {
        return true;
    }
}
