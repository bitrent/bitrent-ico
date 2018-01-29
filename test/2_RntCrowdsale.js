const getParamFromTxEvent = require('./helpers/getParamFromTxEvent');
const expectThrow = require('./helpers/expectThrow');
const ether = require('./helpers/ether');
const uuidParser = require('./helpers/uuidParser.js');


const INITIAL_SUPPLY = web3.toBigNumber("1e27");

const Deposit = artifacts.require("RntPresaleEthereumDeposit");
const RNTMultiSigWallet = artifacts.require('RNTMultiSigWallet');
const RNTBToken = artifacts.require("RNTBToken");
const RntTokenVault = artifacts.require("TestRntTokenVault");
const RntTokenProxy = artifacts.require("RntTokenProxy");
const PricingStrategy = artifacts.require("PricingStrategy");
const RntCrowdsale = artifacts.require("RntCrowdsale");
const PresaleFinalizeAgent = artifacts.require("PresaleFinalizeAgent");

const deployMultisig = (owners, confirmations) => {
    return RNTMultiSigWallet.new(owners, confirmations)
};

const deployDeposit = (walletAddr) => {
    return Deposit.new(walletAddr);
};

const deployToken = () => {
    return RNTBToken.new();
};

const deployProxy = (tokenAddress, vaultAddress, defaultAllowed) => {
    return RntTokenProxy.new(tokenAddress, vaultAddress, defaultAllowed);
};

const deployPricingStrategy = () => {
    return PricingStrategy.new();
};

const deployCrowdsale = (tokenAddress) => {
    return RntCrowdsale.new(tokenAddress);
};

const deployFinalizeAgent = (depositAddress, crowdsaleAddress) => {
    return PresaleFinalizeAgent.new(depositAddress, crowdsaleAddress);
};

const deployVault = (tokenAddress) => {
    return RntTokenVault.new(tokenAddress);
};

let STATUS = {
    UNKNOWN : {value: 0, name: "Unknown"}, 
    PRESALE: {value: 1, name: "Presale"}, 
    ICO : {value: 2, name: "ICO"},
    FINALIZED : {value: 3, name: "Finalized"}
};

