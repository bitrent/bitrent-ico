const RntTokenProxy = artifacts.require("RntTokenProxy");
const RNTBToken = artifacts.require("RNTBToken");
const RntCrowdsale = artifacts.require("RntCrowdsale");
const RntPricingStrategy = artifacts.require('PricingStrategy');

const INITIAL_SUPPLY = web3.toBigNumber("1000000000000000000000000000");

const deployProxy = () => {
    return RntTokenProxy.new();
};

const deployCrowdsale = (tokenAddress) => {
    return RntCrowdsale.new(tokenAddress);
};

const deployToken = () => {
    return RNTBToken.new();
};

const deployPricingStrategy = () => {
    return RntPricingStrategy.new();
};

const expectThrow = require('./helpers/expectThrow');
const ether = require('./helpers/ether');
const uuidParser = require('./helpers/uuidParser');

contract('RntTokenProxy', function (accounts) {
    let proxyInstance;
    let pricingStrategyInstance;
    let crowdSaleInstance;
    let tokenInstance;

    const token = web3.toBigNumber('1e18');
    const uuid = uuidParser.parse("76061c06-8e01-41ac-bac1-547a41d9c1f3");
    const whitelistedAddress = accounts[1];
    const tokensReceiver = accounts[2];

    beforeEach(async () => {
        pricingStrategyInstance = await deployPricingStrategy();
        tokenInstance = await deployToken();
        crowdSaleInstance = await deployCrowdsale(tokenInstance.address);

        proxyInstance = await deployProxy();
        await proxyInstance.setPricingStrategy(pricingStrategyInstance.address);
        await proxyInstance.setCrowdSale(crowdSaleInstance.address);

        await crowdSaleInstance.setPricingStrategy(pricingStrategyInstance.address);
        await crowdSaleInstance.allowAllocation(proxyInstance.address, true);

        await tokenInstance.approve(crowdSaleInstance.address, web3.toBigNumber('6.9e26'));
        await tokenInstance.approve(proxyInstance.address, web3.toBigNumber('6.9e26'));

        await pricingStrategyInstance.setTokenPriceInWei(ether(1));

        await pricingStrategyInstance.allowAddress(proxyInstance.address, true);

        assert.ok(proxyInstance);
    });

    it('Can allocate tokens', async function () {
        try {
            const initialTokenBalance = await tokenInstance.balanceOf(tokensReceiver);

            await proxyInstance.allowAddress(whitelistedAddress, true);

            await proxyInstance.allocate(tokensReceiver, uuid, ether(1), {from: whitelistedAddress});

            assert.equal(
                (await tokenInstance.balanceOf(tokensReceiver)).toString(),
                initialTokenBalance.add(token).toString()
            )
        } catch(err) {
            assert(false, err.message);
        }
    });

    it('Can\'t allocate tokens from non-whitelisted address', async function () {
        try {
            expectThrow(
                proxyInstance.allocate(tokensReceiver, uuid, ether(1), {from: whitelistedAddress})
            )
        } catch(err) {
            assert(false, err.message);
        }
    });

    it('Can set token price in wei', async function () {
        try {
            await proxyInstance.allowAddress(whitelistedAddress, true);
            await proxyInstance.setTokenPriceInWei(ether(2), {from: whitelistedAddress});

            assert.equal(
                (await pricingStrategyInstance.oneTokenInWei()).toString(),
                ether(2).toString()
            );
        } catch(err) {
            assert(false, err.message);
        }
    });

    it('Can\'t set token price in wei from non-whitelisted address', async function () {
        try {
            expectThrow(
                proxyInstance.setTokenPriceInWei(ether(2), {from: whitelistedAddress})
            )
        } catch(err) {
            assert(false, err.message);
        }
    });

    it('Can set pricing strategy only from owner account', async function () {
        try {
            await proxyInstance.setPricingStrategy(pricingStrategyInstance.address);

            expectThrow(
                proxyInstance.setPricingStrategy(pricingStrategyInstance.address, {from: whitelistedAddress})
            )
        } catch(err) {
            assert(false, err.message);
        }
    });

    it('Can set CrowdSale only from owner account', async function () {
        try {
            await proxyInstance.setCrowdSale(crowdSaleInstance.address);

            expectThrow(
                proxyInstance.setCrowdSale(crowdSaleInstance.address, {from: whitelistedAddress})
            )
        } catch(err) {
            assert(false, err.message);
        }
    });

    it('Can add and remove address to whitelist only from the owner account', async function () {
        try {
            await proxyInstance.allowAddress(whitelistedAddress, true);

            expectThrow(
                proxyInstance.allowAddress(whitelistedAddress, true, {from: whitelistedAddress})
        )
        } catch(err) {
            assert(false, err.message);
        }
    })
});