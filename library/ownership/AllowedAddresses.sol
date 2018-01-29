pragma solidity ^0.4.15;

import "./Ownable.sol";

contract AllowedAddresses is Ownable {
    mapping(address => bool) public allowedAddresses;

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
}