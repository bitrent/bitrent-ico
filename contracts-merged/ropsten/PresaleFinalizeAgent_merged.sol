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

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
  function mul(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal constant returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal constant returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

contract IRntPresaleEthereumDeposit {
    uint256 public overallTakenEther;

    mapping (address => uint256) public receivedEther;

    function getDonatorsNumber() external constant returns (uint256);

    function getDonator(uint pos) external constant returns (address, uint256);

    function receivedEtherFrom(address _from) constant public returns (uint256);

    function myEther() constant public returns (uint256);
}

contract IFinalizeAgent {
    IRntPresaleEthereumDeposit public deposit;

    address public crowdsaleAddress;

    mapping(address => uint256) public tokensForAddress;

    uint256 public weiPerToken = 0;

    bool public sane = true;

    function finalizePresale(uint256 presaleTokens) public;

    function isSane() public constant returns (bool);

    function isFinalizeAgent() public constant returns (bool);
}

contract PresaleFinalizeAgent is IFinalizeAgent, HasNoEther {
    using SafeMath for uint256;

// todo CrowdSale. Will be deployed before
// Deposit - https://ropsten.etherscan.io/address/0xbf0746443ad3610005af5a5faf80ace89ee7cd94
    function PresaleFinalizeAgent(){
        deposit = IRntPresaleEthereumDeposit(address(0xbf0746443ad3610005af5a5faf80ace89ee7cd94));
        crowdsaleAddress = address("PUT NEW CROWDSALE ADDRESS HERE");
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