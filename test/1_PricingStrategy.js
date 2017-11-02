const PricingStrategy = artifacts.require("PricingStrategy");

const deployPricingStrategy = () => {
    return PricingStrategy.new();
};

const getParamFromTxEvent = require('./helpers/getParamFromTxEvent');
const expectThrow = require('./helpers/expectThrow');
const ether = require('./helpers/ether');

contract('PricingStrategy', function (accounts) {

    const owner = accounts[0];

    it("RNT_PRICING_STRATEGY_1 - Check that tokens calculated right way", async function () {
        try {
            const instance = await deployPricingStrategy();

            instance.setTokenPriceInWei(web3.toBigNumber("10"));
            const value = await instance.calculatePrice.call(web3.toBigNumber("1000"), 2);
            
            // should be 100 tokens, but we have 2 decimals, it means that we expecting 10000
            assert.equal(value.valueOf(), web3.toBigNumber("10000").toString());
        } catch (err) {
            assert(false, err.message);
        }
    });

    
    it("Check that token price can be set", async function () {
        try {
            const instance = await deployPricingStrategy();

            instance.setTokenPriceInWei(web3.toBigNumber("10"));
            const value = await instance.oneTokenInWei.call();
           
            assert.equal(value.valueOf(), web3.toBigNumber("10").toString());
        } catch (err) {
            assert(false, err.message);
        }
    });

});