contract('RntCrowdsale', function (accounts) {

    const owner = accounts[0];
    const acc1 = accounts[1];
    const acc2 = accounts[2];

    const whitelist = [owner, acc1, acc2];
    const multisigOwners = [owner, acc1]; 

    const uuid = uuidParser.parse("76061c06-8e01-41ac-bac1-547a41d9c1f3");


    it("1 - Check that crowdsale initialized", async function () {
        try {
            const token = await deployToken();
            const crowdsale = await deployCrowdsale(token.address);
            assert.ok(crowdsale);
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("2 - Check that presale finalize agnet can be set", async function () {
        try {
            const multisig = await deployMultisig(multisigOwners, 2);
            const deposit = await deployDeposit(multisig.address);
            const token = await deployToken();
            const crowdsale = await deployCrowdsale(token.address);

            const agent = await deployFinalizeAgent(deposit.address, crowdsale.address);
            await crowdsale.setPresaleFinalizeAgent(agent.address, { from: owner });
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("3 - Check that pricing startegy can be set", async function () {
        try {
            const token = await deployToken();
            const crowdsale = await deployCrowdsale(token.address);

            const pricing = await deployPricingStrategy();
            await crowdsale.setPricingStrategy(pricing.address, { from: owner });
        } catch (err) {
            assert(false, err.message);
        }
    });

    
    it("4 - Check that multisig wallet can be set", async function () {
        try {
            const token = await deployToken();
            const crowdsale = await deployCrowdsale(token.address);

            const multisig = await deployMultisig(multisigOwners, 2);
            await crowdsale.setMultiSigWallet(multisig.address, { from: owner });
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("5 - Check that proxy can be set", async function () {
        try {
            const token = await deployToken();
            const crowdsale = await deployCrowdsale(token.address);

            const vault = await deployVault(token.address);
            const proxy = await deployProxy(token.address, vault.address, "0x0");
            await crowdsale.setBackendProxyBuyer(proxy.address, { from: owner });
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("6 - Check crowdsale status flow", async function () {
        try {
            const multisig = await deployMultisig(multisigOwners, 2);
            const deposit = await deployDeposit(multisig.address);
            const token = await deployToken();
            const crowdsale = await deployCrowdsale(token.address);
            const agent = await deployFinalizeAgent(deposit.address, crowdsale.address);
         
            
            let status = await crowdsale.getCrowdsaleStatus.call({from: owner});
            assert.equal(STATUS.UNKNOWN.value, status.c[0]);

            await crowdsale.startPresale({from: owner});
            status = await crowdsale.getCrowdsaleStatus.call({from: owner});
            assert.equal(STATUS.PRESALE.value, status.c[0]);

            await crowdsale.setPresaleFinalizeAgent(agent.address, { from: owner });
            await deposit.sendTransaction({ from: owner, value: web3.toBigNumber("1000000000000000000") });

            const pricing = await deployPricingStrategy();
            await crowdsale.setPricingStrategy(pricing.address, { from: owner });
            await pricing.allowAddress(crowdsale.address, true);

            await crowdsale.finalizePresale({from: owner});
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("7 - Check that crowdsale can not finalize presale before presale started", async function () {
        try {
            const multisig = await deployMultisig(multisigOwners, 2);
            const deposit = await deployDeposit(multisig.address);
            const token = await deployToken();
            const crowdsale = await deployCrowdsale(token.address);
            const agent = await deployFinalizeAgent(deposit.address, crowdsale.address);
            const pricing = await deployPricingStrategy();

            await pricing.allowAddress(crowdsale.address, true);

            await crowdsale.setPricingStrategy(pricing.address, { from: owner });

            await crowdsale.setPresaleFinalizeAgent(agent.address, { from: owner });
            await deposit.sendTransaction({ from: owner, value: web3.toBigNumber("1000000000000000000") });
            expectThrow(
                crowdsale.finalizePresale({from: owner})
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("8 - Check that crowdsale can not start ICO before presale started", async function () {
        try {
            const token = await deployToken();
            const crowdsale = await deployCrowdsale(token.address);

            expectThrow(
                crowdsale.startIco({from: owner})
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("9 - Check that crowdsale can not be finalized before ICO started", async function () {
        try {
            const token = await deployToken();
            const crowdsale = await deployCrowdsale(token.address);

            expectThrow(
                crowdsale.finalizeIco({from: owner})
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("10 - Check that invest throws exception when crowdsale status not ICO", async function () {
        try {
            const token = await deployToken();
            const crowdsale = await deployCrowdsale(token.address);

            await token.approve(crowdsale.address, web3.toBigNumber("1000000000000000000"), { from: owner });

            expectThrow(
                crowdsale.invest(uuid, {from: acc1, value: web3.toBigNumber("1000000000")})
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("11 - Check that invest works", async function () {
        try {
            const multisig = await deployMultisig(multisigOwners, 2);
            const deposit = await deployDeposit(multisig.address);
            const token = await deployToken();
            const crowdsale = await deployCrowdsale(token.address);
            const agent = await deployFinalizeAgent(deposit.address, crowdsale.address);
            const pricing = await deployPricingStrategy();

            await pricing.allowAddress(crowdsale.address, true);

            let status = await crowdsale.getCrowdsaleStatus.call({from: owner});
            assert.equal(STATUS.UNKNOWN.value, status.c[0]);

            await crowdsale.startPresale({from: owner});
            status = await crowdsale.getCrowdsaleStatus.call({from: owner});
            assert.equal(STATUS.PRESALE.value, status.c[0]);

            await crowdsale.setPresaleFinalizeAgent(agent.address, { from: owner });
            await deposit.sendTransaction({ from: owner, value: web3.toBigNumber("1000000000000000000") });

            await crowdsale.setPricingStrategy(pricing.address, { from: owner });

            await crowdsale.finalizePresale({from: owner});
            status = await crowdsale.getCrowdsaleStatus.call({from: owner});
            assert.equal(STATUS.UNKNOWN.value, status.c[0]);

            await crowdsale.startIco({from: owner});
            status = await crowdsale.getCrowdsaleStatus.call({from: owner});
            assert.equal(STATUS.ICO.value, status.c[0]);

            await crowdsale.setMultiSigWallet(multisig.address, { from: owner });
            await token.approve(crowdsale.address, INITIAL_SUPPLY, { from: owner });

            await crowdsale.invest(uuid, {from: acc1, value: web3.toBigNumber("1000000000000000000")});
            const acc1Tokens = await token.balanceOf(acc1);

            assert.equal(acc1Tokens.valueOf(), web3.toBigNumber("200000000000000000000000000").toString());
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("12 - Check that allocate can be called only by allowed addresses", async function () {
        try {
            const multisig = await deployMultisig(multisigOwners, 2);
            const deposit = await deployDeposit(multisig.address);
            const token = await deployToken();
            const crowdsale = await deployCrowdsale(token.address);
            const agent = await deployFinalizeAgent(deposit.address, crowdsale.address);
            const pricing = await deployPricingStrategy();

            await pricing.allowAddress(crowdsale.address, true);

            let status = await crowdsale.getCrowdsaleStatus.call({from: owner});
            assert.equal(STATUS.UNKNOWN.value, status.c[0]);

            await crowdsale.startPresale({from: owner});
            status = await crowdsale.getCrowdsaleStatus.call({from: owner});
            assert.equal(STATUS.PRESALE.value, status.c[0]);

            await crowdsale.setPresaleFinalizeAgent(agent.address, { from: owner });
            await deposit.sendTransaction({ from: owner, value: web3.toBigNumber("1000000000000000000") });

            await crowdsale.setPricingStrategy(pricing.address, { from: owner });

            await crowdsale.finalizePresale({from: owner});
            status = await crowdsale.getCrowdsaleStatus.call({from: owner});
            assert.equal(STATUS.UNKNOWN.value, status.c[0]);

            await crowdsale.startIco({from: owner});
            status = await crowdsale.getCrowdsaleStatus.call({from: owner});
            assert.equal(STATUS.ICO.value, status.c[0]);

            await crowdsale.setMultiSigWallet(multisig.address, { from: owner });
            await token.approve(crowdsale.address, INITIAL_SUPPLY, { from: owner });

            expectThrow(
                crowdsale.allocateTokens(acc1, uuid, web3.toBigNumber("1000000000000"), { from: acc1 })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    
    it("13 - Check that allocate works", async function () {
        try {
            const multisig = await deployMultisig(multisigOwners, 2);
            const deposit = await deployDeposit(multisig.address);
            const token = await deployToken();
            const crowdsale = await deployCrowdsale(token.address);
            const agent = await deployFinalizeAgent(deposit.address, crowdsale.address);
            const pricing = await deployPricingStrategy();

            await pricing.allowAddress(crowdsale.address, true);

            let status = await crowdsale.getCrowdsaleStatus.call({ from: owner });
            assert.equal(STATUS.UNKNOWN.value, status.c[0]);

            await crowdsale.startPresale({ from: owner });
            status = await crowdsale.getCrowdsaleStatus.call({ from: owner });
            assert.equal(STATUS.PRESALE.value, status.c[0]);

            await crowdsale.setPresaleFinalizeAgent(agent.address, { from: owner });
            await deposit.sendTransaction({ from: owner, value: web3.toBigNumber("1000000000000000000") });

            await crowdsale.setPricingStrategy(pricing.address, { from: owner });

            await crowdsale.finalizePresale({ from: owner });
            status = await crowdsale.getCrowdsaleStatus.call({ from: owner });
            assert.equal(STATUS.UNKNOWN.value, status.c[0]);

            await crowdsale.startIco({ from: owner });
            status = await crowdsale.getCrowdsaleStatus.call({ from: owner });
            assert.equal(STATUS.ICO.value, status.c[0]);

            await crowdsale.setMultiSigWallet(multisig.address, { from: owner });
            await token.approve(crowdsale.address, INITIAL_SUPPLY, { from: owner });

            const vault = await deployVault(token.address);
            const proxy = await deployProxy(token.address, vault.address, "0x0");
            await crowdsale.setBackendProxyBuyer(proxy.address, { from: owner });


            await crowdsale.allowAllocation(acc1, true, { from: owner });
            await crowdsale.allocateTokens(acc1, uuid, web3.toBigNumber("1000000000000000000"), { from: acc1 })
            const acc1Tokens = await token.balanceOf(acc1);
            
            // token price = 1000
            // ether that we ivest = 100000
            // we should get 100 tokens that will 10000 because we have 2 decimals
            assert.equal(acc1Tokens.valueOf(), web3.toBigNumber("200000000000000000000000000").toString());
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("14 - Check that presale and ico token price is same", async function () {
        try {
            const multisig = await deployMultisig(multisigOwners, 2);
            const deposit = await deployDeposit(multisig.address);
            const token = await deployToken();
            const crowdsale = await deployCrowdsale(token.address);
            const agent = await deployFinalizeAgent(deposit.address, crowdsale.address);
            const pricing = await deployPricingStrategy();

            await pricing.allowAddress(crowdsale.address, true);

            let status = await crowdsale.getCrowdsaleStatus.call({ from: owner });
            assert.equal(STATUS.UNKNOWN.value, status.c[0]);

            await crowdsale.startPresale({ from: owner });
            status = await crowdsale.getCrowdsaleStatus.call({ from: owner });
            assert.equal(STATUS.PRESALE.value, status.c[0]);

            await crowdsale.setPresaleFinalizeAgent(agent.address, { from: owner });
            await deposit.sendTransaction({ from: acc1, value: web3.toBigNumber("1000000000000000000") });
            await deposit.sendTransaction({ from: acc2, value: web3.toBigNumber("1000000000000000000") });

            await crowdsale.setPricingStrategy(pricing.address, { from: owner });

            await crowdsale.finalizePresale({ from: owner });
            status = await crowdsale.getCrowdsaleStatus.call({ from: owner });
            assert.equal(STATUS.UNKNOWN.value, status.c[0]);

            await crowdsale.setPresaleEthereumDeposit(deposit.address);
            await token.approve(crowdsale.address, INITIAL_SUPPLY, { from: owner });

            const beforeIcoPrice = await pricing.calculatePrice(100000, 18, { from: owner });

            await crowdsale.startIco({ from: owner });
            status = await crowdsale.getCrowdsaleStatus.call({ from: owner });
            assert.equal(STATUS.ICO.value, status.c[0]);

            await crowdsale.setMultiSigWallet(multisig.address, { from: owner });
            const vault = await deployVault(token.address);

            const icoPrice = await pricing.calculatePrice(100000, 18, { from: owner });

            assert.equal(beforeIcoPrice.valueOf(), icoPrice.valueOf()); 
        } catch (err) {
            assert(false, err.message);
        }
    });
});


