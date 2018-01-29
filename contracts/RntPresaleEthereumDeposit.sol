pragma solidity ^0.4.15;

import "../library/lifecycle/Pausable.sol";
import "../library/math/SafeMath.sol";
import "./RNTMultiSigWallet.sol";
import "../library/interface/IRntPresaleEthereumDeposit.sol";


contract RntPresaleEthereumDeposit is IRntPresaleEthereumDeposit, Pausable {
    using SafeMath for uint256;

    struct Donator {
        address addr;
        uint256 donated;
    }

    Donator[] donators;

    RNTMultiSigWallet public wallet;

    function RntPresaleEthereumDeposit(address _walletAddress) {
        wallet = RNTMultiSigWallet(_walletAddress);
    }

    function updateDonator(address _address) internal {
        bool isFound = false;
        for (uint i = 0; i < donators.length; i++) {
            if (donators[i].addr == _address) {
                donators[i].donated =  receivedEther[_address];
                isFound = true;
                break;
            }
        }
        if (!isFound) {
            donators.push(Donator(_address, receivedEther[_address]));
        }
    }

    function getDonatorsNumber() external constant returns(uint256) {
        return donators.length;
    }

    function getDonator(uint pos) external constant returns(address, uint256) {
        return (donators[pos].addr, donators[pos].donated);
    }

    /*
     * Fallback function for sending ether to wallet and update donators info
     */
    function() whenNotPaused payable {
        wallet.transfer(msg.value);

        overallTakenEther = overallTakenEther.add(msg.value);
        receivedEther[msg.sender] = receivedEther[msg.sender].add(msg.value);

        updateDonator(msg.sender);
    }

    function receivedEtherFrom(address _from) whenNotPaused constant public returns(uint256) {
        return receivedEther[_from];
    }

    function myEther() whenNotPaused constant public returns(uint256) {
        return receivedEther[msg.sender];
    }
}
