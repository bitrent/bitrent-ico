const RntToken = artifacts.require("RntToken");

const INITIAL_SUPPLY = web3.toBigNumber("1000000000000000000000000000");

const deployToken = () => {
    return RntToken.new();
};

const getParamFromTxEvent = require('./helpers/getParamFromTxEvent');
const expectThrow = require('./helpers/expectThrow');
const ether = require('./helpers/ether');

contract('RntToken', function (accounts) {

    const owner = accounts[0];
    const tokensForApprove = web3.toBigNumber("666");
    const expectedBalance = web3.toBigNumber("66");

    it("RNT_TOKEN_1 - Check that tokens can be transfered", async function () {
        try {
            let instance = await deployToken();
            const ob = await instance.balanceOf.call(owner);
            await instance.setTransferAgent(owner, true, { from: owner });
            const transferEvent = await instance.transfer(accounts[2], web3.toBigNumber("100"), { from: owner });
            const recepientBalance = await instance.balanceOf.call(accounts[2]);
            const senderBalance = await instance.balanceOf.call(owner);
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
            await instance.setTransferAgent(owner, true, { from: owner });
            await instance.setTransferAgent(accounts[2], true, { from: owner });
            await instance.transfer(accounts[2], web3.toBigNumber("100"), { from: owner });

            expectThrow(
                instance.transfer(accounts[3], web3.toBigNumber("102"), { from: accounts[2] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_3 - Check that account can not transfer tokens if it not transfer agent or tokens was not released", async function () {
        try {
            let instance = await deployToken();

            expectThrow(
                instance.transfer(accounts[2], web3.toBigNumber("60"), { from: owner })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_4 - Check account balance", async function () {
        try {
            let instance = await deployToken();
            await instance.setTransferAgent(owner, true, { from: owner });
            await instance.transfer(accounts[2], web3.toBigNumber("100"), { from: owner });
            const recepientBalance = await instance.balanceOf.call(accounts[2]);
            assert.equal(recepientBalance.valueOf(), web3.toBigNumber("100").toString());
        } catch (err) {
            assert(false, err.message);
        }
    });

    // transferFrom()
    it("RNT_TOKEN_5 - Check that account can transfer approved tokens", async function () {
        try {
            let instance = await deployToken();
            await instance.setReleaseAgent(owner);
            await instance.releaseTokenTransfer({ from: owner });
            await instance.transfer(accounts[1], web3.toBigNumber("100"), { from: owner });
            await instance.approve(accounts[2], web3.toBigNumber("50"), { from: accounts[1] });
            await instance.transferFrom(accounts[1], accounts[3], web3.toBigNumber("50"), { from: accounts[2] });
            const recepientBalance = await instance.balanceOf.call(accounts[3]);
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

    it("RNT_TOKEN_7 - Check that transfer agent can transfer tokens", async function () {
        try {
            let instance = await deployToken();
            await instance.setTransferAgent(owner, true, { from: owner });
            await instance.approve(accounts[5], web3.toBigNumber("100"), { from: owner });
            await instance.transferFrom(owner, accounts[2], web3.toBigNumber("100"), { from: accounts[5] });
            let recepientBalance = await instance.balanceOf.call(accounts[2]);
            let ownerBalance = await instance.balanceOf.call(owner);
            assert.equal(recepientBalance.valueOf(), web3.toBigNumber("100").toString());
            assert.equal(ownerBalance.valueOf(), INITIAL_SUPPLY.minus(100).toString());
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_8 - Check that owner can set transfer agent", async function () {
        try {
            let instance = await deployToken();
            await instance.setTransferAgent(owner, true, { from: owner });
            await instance.approve(accounts[5], web3.toBigNumber("100"), { from: owner });
            await instance.transferFrom(owner, accounts[2], web3.toBigNumber("100"), { from: accounts[5] });
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_9 - Check that owner can set release agent", async function () {
        try {
            let instance = await deployToken();
            await instance.setReleaseAgent(owner, { from: owner });
            await instance.releaseTokenTransfer({ from: owner });
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_10 - Check that not owner can not set transfer agent", async function () {
        try {
            let instance = await deployToken();

            expectThrow(
                instance.setTransferAgent(accounts[1], true, { from: accounts[5] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_11 - Check that not owner can not set release agent", async function () {
         try {
             let instance = await deployToken();
 
             expectThrow(
                 instance.setReleaseAgent(accounts[1], { from: accounts[3] })
             );
         } catch (err) {
             assert(false, err.message);
         }
     });
 
     it("RNT_TOKEN_12 - Check that owner can remove transfer agent", async function () {
         try {
             let instance = await deployToken();
             await instance.setTransferAgent(owner, true, { from: owner });
             await instance.approve(accounts[5], web3.toBigNumber("200"), { from: owner });
             await instance.transferFrom(owner, accounts[2], web3.toBigNumber("100"), { from: accounts[5] });
             await instance.setTransferAgent(owner, false, { from: owner });
 
             expectThrow(
                 instance.transferFrom(owner, accounts[2], web3.toBigNumber("100"), { from: accounts[5] })
             );
         } catch (err) {
             assert(false, err.message);
         }
     });
 
     // balanceOf()
     it("Check balance of owner account", async function () {
         try {
             let instance = await deployToken();
             const balance = await instance.balanceOf.call(owner);
             assert.equal(balance.valueOf(), INITIAL_SUPPLY.toString());
         } catch (err) {
             assert(false, err.message);
         }
     });
 
 
     it("Check that account can not transfer unapproved tokens", async function () {
         try {
             let instance = await deployToken();
             await instance.setReleaseAgent(owner);
             await instance.releaseTokenTransfer({ from: owner });
 
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

