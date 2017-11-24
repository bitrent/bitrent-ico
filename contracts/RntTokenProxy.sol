pragma solidity ^0.4.15;

import "./RntTokenVault.sol";
import "../library/lifecycle/Destructible.sol";
import "../library/lifecycle/Pausable.sol";

contract ICrowdsale {
    function allocateTokens(address _receiver, bytes16 _customerUuid, uint256 _weiAmount) public;
}

contract RntTokenProxy is Destructible, Pausable, HasNoEther {
    IRntToken public rntToken;

    ICrowdsale public crowdsale;

    RntTokenVault public rntTokenVault;

    mapping (address => bool) public allowedAddresses;

    function RntTokenProxy(address _tokenAddress, address _vaultAddress, address _defaultAllowed, address _crowdsaleAddress) {
        rntToken = IRntToken(_tokenAddress);
        rntTokenVault = RntTokenVault(_vaultAddress);
        crowdsale = ICrowdsale(_crowdsaleAddress);
        allowedAddresses[_defaultAllowed] = true;
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
      @notice Set allowance for address to interact with contract.
      @param _address Address to allow or disallow.
      @param _allow True to allow address to interact with function, false to disallow.
     */
    function allowAddress(address _address, bool _allow) onlyOwner external {
        allowedAddresses[_address] = _allow;
    }

    /**
      @notice Function for adding tokens to account.
      @dev If account wasn't created, it will be created and tokens will be added. Also this function transfer tokens to address of Valut.
      @param _uuid Account uuid.
      @param _tokensCount Number of tokens that will be added to account.
     */
    function addTokens(bytes16 _uuid, uint256 _tokensCount) onlyAllowedAddresses whenNotPaused external {
        rntTokenVault.addTokensToAccount(_uuid, _tokensCount);
        rntToken.transferFrom(owner, address(rntTokenVault), _tokensCount);
    }

    /**
      @notice Function for transfering tokens from account to specified address.
      @dev It will transfer tokens from Vault address to specified address.
      @param _to Address, on wich tokens will be added.
      @param _uuid Account, from wich token will be taken.
      @param _tokensCount Number of tokens for transfering.
     */
    function moveTokens(address _to, bytes16 _uuid, uint256 _tokensCount) onlyAllowedAddresses whenNotPaused external {
        rntTokenVault.moveTokensToAddress(_uuid, _to, _tokensCount);
    }

    /**
      @notice Function for transfering all tokens from account to specified address.
      @dev It will transfer all account allowed tokens from Vault address to specified address.
      @param _to Address, on wich tokens will be added.
      @param _uuid Account, from wich token will be taken.
     */
    function moveAllTokens(address _to, bytes16 _uuid) onlyAllowedAddresses whenNotPaused external {
        rntTokenVault.moveAllTokensToAddress(_uuid, _to);
    }

    /**
      @notice Add tokens to specified address, tokens amount depends of wei amount.
      @dev Tokens acount calculated using token price that specified in Prixing Strategy. This function should be used when tokens was buyed outside ethereum.
      @param _receiver Address, on wich tokens will be added.
      @param _customerUuid Uuid of account that was bought tokens.
      @param _weiAmount Wei that account was invest.
     */
    function allocate(address _receiver, bytes16 _customerUuid, uint256 _weiAmount) onlyAllowedAddresses whenNotPaused external {
        crowdsale.allocateTokens(_receiver, _customerUuid, _weiAmount);
    }
}
