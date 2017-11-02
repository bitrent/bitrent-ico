pragma solidity ^0.4.15;

import "../library/lifecycle/Pausable.sol";
import "../library/math/SafeMath.sol";
import "./RNTMultiSigWallet.sol";


contract RntPresaleEthereumDeposit is Pausable {
    using SafeMath for uint256;

    uint256 public overallTakenEther = 0;

    mapping (address => uint256) public receivedEther;

    struct Donator {
        address addr;
        uint256 donated;
    }

    Donator[] donators;

    RNTMultiSigWallet public wallet;

    function RntPresaleEthereumDeposit(address _walletAddress) {
        wallet = RNTMultiSigWallet(_walletAddress);
    }

    function findDonator(address _address) internal returns(bool, uint256) {
        for (uint i = 0; i < donators.length; i++) {
            if (donators[i].addr == _address) {
                return (true, i);
            }
        }
        return (false, 0);
    }

    function insertDonator(address _address) internal {
        uint pos = 0;
        bool isFound = false;
        (isFound, pos) = findDonator(_address);
        if (!isFound) {
            donators.push(Donator(_address, receivedEther[_address]));
        }
    }

    function updateDonator(address _address) internal {
        for (uint i = 0; i < donators.length; i++) {
            if (donators[i].addr == _address) {
                donators[i].donated =  receivedEther[_address];
            }
        }
    }

    function removeDonator(address _address) internal {
        for (uint i = 0; i < donators.length; i++) {
            if (donators[i].addr == _address) {
                delete donators[i];
            }
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
        insertDonator(msg.sender);
        updateDonator(msg.sender);
    }

    /*
     *  Function for sending ether to wallet and update donators info
     */
    function giveEther() whenNotPaused payable {
        wallet.transfer(msg.value);

        overallTakenEther = overallTakenEther.add(msg.value);
        receivedEther[msg.sender] = receivedEther[msg.sender].add(msg.value);
        insertDonator(msg.sender);
        updateDonator(msg.sender);
    }

    function receivedEtherFrom(address _from) whenNotPaused constant public returns(uint256) {
        return receivedEther[_from];
    }

    function myEther() whenNotPaused constant public returns(uint256) {
        return receivedEther[msg.sender];
    }
}
