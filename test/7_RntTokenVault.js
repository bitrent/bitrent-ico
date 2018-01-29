const RNTBToken = artifacts.require("RNTBToken");
const RntTokenVault = artifacts.require("TestRntTokenVault");


const INITIAL_SUPPLY = web3.toBigNumber("1000000000000000000000000000");

const deployToken = () => {
    return RNTBToken.new();
};

const deployVault = (tokenAddress) => {
    return RntTokenVault.new(tokenAddress);
};

const getParamFromTxEvent = require('./helpers/getParamFromTxEvent');
const expectThrow = require('./helpers/expectThrow');
const ether = require('./helpers/ether');
const uuidParser = require('./helpers/uuidParser');

contract('RntTokenVault', function (accounts) {

    const owner = accounts[0];

    const uuid1 = uuidParser.parse("581275c6-35c0-4704-aa25-4dec99d6da04");
    const uuid2 = uuidParser.parse("76061c06-8e01-41ac-bac1-547a41d9c1f3");

    it("RNT_TOKEN_VAULT_1 - Check creating account and adding tokens to it", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.transfer(vault.address, web3.toBigNumber("200"), { from: owner });
            const ob = await vault.getVaultBalance.call({ from: owner });
            await vault.addTokensToAccount(uuid1, web3.toBigNumber("100"), { from: owner });
            const value = await vault.balances.call(uuid1, { from: owner });
       
            assert.equal(value.valueOf(), web3.toBigNumber("100").toString());
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_2 - Check removing tokens from account", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.transfer(vault.address, web3.toBigNumber("200"), { from: owner });
            await vault.addTokensToAccount(uuid1, web3.toBigNumber("100"), { from: owner });
            await vault.testRemoveTokensFromAccount(uuid1, web3.toBigNumber("100"), { from: owner });
            let value = await vault.balances.call(uuid1, { from: owner });
            assert.equal(value.c[0], 0);
        } catch (err) {
            assert(false);
        }

    });


    it("RNT_TOKEN_VAULT_3 - Check that token can not be removed from unregistered account", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);

            expectThrow(
                vault.testRemoveTokensFromAccount(uuid1, web3.toBigNumber("100"), { from: owner })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_4 - Check that disallowed address can not add tokens to account", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);

            expectThrow(
                vault.addTokensToAccount(uuid1, web3.toBigNumber("100"), { from: accounts[4] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_5 - Check that disallowed address can not remove tokens from account", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await vault.addTokensToAccount(uuid1, web3.toBigNumber("200"), { from: owner });
            await rnt.transfer(vault.address, web3.toBigNumber("200"), { from: owner });

            expectThrow(
                vault.testRemoveTokensFromAccount(uuid1, web3.toBigNumber("100"), { from: accounts[4] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });


    it("RNT_TOKEN_VAULT_6 - Check tokens transfering between accounts", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await vault.addTokensToAccount(uuid1, web3.toBigNumber("200"), { from: owner });
            await rnt.transfer(vault.address, web3.toBigNumber("200"), { from: owner });
            await vault.transferTokensToAccount(uuid1, uuid2, web3.toBigNumber("100"), { from: owner });
            let senderBalance = await vault.balances.call(uuid2, { from: owner });
            let recepientBalance = await vault.balances.call(uuid1, { from: owner });
            assert.equal(recepientBalance.valueOf(), web3.toBigNumber("100").toString());
            assert.equal(senderBalance.valueOf(), web3.toBigNumber("100").toString());
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_7 - Check that ungergistered account can not transfer tokens to other account", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.approve(vault.address, web3.toBigNumber("10000"), { from: owner });

            expectThrow(
                vault.transferTokensToAccount(uuid1, uuid2, web3.toBigNumber("100"), { from: owner })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_8 - Check that disallowed address can not transfer tokens to other account", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await vault.addTokensToAccount(uuid1, web3.toBigNumber("200"), { from: owner });
            await rnt.transfer(vault.address, web3.toBigNumber("200"), { from: owner });

            expectThrow(
                vault.transferTokensToAccount(uuid1, uuid2, web3.toBigNumber("100"), { from: accounts[6] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_9 - Check that account balance can be moved to address", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await vault.addTokensToAccount(uuid1, web3.toBigNumber("200"), { from: owner });
            await rnt.transfer(vault.address, web3.toBigNumber("200"), { from: owner });
            await vault.moveTokensToAddress(uuid1, accounts[3], web3.toBigNumber("100"), { from: owner });
            let remains = await vault.balances.call(uuid1, { from: owner });
            let transfered = await rnt.balanceOf(accounts[3]);
            assert.equal(remains.valueOf(), web3.toBigNumber("100").toString());
            assert.equal(transfered.valueOf(), web3.toBigNumber("100").toString());
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_10 - Check that unregistered account can not move tokens", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.approve(vault.address, web3.toBigNumber("10000"), { from: owner });

            expectThrow(
                vault.moveTokensToAddress(uuid1, accounts[3], web3.toBigNumber("100"), { from: owner })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_11 - Check that disallowed address can not move tokens", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await vault.addTokensToAccount(uuid1, web3.toBigNumber("200"), { from: owner });
            await rnt.transfer(vault.address, web3.toBigNumber("200"), { from: owner });

            expectThrow(
                vault.moveTokensToAddress(uuid1, accounts[3], web3.toBigNumber("100"), { from: accounts[8] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_12 - Check that all tokens from account can be moved to address", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await vault.addTokensToAccount(uuid1, web3.toBigNumber("200"), { from: owner });
            await rnt.transfer(vault.address, web3.toBigNumber("200"), { from: owner });
            await vault.moveAllTokensToAddress(uuid1, accounts[3], { from: owner });
            let remains = await vault.balances.call(uuid1, { from: owner });
            let transfered = await rnt.balanceOf(accounts[3]);
            assert.equal(remains.c[0], 0);
            assert.equal(transfered.valueOf(), web3.toBigNumber("200"));
        } catch (err) {
            assert(false);
        }
    });

    it("RNT_TOKEN_VAULT_13 - Check that disallowed address can not move all tokens", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await vault.addTokensToAccount(uuid1, web3.toBigNumber("200"), { from: owner });
            await rnt.transfer(vault.address, web3.toBigNumber("200"), { from: owner });

            expectThrow(
                vault.moveAllTokensToAddress(uuid1, accounts[3], { from: accounts[8] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_14 - Check that owner can allow address", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await vault.allowAddress(accounts[2], true, { from: owner });
            const isAllowed = await vault.isAllowedAddress(accounts[2]);
            assert.equal(isAllowed.valueOf(), true);
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_15 - Check that not owner can not allow address", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);

            expectThrow(
                vault.allowAddress(accounts[2], true, { from: accounts[3] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_16 - Check that owner can disallow address", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await vault.allowAddress(accounts[2], true, { from: owner });
            await vault.allowAddress(accounts[2], false, { from: owner });
            const isAllowed = await vault.isAllowedAddress(accounts[2]);
            assert.equal(isAllowed.valueOf(), false);
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_17 - Check that not owner can not disallow address", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await vault.allowAddress(accounts[2], true, { from: owner });

            expectThrow(
                vault.allowAddress(accounts[2], false, { from: accounts[3] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("Check balance of vault", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            const balance = await vault.getVaultBalance.call({ from: owner });
            assert.equal(balance.valueOf(), 0);
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("Check balance of account from owner", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.approve(vault.address, web3.toBigNumber("10000"), { from: owner });
            await vault.addTokensToAccount(uuid1, web3.toBigNumber("100"), { from: owner });
            const vResponse = await vault.balances.call(uuid1, { from: owner });
            let value = vResponse.valueOf();
            assert.equal(value, web3.toBigNumber("100").toString());
        } catch (err) {
            assert(false, err.message);
        }

    });

    
    it("Check balance of account from allowed address", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.approve(vault.address, web3.toBigNumber("10000"), { from: owner });
            await vault.addTokensToAccount(uuid1, web3.toBigNumber("100"), { from: owner });
            await vault.allowAddress(accounts[5], true, { from: owner });
            const vResponse = await vault.balances.call(uuid1, { from: accounts[5] });
            let value = vResponse.valueOf();
            assert.equal(value, web3.toBigNumber("100").toString());
        } catch (err) {
            assert(false, err.message);
        }

    });

});