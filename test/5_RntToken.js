const RNTBToken = artifacts.require("RNTBToken");

const INITIAL_SUPPLY = web3.toBigNumber("1e27");

const deployToken = () => {
    return RNTBToken.new();
};

const getParamFromTxEvent = require('./helpers/getParamFromTxEvent');
const expectThrow = require('./helpers/expectThrow');
const ether = require('./helpers/ether');

contract('RNTBToken', function (accounts) {

    const owner = accounts[0];
    const tokensForApprove = web3.toBigNumber("666");
    const expectedBalance = web3.toBigNumber("66");

    it("RNT_TOKEN_1 - Check that tokens can be transfered", async function () {
        try {
            let instance = await deployToken();
            await instance.transfer(accounts[2], web3.toBigNumber("100"), { from: owner });
            const recepientBalance = await instance.balanceOf(accounts[2]);
            const senderBalance = await instance.balanceOf(owner);
            assert.equal(recepientBalance.toString(), web3.toBigNumber("100").toString());
            assert.equal(senderBalance.toString(), INITIAL_SUPPLY.minus(100).toString());
        } catch (err) {
            assert(false, err.message);
        }
    });


    // transfer()
    it("RNT_TOKEN_2 - Check that account can not transfer more tokens then have", async function () {
        try {
            let instance = await deployToken();
            await instance.transfer(accounts[2], web3.toBigNumber("100"), { from: owner });

            expectThrow(
                instance.transfer(accounts[3], web3.toBigNumber("102"), { from: accounts[2] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_4 - Check account balance", async function () {
        try {
            let instance = await deployToken();
            await instance.transfer(accounts[2], web3.toBigNumber("100"), { from: owner });
            const recepientBalance = await instance.balanceOf(accounts[2]);
            assert.equal(recepientBalance.valueOf(), web3.toBigNumber("100").toString());
        } catch (err) {
            assert(false, err.message);
        }
    });

    // transferFrom()
    it("RNT_TOKEN_5 - Check that account can transfer approved tokens", async function () {
        try {
            let instance = await deployToken();
            await instance.transfer(accounts[1], web3.toBigNumber("100"), { from: owner });
            await instance.approve(accounts[2], web3.toBigNumber("50"), { from: accounts[1] });
            await instance.transferFrom(accounts[1], accounts[3], web3.toBigNumber("50"), { from: accounts[2] });
            const recepientBalance = await instance.balanceOf(accounts[3]);
            assert.equal(recepientBalance.valueOf(), web3.toBigNumber("50").toString());
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_6 - Check that tokens can be approved", async function () {
        try {
            let instance = await deployToken();
            await instance.approve(accounts[3], tokensForApprove, { from: owner });
        } catch (err) {
            assert(false, err.message);
        }
    });

    // balanceOfSender()
    it("RNT_TOKEN_13 - Check that balanceOf returns senders amount of tokens", async function() {
        try {
            let instance = await deployToken();
            const balance = await instance.balanceOf(owner);
            assert.equal(balance.toString(), INITIAL_SUPPLY.toString());
        } catch (err) {
            assert(false, err.message);
        }
    }); 
 
    it("Check that account can not transfer unapproved tokens", async function () {
         try {
             let instance = await deployToken();
 
             expectThrow(
                 instance.transferFrom(owner, accounts[2], expectedBalance, { from: accounts[1] })
             );
         } catch (err) {
             assert(false, err.message);
         }
     });
 
 
     // allowance()
     it("Check that approved tokens are allowed", async function () {
         try {
             let instance = await deployToken();
             await instance.approve(accounts[1], tokensForApprove, { from: owner });
             const allowed = await instance.allowance(owner, accounts[1]);
             assert.equal(allowed.valueOf(), tokensForApprove.toString(), "Allowed and approved tokens are not equal");
         } catch (err) {
             assert(false, err.message);
         }
     });
 
     it("Check that account without approved tokens have zero allowed tokens", async function () {
         try {
             let instance = await deployToken();
             const allowed = await instance.allowance(owner, accounts[1]);
             assert.equal(allowed.c[0], 0, "Allowed token are not zero");
         } catch (err) {
             assert(false, err.message);
         }
     });
 
     // HasNoEther
     it("Check that contract can't receive ether", async function () {
         try {
             let instance = await deployToken();
 
             expectThrow(
                 instance.allowance(owner, accounts[1], { value: web3.toBigNumber("10") })
             );
         } catch (err) {
             assert(false, err.message);
         }
     });
 
     // Pausable
     it("Check that token can be paused", async function () {
         try {
             let instance = await deployToken();
             await instance.pause({ from: owner });
         } catch (err) {
             assert(false, err.message);
         }
     });
 
     it("Check that token can be unpaused", async function () {
         try {
             let instance = await deployToken();
             await instance.pause({ from: owner });
             await instance.unpause({ from: owner });
         } catch (err) {
             assert(false, err.message);
         }
     });
 
     it("Check that transfer not working while paused", async function () {
         try {
             let instance = await deployToken();
             await instance.pause({ from: owner });
 
             expectThrow(
                 instance.transfer(accounts[1], web3.toBigNumber("100"), { from: owner })
             );
         } catch (err) {
             assert(false, err.message);
         }
     });
 
     it("Check that transferfrom not working while paused", async function () {
         try {
             let instance = await deployToken();
             await instance.pause({ from: owner });
 
             expectThrow(
                 instance.transferFrom(owner, accounts[1], web3.toBigNumber("100"), { from: owner })
             );
         } catch (err) {
             assert(false, err.message);
         }
     });

});

