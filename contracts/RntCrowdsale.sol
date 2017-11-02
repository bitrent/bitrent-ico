pragma solidity ^0.4.15;


import "./PricingStrategy.sol";
import "./PresaleFinalizeAgent.sol";
import "./RntPresaleEthereumDeposit.sol";
import "../library/interface/IRntToken.sol";
import "../library/lifecycle/Pausable.sol";
import "../library/math/SafeMath.sol";


contract RntCrowdsale is Pausable {
    using SafeMath for uint256;

    enum Status {Unknown, Presale, ICO, Finalized} // Crowdsale status

    Status public currentStatus = Status.Unknown;

    bool public isPresaleStarted = false;

    bool public isPresaleFinalized = false;

    bool public isIcoStarted = false;

    bool public isIcoFinalized = false;

    uint256 public icoReceivedWei;

    uint256 public icoTokensSold;

    uint256 public icoInvestmentsCount = 0;

    mapping (address => uint256) public icoInvestments;

    mapping (address => uint256) public icoTokenTransfers;

    IRntToken public token;

    PricingStrategy public pricingStrategy;

    PresaleFinalizeAgent public presaleFinalizeAgent;

    RntPresaleEthereumDeposit public deposit;

    address public wallet;

    address public proxy;

    mapping (address => bool) public tokensAllocationAllowed;

    uint public presaleStartTime;

    uint public presaleEndTime;

    uint public icoStartTime;

    uint public icoEndTime;

    // A new investment was made
    event Invested(address indexed investor, uint weiAmount, uint tokenAmount, bytes16 indexed customerId);

    event PresaleStarted(uint timestamp);

    event PresaleFinalized(uint timestamp);

    event IcoStarted(uint timestamp);

    event IcoFinalized(uint timestamp);

    event TokensPerWeiReceived(uint tokenPrice);

    event PresaleTokensClaimed(uint count);

    function RntCrowdsale(address _tokenAddress) {
        token = IRntToken(_tokenAddress);
    }

    /* Modified allowing execution only if the crowdsale is currently running.  */
    modifier inStatus(Status status) {
        require(getCrowdsaleStatus() == status);
        _;
    }

    modifier canAllocateTokens {
        require(tokensAllocationAllowed[msg.sender] == true);
        _;
    }

    function allowAllocation(address _addr, bool _allow) onlyOwner external {
        tokensAllocationAllowed[_addr] = _allow;
    }

    function setPresaleFinalizeAgent(address _agentAddress) whenNotPaused onlyOwner external {
        presaleFinalizeAgent = PresaleFinalizeAgent(_agentAddress);
    }

    function setPricingStartegy(address _pricingStrategyAddress) whenNotPaused onlyOwner external {
        pricingStrategy = PricingStrategy(_pricingStrategyAddress);
    }

    function setMultiSigWallet(address _walletAddress) whenNotPaused onlyOwner external {
        wallet = _walletAddress;
    }

    function setBackendProxyBuyer(address _proxyAddress) whenNotPaused onlyOwner external {
        proxy = _proxyAddress;
    }

    function setPresaleEthereumDeposit(address _depositAddress) whenNotPaused onlyOwner external {
        deposit = RntPresaleEthereumDeposit(_depositAddress);
    }

    function getCrowdsaleStatus() constant public returns (Status) {
        return currentStatus;
    }

    function startPresale() whenNotPaused onlyOwner external {
        require(!isPresaleStarted);

        currentStatus = Status.Presale;
        isPresaleStarted = true;

        presaleStartTime = now;
        PresaleStarted(presaleStartTime);
    }

    function finalizePresale() whenNotPaused onlyOwner external {
        require(isPresaleStarted && !isPresaleFinalized);
        require(presaleFinalizeAgent.isSane());

        uint256 presaleSupply = token.totalSupply();

        // Presale supply is 20% of total
        presaleSupply = presaleSupply.div(5);

        presaleFinalizeAgent.finalizePresale(presaleSupply);
        uint tokenWei = presaleFinalizeAgent.weiPerToken();
        pricingStrategy.setTokenPriceInWei(tokenWei);
        TokensPerWeiReceived(tokenWei);

        require(tokenWei > 0);

        currentStatus = Status.Unknown;
        isPresaleFinalized = true;

        presaleEndTime = now;
        PresaleFinalized(presaleEndTime);
    }

    function startIco() whenNotPaused onlyOwner external {
        require(!isIcoStarted && isPresaleFinalized);

        currentStatus = Status.ICO;
        isIcoStarted = true;

        icoStartTime = now;
        IcoStarted(icoStartTime);
    }

    function finalizeIco() whenNotPaused onlyOwner external {
        require(!isIcoFinalized && isIcoStarted);

        currentStatus = Status.Finalized;
        isIcoFinalized = true;

        icoEndTime = now;
        IcoFinalized(icoEndTime);
    }


    /**
    * Make an investment.
    *
    * Crowdsale must be running for one to invest.
    * We must have not pressed the emergency brake.
    *
    * @param receiver The Ethereum address who receives the tokens
    * @param customerId (optional) UUID v4 to track the successful payments on the server side
    *
    */
    function investInternal(address receiver, bytes16 customerId, uint256 _weiAmount) private {
        uint weiAmount = 0;
        bool isAllocation = false;
        if (_weiAmount != 0) {
            weiAmount = _weiAmount;
            isAllocation = true;
        } else {
            weiAmount = msg.value;
        }

        uint256 tokenAmount = pricingStrategy.calculatePrice(weiAmount, 18);

        require(tokenAmount != 0);

        if (icoInvestments[receiver] == 0) {
            // A new investor
            icoInvestmentsCount++;
        }
        icoInvestments[receiver] = icoInvestments[receiver].add(weiAmount);
        icoTokenTransfers[receiver] = icoTokenTransfers[receiver].add(tokenAmount);
        icoReceivedWei = icoReceivedWei.add(weiAmount);
        icoTokensSold = icoTokensSold.add(tokenAmount);

        assignTokens(owner, receiver, tokenAmount);

        if (!isAllocation) {
            // Pocket the money
            wallet.transfer(weiAmount);
        }

        // Tell us invest was success
        Invested(receiver, weiAmount, tokenAmount, customerId);
    }

    function allocateTokens(address _receiver, bytes16 _customerUuid, uint256 _weiAmount) whenNotPaused canAllocateTokens public {
        investInternal(_receiver, _customerUuid, _weiAmount);
    }

    function invest(bytes16 _customerUuid) whenNotPaused inStatus(Status.ICO) public payable {
        investInternal(msg.sender, _customerUuid, 0);
    }

    function claimPresaleTokens() whenNotPaused external {
        require(isPresaleFinalized == true);

        uint256 senderEther = deposit.receivedEtherFrom(msg.sender);
        uint256 multiplier = 10 ** 18;
        senderEther = senderEther.mul(multiplier);
        uint256 tokenWei = pricingStrategy.oneTokenInWei();
        uint256 tokensAmount = senderEther.div(tokenWei);

        require(tokensAmount > 0);
        token.transferFrom(owner, msg.sender, tokensAmount);
        PresaleTokensClaimed(tokensAmount);
    }

    /**
    * Create new tokens or transfer issued tokens to the investor depending on the cap model.
    */
    function assignTokens(address _from, address _receiver, uint _tokenAmount) private {
        token.transferFrom(_from, _receiver, _tokenAmount);
    }
}
