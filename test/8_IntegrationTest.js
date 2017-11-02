const getParamFromTxEvent = require('./helpers/getParamFromTxEvent');
const expectThrow = require('./helpers/expectThrow');
const ether = require('./helpers/ether');
const uuidParser = require('./helpers/uuidParser');


const INITIAL_SUPPLY = web3.toBigNumber("1000000000000000000000000000");


const RntToken = artifacts.require("RntToken");
const FinalizeAgent = artifacts.require("PresaleFinalizeAgent");
const RntDeposit = artifacts.require("RntPresaleEthereumDeposit");
const RntTokenProxy = artifacts.require("RntTokenProxy");
const RntTokenVault = artifacts.require("RntTokenVault");
const RntCrowdsale = artifacts.require("RntCrowdsale");
const RNTMultiSigWallet = artifacts.require("RNTMultiSigWallet");
const PricingStrategy = artifacts.require("PricingStrategy");

const deployMultisig = (owners, confirmations) => {
    return RNTMultiSigWallet.new(owners, confirmations)
};

const deployDeposit = (walletAddr) => {
    return RntDeposit.new(walletAddr);
};

const deployToken = () => {
    return RntToken.new();
};

const deployProxy = (tokenAddress, vaultAddress, defaultAllowed, crowdsaleAddress) => {
    return RntTokenProxy.new(tokenAddress, vaultAddress, defaultAllowed, crowdsaleAddress);
};

const deployPricingStrategy = () => {
    return PricingStrategy.new();
};

const deployCrowdsale = (tokenAddress) => {
    return RntCrowdsale.new(tokenAddress);
};

const deployFinalizeAgent = (depositAddress) => {
    return FinalizeAgent.new(depositAddress);
};

const deployVault = (tokenAddress) => {
    return RntTokenVault.new(tokenAddress);
};

contract('Integration Test', function (accounts) {
    
        const owner = accounts[0];
        const acc1 = accounts[1];
        const acc2 = accounts[2];
    
        const whitelist = [owner, acc1, acc2];
        const multisigOwners = [owner, acc1]; 

        const ownerAddress = owner;
        const companyAddress = accounts[8];
        const teamAddress = accounts[9];
        
        const icoTokens = web3.toBigNumber("699000000000000000000000000");
        const companyTokens = web3.toBigNumber("100000000000000000000000000");
        const presaleTokens = web3.toBigNumber("200000000000000000000000000");
        const bountyTokens = web3.toBigNumber("5000000000000000000000000");
        const teamTokens = web3.toBigNumber("5000000000000000000000000");

        let token;
        let proxy;
        let crowdsale;
        let vault;
        let multisig;
        let agent;
        let pricing;
        let deposit;
        beforeEach(async () => {
            multisig = await deployMultisig(multisigOwners, web3.toBigNumber("2"));
            pricing = await deployPricingStrategy();
            token = await deployToken();
            crowdsale = await deployCrowdsale(token.address);
            vault = await deployVault(token.address);
            proxy = await deployProxy(token.address, vault.address, teamAddress, crowdsale.address); 
            deposit = await deployDeposit(multisig.address);
            agent = await deployFinalizeAgent(deposit.address);

            assert.ok(multisig);
            assert.ok(pricing);
            assert.ok(token);
            assert.ok(crowdsale);
            assert.ok(vault);
            assert.ok(proxy);
            assert.ok(deposit);
            assert.ok(agent);

            await crowdsale.setPresaleFinalizeAgent(agent.address);     
            await crowdsale.setPricingStartegy(pricing.address);
            await crowdsale.setMultiSigWallet(multisig.address);
            await crowdsale.setBackendProxyBuyer(proxy.address);
            await crowdsale.setPresaleEthereumDeposit(deposit.address);
        });
      

        it("1 - Check that tokens can be approved", async function () {
            try {
                await token.approve(crowdsale.address, icoTokens);
                await token.approve(proxy.address, presaleTokens);
                await token.approve(companyAddress, companyTokens);
                await token.approve(teamAddress, teamTokens);
            } catch (err) {
                assert(false, err.message);
            }
        });

        it("2 - Check that transfer agnets can be set", async function () {
            try {
                await token.setTransferAgent(owner, true);
                await token.setTransferAgent(crowdsale.address, true);
                await token.setTransferAgent(proxy.address, true);
                await token.setTransferAgent(companyAddress, true);
                await token.setTransferAgent(teamAddress, true);
            } catch (err) {
                assert(false, err.message);
            }
        });

        it("3 - Сheck that that proxy can be added to vault allowed addresses", async function () {
            try {
                await vault.allowAddress(proxy.address, true);
            } catch (err) {
                assert(false, err.message);
            }
        });

        const uuid1 = uuidParser.parse("581275c6-35c0-4704-aa25-4dec99d6da04");

        it("4 - Сheck that that crowdsale allocate working", async function () {
            try {
                await pricing.setTokenPriceInWei(web3.toBigNumber("1000000000"));
                await crowdsale.allowAllocation(proxy.address, true);
                await crowdsale.allowAllocation(owner, true);
                await token.approve(crowdsale.address, icoTokens, { from: owner });
                await token.setTransferAgent(owner, true, { from: owner }); 
                await proxy.allocate(accounts[6], uuid1, web3.toBigNumber("200000000000000"), {from: owner});
            } catch (err) {
                assert(false, err.message);
            }
        });


});