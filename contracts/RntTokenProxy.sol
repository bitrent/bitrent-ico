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

    modifier onlyAllowedAddresses {
        require(msg.sender == owner || allowedAddresses[msg.sender] == true);
        _;
    }

    /**
     *  Set allowance for address to interact with contract
     */
    function allowAddress(address _address, bool _allow) onlyOwner external {
        allowedAddresses[_address] = _allow;
    }

    function addTokens(bytes16 _uuid, uint256 _tokensCount) onlyAllowedAddresses whenNotPaused external {
        rntTokenVault.addTokensToAccount(_uuid, _tokensCount);
        rntToken.transferFrom(owner, address(rntTokenVault), _tokensCount);
    }

    function moveTokens(address _to, bytes16 _uuid, uint256 _tokensCount) onlyAllowedAddresses whenNotPaused external {
        rntTokenVault.moveTokensToAddress(_uuid, _to, _tokensCount);
    }

    function moveAllTokens(address _to, bytes16 _uuid) onlyAllowedAddresses whenNotPaused external {
        rntTokenVault.moveAllTokensToAddress(_uuid, _to);
    }

    function allocate(address _receiver, bytes16 _customerUuid, uint256 _weiAmount) onlyAllowedAddresses whenNotPaused external {
        crowdsale.allocateTokens(_receiver, _customerUuid, _weiAmount);
    }
}
