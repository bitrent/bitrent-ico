pragma solidity ^0.4.15;

import '../library/token/StandardToken.sol';
import '../library/ownership/Ownable.sol';
import '../library/ownership/HasNoEther.sol';
import '../library/lifecycle/Pausable.sol';

contract RntToken is StandardToken, Ownable, Pausable, HasNoEther {
    string public name = "RNT Token";
    string public code = "RNT";
    uint8 public decimals = 2;
    uint256 public totalSupply = 1000000000;

    /* The finalizer contract that allows unlift the transfer limits on this token */
    address public releaseAgent;

    /** A crowdsale contract can release us to the wild if ICO success. If false we are are in transfer lock up period.*/
    bool public released = false;

    /** Map of agents that are allowed to transfer tokens regardless of the lock down period.
    These are crowdsale contracts and possible the team multisig itself. */
    mapping (address => bool) public transferAgents;

    function RntToken() {
        balances[msg.sender] = totalSupply;
    }

    /**
     * Limit token transfer until the crowdsale is over.
     *
     */
    modifier canTransfer(address _sender) {
        require(released || transferAgents[_sender]);
        _;
    }

    /** The function can be called only before or after the tokens have been releasesd */
    modifier inReleaseState(bool releaseState) {
        require(releaseState == released);
        _;
    }

    /** The function can be called only by a whitelisted release agent. */
    modifier onlyReleaseAgent() {
        require(msg.sender == releaseAgent);
        _;
    }

    /**
     * Set the contract that can call release and make the token transferable.
     *
     * Design choice. Allow reset the release agent to fix fat finger mistakes.
     */
    function setReleaseAgent(address addr) onlyOwner inReleaseState(false) public {

        // We don't do interface check here as we might want to a normal wallet address to act as a release agent
        releaseAgent = addr;
    }

    /**
     * Owner can allow a particular address (a crowdsale contract) to transfer tokens despite the lock up period.
     */
    function setTransferAgent(address addr, bool state) onlyOwner inReleaseState(false) public {
        transferAgents[addr] = state;
    }

    /**
     * One way function to release the tokens to the wild.
     *
     * Can be called only from the release agent that is the final ICO contract. It is only called if the crowdsale has been success (first milestone reached).
     */
    function releaseTokenTransfer() public onlyReleaseAgent {
        released = true;
    }

    function transfer(address _to, uint _value) public canTransfer(msg.sender) whenNotPaused returns (bool success) {
        // Call StandardToken.transfer()
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint _value) public canTransfer(_from) whenNotPaused returns (bool success) {
        // Call StandardToken.transferForm()
        return super.transferFrom(_from, _to, _value);
    }

    function balanceOf(address _owner) public constant returns (uint256) {
        return super.balanceOf(_owner);
    }
}
