pragma solidity ^0.4.15;

import "../library/ownership/HasNoEther.sol";
import "../library/lifecycle/Pausable.sol";
import "../library/math/SafeMath.sol";
import "../library/interface/IRntToken.sol";


contract RntTokenVault is HasNoEther, Pausable {
    using SafeMath for uint256;

    IRntToken public rntToken;

    uint256 public accountsCount = 0;

    uint256 public tokens = 0;

    mapping (bytes16 => bool) public accountsStatuses;

    mapping (bytes16 => uint256) public balances;

    mapping (address => bool) public allowedAddresses;

    mapping (address => bytes16) public tokenTransfers;


    function RntTokenVault(address _rntTokenAddress){
        rntToken = IRntToken(_rntTokenAddress);
    }


    modifier onlyAllowedAddresses {
        require(msg.sender == owner || allowedAddresses[msg.sender] == true);
        _;
    }

    modifier onlyRegisteredAccount(bytes16 _uuid) {
        require(accountsStatuses[_uuid] == true);
        _;
    }

    function getVaultBalance() onlyAllowedAddresses public constant returns (uint256) {
        return rntToken.balanceOf(this);
    }

    function getTokenTransferUuid(address _address) onlyAllowedAddresses public constant returns (bytes16) {
        return tokenTransfers[_address];
    }

    function isAllowedAddress(address _address) onlyAllowedAddresses public constant returns (bool) {
        return allowedAddresses[_address];
    }

    function isRegisteredAccount(address _address) onlyAllowedAddresses public constant returns (bool) {
        return allowedAddresses[_address];
    }

    /**
     * Register account for accounts counting
     */
    function registerAccount(bytes16 _uuid) public {
        accountsStatuses[_uuid] = true;
        accountsCount = accountsCount.add(1);
    }

    /**
     *  Set allowance for address to interact with contract
     */
    function allowAddress(address _address, bool _allow) onlyOwner {
        allowedAddresses[_address] = _allow;
    }

    function addTokensToAccount(bytes16 _uuid, uint256 _tokensCount) onlyAllowedAddresses whenNotPaused public returns (bool) {
        registerAccount(_uuid);
        balances[_uuid] = balances[_uuid].add(_tokensCount);
        tokens = tokens.add(_tokensCount);
        return true;
    }

    function removeTokensFromAccount(bytes16 _uuid, uint256 _tokensCount) onlyAllowedAddresses
            onlyRegisteredAccount(_uuid) whenNotPaused internal returns (bool) {
        balances[_uuid] = balances[_uuid].sub(_tokensCount);
        return true;
    }

    function transferTokensToAccount(bytes16 _from, bytes16 _to, uint256 _tokensCount) onlyAllowedAddresses
            onlyRegisteredAccount(_from) whenNotPaused public returns (bool) {
        registerAccount(_to);
        balances[_from] = balances[_from].sub(_tokensCount);
        balances[_to] = balances[_to].add(_tokensCount);
        return true;
    }

    function moveAllTokensToAddress(bytes16 _uuid, address _address) onlyAllowedAddresses
            onlyRegisteredAccount(_uuid) whenNotPaused public returns (bool) {
        uint256 accountBalance = balances[_uuid];
        removeTokensFromAccount(_uuid, accountBalance);
        rntToken.transfer(_address, accountBalance);
        tokens = tokens.sub(accountBalance);
        tokenTransfers[_address] = _uuid;
        return true;
    }

    function moveTokensToAddress(bytes16 _uuid, address _address, uint256 _tokensCount) onlyAllowedAddresses
            onlyRegisteredAccount(_uuid) whenNotPaused public returns (bool) {
        removeTokensFromAccount(_uuid, _tokensCount);
        rntToken.transfer(_address, _tokensCount);
        tokens = tokens.sub(_tokensCount);
        tokenTransfers[_address] = _uuid;
        return true;
    }

    function transferTokensFromVault(address _to, uint256 _tokensCount) onlyOwner public returns (bool) {
        rntToken.transfer(_to, _tokensCount);
        return true;
    }
}
