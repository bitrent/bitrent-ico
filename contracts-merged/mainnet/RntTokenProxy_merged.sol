pragma solidity ^0.4.15;

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;


  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  function Ownable() {
    owner = msg.sender;
  }


  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }


  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) onlyOwner public {
    require(newOwner != address(0));
    OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}

/**
 * @title Destructible
 * @dev Base contract that can be destroyed by owner. All funds in contract will be sent to the owner.
 */
contract Destructible is Ownable {

  function Destructible() payable { }

  /**
   * @dev Transfers the current balance to the owner and terminates the contract.
   */
  function destroy() onlyOwner public {
    selfdestruct(owner);
  }

  function destroyAndSend(address _recipient) onlyOwner public {
    selfdestruct(_recipient);
  }
}

/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable is Ownable {
  event Pause();
  event Unpause();

  bool public paused = false;


  /**
   * @dev Modifier to make a function callable only when the contract is not paused.
   */
  modifier whenNotPaused() {
    require(!paused);
    _;
  }

  /**
   * @dev Modifier to make a function callable only when the contract is paused.
   */
  modifier whenPaused() {
    require(paused);
    _;
  }

  /**
   * @dev called by the owner to pause, triggers stopped state
   */
  function pause() onlyOwner whenNotPaused public {
    paused = true;
    Pause();
  }

  /**
   * @dev called by the owner to unpause, returns to normal state
   */
  function unpause() onlyOwner whenPaused public {
    paused = false;
    Unpause();
  }
}

contract ICrowdSale {
    function allocateTokens(address _receiver, bytes16 _customerUuid, uint256 _weiAmount) public;

    function isCrowdSale() public constant returns (bool);
}

/**
 * Fixed crowdsale pricing - everybody gets the same price.
 */
contract IPricingStrategy {
    /**
     * Calculate the current price for buy in amount.
     *
     */
    function calculatePrice(uint256 _value, uint256 _decimals) public constant returns (uint);

    /**
     * Updates token price in wei. Could be changed only from allowed addresses
     *
     */
    function setTokenPriceInWei(uint256 _oneTokenInWei) public returns (bool);

    function isPricingStrategy() public constant returns (bool);
}

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

/**
 * @title Contracts that should not own Ether
 * @author Remco Bloemen <remco@2π.com>
 * @dev This tries to block incoming ether to prevent accidental loss of Ether. Should Ether end up
 * in the contract, it will allow the owner to reclaim this ether.
 * @notice Ether can still be send to this contract by:
 * calling functions labeled `payable`
 * `selfdestruct(contract_address)`
 * mining directly to the contract address
*/
contract HasNoEther is Ownable {

  /**
  * @dev Constructor that rejects incoming Ether
  * @dev The `payable` flag is added so we can access `msg.value` without compiler warning. If we
  * leave out payable, then Solidity will allow inheriting contracts to implement a payable
  * constructor. By doing it this way we prevent a payable constructor from working. Alternatively
  * we could use assembly to access msg.value.
  */
  function HasNoEther() payable {
    require(msg.value == 0);
  }

  /**
   * @dev Disallows direct send by settings a default function without the `payable` flag.
   */
  function() external {
  }

  /**
   * @dev Transfer all Ether held by the contract to the owner.
   */
  function reclaimEther() external onlyOwner {
    assert(owner.send(this.balance));
  }
}

contract RntTokenProxy is Destructible, Pausable, AllowedAddresses, HasNoEther {
    ICrowdSale public crowdsale;

    IPricingStrategy public pricingStrategy;

    event CrowdsaleWasSet(address _crowdsale);
    event PricingStrategyWasSet(address _pricingStrategy);
    event TokensAllocated(address _receiver, bytes16 _customerUuid, uint256 _weiAmount);
    event TokenPriceInWeiUpdated(address _updatedFrom, uint256 _oneTokenInWei);

    /**
      @notice Set CrowdSale contract
      @param _crowdSale Address of CrowdSale
    */
    function setCrowdSale(address _crowdSale) onlyOwner external {
        crowdsale = ICrowdSale(_crowdSale);
        require(crowdsale.isCrowdSale());
        CrowdsaleWasSet(_crowdSale);
    }

    /**
      @notice Set pricing strategy contract
      @param _pricingStrategy Address of crowdsale
    */
    function setPricingStrategy(address _pricingStrategy) onlyOwner external {
        pricingStrategy = IPricingStrategy(_pricingStrategy);
        require(pricingStrategy.isPricingStrategy());
        PricingStrategyWasSet(_pricingStrategy);
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
        TokensAllocated(_receiver, _customerUuid, _weiAmount);
    }

    /**
      @notice Update token price in wei. Calling the method of pricing strategy
      @param _oneTokenInWei New price
     */
    function setTokenPriceInWei(uint256 _oneTokenInWei) onlyAllowedAddresses whenNotPaused external {
        pricingStrategy.setTokenPriceInWei(_oneTokenInWei);
        TokenPriceInWeiUpdated(msg.sender, _oneTokenInWei);
    }
}