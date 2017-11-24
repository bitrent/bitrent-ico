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

    /**
    @notice A new investment was made.
    */
    event Invested(address indexed investor, uint weiAmount, uint tokenAmount, bytes16 indexed customerId);

    event PresaleStarted(uint timestamp);

    event PresaleFinalized(uint timestamp);

    event IcoStarted(uint timestamp);

    event IcoFinalized(uint timestamp);

    /**
    @notice Token price was calculated.
    */
    event TokensPerWeiReceived(uint tokenPrice);

    /**
    @notice Presale tokens was claimed.
    */
    event PresaleTokensClaimed(uint count);

    function RntCrowdsale(address _tokenAddress) {
        token = IRntToken(_tokenAddress);
    }

    /**
    @notice Allow call function only if crowdsale on specified status.
    */
    modifier inStatus(Status status) {
        require(getCrowdsaleStatus() == status);
        _;
    }

    /**
    @notice Check that address can allocate tokens.
    */
    modifier canAllocateTokens {
        require(tokensAllocationAllowed[msg.sender] == true);
        _;
    }

    /**
    @notice Allow address to call allocate function.
    @param _addr Address for allowance
    @param _allow Allowance
    */
    function allowAllocation(address _addr, bool _allow) onlyOwner external {
        tokensAllocationAllowed[_addr] = _allow;
    }

    /**
    @notice Set PresaleFinalizeAgent address.
    @dev Used to calculate price for one token.
    */
    function setPresaleFinalizeAgent(address _agentAddress) whenNotPaused onlyOwner external {
        presaleFinalizeAgent = PresaleFinalizeAgent(_agentAddress);
    }

    /**
    @notice Set PricingStrategy address.
    @dev Used to calculate tokens that will be received through investment.
    */
    function setPricingStartegy(address _pricingStrategyAddress) whenNotPaused onlyOwner external {
        pricingStrategy = PricingStrategy(_pricingStrategyAddress);
    }

    /**
    @notice Set RNTMultiSigWallet address.
    @dev Wallet for invested wei.
    */
    function setMultiSigWallet(address _walletAddress) whenNotPaused onlyOwner external {
        wallet = _walletAddress;
    }


    /**
    @notice Set RntTokenProxy address.
    */
    function setBackendProxyBuyer(address _proxyAddress) whenNotPaused onlyOwner external {
        proxy = _proxyAddress;
    }

    /**
    @notice Set RntPresaleEhtereumDeposit address.
    @dev Deposit used to calculate presale tokens.
    */
    function setPresaleEthereumDeposit(address _depositAddress) whenNotPaused onlyOwner external {
        deposit = RntPresaleEthereumDeposit(_depositAddress);
    }

    /**
    @notice Get current crowdsale status.
    @return { One of possible crowdsale statuses [Unknown, Presale, ICO, Finalized] }
    */
    function getCrowdsaleStatus() constant public returns (Status) {
        return currentStatus;
    }

    /**
    @notice Start presale and track start time.
    */
    function startPresale() whenNotPaused onlyOwner external {
        require(!isPresaleStarted);

        currentStatus = Status.Presale;
        isPresaleStarted = true;

        presaleStartTime = now;
        PresaleStarted(presaleStartTime);
    }

    /**
    @notice Finalize presale, calculate token price, track finalize time.
    */
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

    /**
    @notice Start ICO and track start time.
    */
    function startIco() whenNotPaused onlyOwner external {
        require(!isIcoStarted && isPresaleFinalized);

        currentStatus = Status.ICO;
        isIcoStarted = true;

        icoStartTime = now;
        IcoStarted(icoStartTime);
    }

    /**
    @notice Finalize ICO and track finalize time.
    */
    function finalizeIco() whenNotPaused onlyOwner external {
        require(!isIcoFinalized && isIcoStarted);

        currentStatus = Status.Finalized;
        isIcoFinalized = true;

        icoEndTime = now;
        IcoFinalized(icoEndTime);
    }


    /**
    @notice Handle invested wei.
    @dev Send some amount of wei to wallet and get tokens that will be calculated according Pricing Strategy.
         It will transfer ether to wallet only if investment did inside ethereum using payable method.
    @param _receiver The Ethereum address who receives the tokens.
    @param _customerUuid (optional) UUID v4 to track the successful payments on the server side.
    @param _weiAmount Wei amount, that should be specified only if user was invested outside ethereum.
    */
    function investInternal(address _receiver, bytes16 _customerUuid, uint256 _weiAmount) private {
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

        if (icoInvestments[_receiver] == 0) {
            // A new investor
            icoInvestmentsCount++;
        }
        icoInvestments[_receiver] = icoInvestments[_receiver].add(weiAmount);
        icoTokenTransfers[_receiver] = icoTokenTransfers[_receiver].add(tokenAmount);
        icoReceivedWei = icoReceivedWei.add(weiAmount);
        icoTokensSold = icoTokensSold.add(tokenAmount);

        assignTokens(owner, _receiver, tokenAmount);

        if (!isAllocation) {
            // Pocket the money
            wallet.transfer(weiAmount);
        }

        // Tell us invest was success
        Invested(_receiver, weiAmount, tokenAmount, _customerUuid);
    }

    /**
    @notice Allocate tokens to specified address.
    @dev Function that should be used only by proxy to handle payments outside ethereum.
    @param _receiver The Ethereum address who receives the tokens.
    @param _customerUuid (optional) UUID v4 to track the successful payments on the server side.
    @param _weiAmount User invested amount of money in wei.
    */
    function allocateTokens(address _receiver, bytes16 _customerUuid, uint256 _weiAmount) whenNotPaused canAllocateTokens public {
        investInternal(_receiver, _customerUuid, _weiAmount);
    }

    /**
    @notice Make an investment.
    @dev Can be called only at ICO status. Should have wei != 0.
    @param _customerUuid (optional) UUID v4 to track the successful payments on the server side
    */
    function invest(bytes16 _customerUuid) whenNotPaused inStatus(Status.ICO) public payable {
        investInternal(msg.sender, _customerUuid, 0);
    }

    /**
    @notice Function for claiming tokens for presale investors.
    @dev Can be called only after presale ends. Tokens will be transfered to callers address.
    */
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
    @notice Transfer issued tokens to the investor.
    */
    function assignTokens(address _from, address _receiver, uint _tokenAmount) private {
        token.transferFrom(_from, _receiver, _tokenAmount);
    }
}
