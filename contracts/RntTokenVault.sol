pragma solidity ^0.4.15;

import "../library/ownership/HasNoEther.sol";
import "../library/lifecycle/Pausable.sol";
import "../library/math/SafeMath.sol";
import "../library/interface/IRntToken.sol";

/*
 * @deprecated - This contracts won't be used in ICO
 */
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

    /**
    @notice Modifier that prevent calling function from not allowed address.
    @dev Owner always allowed address.
    */
    modifier onlyAllowedAddresses {
        require(msg.sender == owner || allowedAddresses[msg.sender] == true);
        _;
    }

    /**
    @notice Modifier that prevent calling function if account not registered.
    */
    modifier onlyRegisteredAccount(bytes16 _uuid) {
        require(accountsStatuses[_uuid] == true);
        _;
    }

    /**
    @notice Get current amount of tokens on Vault address.
    @return { amount of tokens }
    */
    function getVaultBalance() onlyAllowedAddresses public constant returns (uint256) {
        return rntToken.balanceOf(address(this));
    }

    /**
    @notice Get uuid of account taht transfer tokens to specified address.
    @param  _address Transfer address.
    @return { uuid that wsa transfer tokens }
    */
    function getTokenTransferUuid(address _address) onlyAllowedAddresses public constant returns (bytes16) {
        return tokenTransfers[_address];
    }

    /**
    @notice Check that address is allowed to interact with functions.
    @return { true if allowed, false if not }
    */
    function isAllowedAddress(address _address) onlyAllowedAddresses public constant returns (bool) {
        return allowedAddresses[_address];
    }

    /**
    @notice Check that address is registered.
    @return { true if registered, false if not }
    */
    function isRegisteredAccount(address _address) onlyAllowedAddresses public constant returns (bool) {
        return allowedAddresses[_address];
    }

    /**
     @notice Register account.
     @dev It used for accounts counting.
     */
    function registerAccount(bytes16 _uuid) public {
        accountsStatuses[_uuid] = true;
        accountsCount = accountsCount.add(1);
    }

    /**
     @notice Set allowance for address to interact with contract.
     @param _address Address to allow or disallow.
     @param _allow True to allow address to interact with function, false to disallow.
    */
    function allowAddress(address _address, bool _allow) onlyOwner {
        allowedAddresses[_address] = _allow;
    }

    /**
    @notice Function for adding tokens to specified account.
    @dev Account will be registered if it wasn't. Tokens will not be added to Vault address.
    @param _uuid Uuid of account.
    @param _tokensCount Number of tokens for adding to account.
    @return { true if added, false if not }
    */
    function addTokensToAccount(bytes16 _uuid, uint256 _tokensCount) onlyAllowedAddresses whenNotPaused public returns (bool) {
        registerAccount(_uuid);
        balances[_uuid] = balances[_uuid].add(_tokensCount);
        tokens = tokens.add(_tokensCount);
        return true;
    }

    /**
    @notice Function for removing tokens from specified account.
    @dev Function throw exception if account wasn't registered. Tokens will not be returned to owner address.
    @param _uuid Uuid of account.
    @param _tokensCount Number of tokens for adding to account.
    @return { true if added, false if not }
    */
    function removeTokensFromAccount(bytes16 _uuid, uint256 _tokensCount) onlyAllowedAddresses
            onlyRegisteredAccount(_uuid) whenNotPaused internal returns (bool) {
        balances[_uuid] = balances[_uuid].sub(_tokensCount);
        return true;
    }

    /**
    @notice Function for transfering tokens from one account to another.
    @param _from Account from which tokens will be transfered.
    @param _to Account to which tokens will be transfered.
    @param _tokensCount Number of tokens that will be transfered.
    @return { true if transfered successful, false if not }
    */
    function transferTokensToAccount(bytes16 _from, bytes16 _to, uint256 _tokensCount) onlyAllowedAddresses
            onlyRegisteredAccount(_from) whenNotPaused public returns (bool) {
        registerAccount(_to);
        balances[_from] = balances[_from].sub(_tokensCount);
        balances[_to] = balances[_to].add(_tokensCount);
        return true;
    }

    /**
    @notice Function for withdrawal all tokens from Vault account to address.
    @dev Will transfer tokens from Vault address to specified address.
    @param _uuid Account from which tokens will be transfered.
    @param _address Address on which tokens will be transfered.
    @return { true if withdrawal successful, false if not }
    */
    function moveAllTokensToAddress(bytes16 _uuid, address _address) onlyAllowedAddresses
            onlyRegisteredAccount(_uuid) whenNotPaused public returns (bool) {
        uint256 accountBalance = balances[_uuid];
        removeTokensFromAccount(_uuid, accountBalance);
        rntToken.transfer(_address, accountBalance);
        tokens = tokens.sub(accountBalance);
        tokenTransfers[_address] = _uuid;
        return true;
    }

    /**
    @notice Function for withdrawal tokens from Vault account to address.
    @dev Will transfer tokens from Vault address to specified address.
    @param _uuid Account from which tokens will be transfered.
    @param _address Address on which tokens will be transfered.
    @param _tokensCount Number of tokens that will be transfered.
    @return { true if transfered successful, false if not }
    */
    function moveTokensToAddress(bytes16 _uuid, address _address, uint256 _tokensCount) onlyAllowedAddresses
            onlyRegisteredAccount(_uuid) whenNotPaused public returns (bool) {
        removeTokensFromAccount(_uuid, _tokensCount);
        rntToken.transfer(_address, _tokensCount);
        tokens = tokens.sub(_tokensCount);
        tokenTransfers[_address] = _uuid;
        return true;
    }

    /**
    @notice Function for withdrawal tokens from Vault to specified address.
    @dev Will transfer tokens from Vault address to specified address.
    @param _to Address on which tokens will be transfered.
    @param _tokensCount Number of tokens that will be transfered.
    @return { true if transfered successful, false if not }
    */
    function transferTokensFromVault(address _to, uint256 _tokensCount) onlyOwner public returns (bool) {
        rntToken.transfer(_to, _tokensCount);
        return true;
    }
}
