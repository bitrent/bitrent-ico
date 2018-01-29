const PricingStrategy = artifacts.require("PricingStrategy");

const deployPricingStrategy = (crowdsaleAddr) => {
    return PricingStrategy.new(crowdsaleAddr);
};

const expectThrow = require('./helpers/expectThrow');

contract('PricingStrategy', function (accounts) {

    const owner = accounts[0];

    it("RNT_PRICING_STRATEGY_1 - Check that tokens calculated right way", async function () {
        try {
            let instance = await deployPricingStrategy();

            await instance.setTokenPriceInWei(web3.toBigNumber("1e18"));
            const value = await instance.calculatePrice.call(web3.toBigNumber("1e18"), 18);
            
            assert.equal(value.toString(), web3.toBigNumber("1e18").toString());
        } catch (err) {
            assert(false, err.message);
        }
    });

    
    it("Check that token price can be set", async function () {
        try {
            const accountAllowedToSetPricingStrategy = accounts[1];

            let instance = await deployPricingStrategy();

            await instance.allowAddress(accountAllowedToSetPricingStrategy, true);

            await instance.setTokenPriceInWei(web3.toBigNumber("1e18"), {from: accountAllowedToSetPricingStrategy});
            const value = await instance.oneTokenInWei();
           
            assert.equal(value.toString(), web3.toBigNumber("1e18").toString());
        } catch (err) {
            assert(false, err.message);
        }
    });

    it('Check that token price could not be set if address was removed from the whitelist', async function () {
       try {
           const accountAllowedToSetPricingStrategy = accounts[1];

           let instance = await deployPricingStrategy();

           await instance.allowAddress(accountAllowedToSetPricingStrategy, true);

           await instance.setTokenPriceInWei(web3.toBigNumber("1e18"), {from: accountAllowedToSetPricingStrategy});
           const value = await instance.oneTokenInWei.call();

           assert.equal(value.toString(), web3.toBigNumber("1e18").toString());

           await instance.allowAddress(accountAllowedToSetPricingStrategy, false);

           expectThrow(
               instance.setTokenPriceInWei(web3.toBigNumber("1e18"), {from: accountAllowedToSetPricingStrategy})
           )
       } catch(err) {
           assert(false, err.message);
       }
    });

    it('Check that token pricng could not be set from the non-whitelisted address', async function () {
         try {
             const accountAllowedToSetPricingStrategy = accounts[1];

             let instance = await deployPricingStrategy();

             expectThrow(
                 instance.setTokenPriceInWei(web3.toBigNumber("1e18"), {from: accountAllowedToSetPricingStrategy})
             )
         } catch(err) {
             assert(false, err.message);
         }
    });
});