const RntToken = artifacts.require("RntToken.sol");
const RntTokenVault = artifacts.require("TestRntTokenVault.sol");

const INITIAL_SUPPLY = 1000000000;

const deployToken = () => {
    return RntToken.new("RNT", 2, INITIAL_SUPPLY, false);
};

const deployVault = (tokenAddress) => {
    return RntTokenVault.new(tokenAddress);
};

const getParamFromTxEvent = require('./helpers/getParamFromTxEvent');
const expectThrow = require('./helpers/expectThrow');
const ether = require('./helpers/ether');

contract('RntTokenVault', function (accounts) {

    const owner = accounts[0];

    it("RNT_TOKEN_VAULT_1 - Check creating account and adding tokens to it", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.setReleaseAgent(owner);
            await rnt.releaseTokenTransfer({ from: owner });
            await rnt.transfer(vault.address, 200, { from: owner });
            await vault.addTokensToAccount("1337-er2w-df24-aaa1", 100, { from: owner });
            let value = await vault.balanceOf.call("1337-er2w-df24-aaa1", { from: owner });
            assert.equal(value.c[0], 100);
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_2 - Check removing tokens from account", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.setReleaseAgent(owner);
            await rnt.releaseTokenTransfer({ from: owner });
            await rnt.transfer(vault.address, 200, { from: owner });
            await vault.addTokensToAccount("1337-er2w-df24-aaa1", 100, { from: owner });
            await vault.testRemoveTokensFromAccount("1337-er2w-df24-aaa1", 100, { from: owner });
            let value = await vault.balanceOf.call("1337-er2w-df24-aaa1", { from: owner });
            assert.equal(value.c[0], 0);
        } catch (err) {
            assert(false);
        }

    });


    it("RNT_TOKEN_VAULT_3 - Check that token can not be removed from unregistered account", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.setReleaseAgent(owner);
            await rnt.releaseTokenTransfer({ from: owner });

            expectThrow(
                vault.testRemoveTokensFromAccount("1337-er2w-df24-aaa1", 100, { from: owner })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_4 - Check that disallowed address can not add tokens to account", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.setReleaseAgent(owner);
            await rnt.releaseTokenTransfer({ from: owner });

            expectThrow(
                vault.addTokensToAccount("1337-er2w-df24-aaa1", 100, { from: accounts[4] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_5 - Check that disallowed address can not remove tokens from account", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.setReleaseAgent(owner);
            await rnt.releaseTokenTransfer({ from: owner });
            await vault.addTokensToAccount("1337-er2w-df24-aaa1", 200, { from: owner });
            await rnt.transfer(vault.address, 200, { from: owner });

            expectThrow(
                vault.testRemoveTokensFromAccount("1337-er2w-df24-aaa1", 100, { from: accounts[4] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });


    it("RNT_TOKEN_VAULT_6 - Check tokens transfering between accounts", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.setReleaseAgent(owner);
            await rnt.releaseTokenTransfer({ from: owner });
            await vault.addTokensToAccount("1337-er2w-df24-aaa1", 200, { from: owner });
            await rnt.transfer(vault.address, 200, { from: owner });
            await vault.transferTokensToAccount("1337-er2w-df24-aaa1", "1337-er2w-df24-aaa2", 100, { from: owner });
            let senderBalance = await vault.balanceOf.call("1337-er2w-df24-aaa2", { from: owner });
            let recepientBalance = await vault.balanceOf.call("1337-er2w-df24-aaa1", { from: owner });
            assert.equal(recepientBalance.c[0], 100);
            assert.equal(senderBalance.c[0], 100);
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_7 - Check that ungergistered account can not transfer tokens to other account", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.setReleaseAgent(owner);
            await rnt.releaseTokenTransfer({ from: owner });
            await rnt.approve(vault.address, 10000, { from: owner });

            expectThrow(
                vault.transferTokensToAccount("1337-er2w-df24-aaa1", "1337-er2w-df24-aaa2", 100, { from: owner })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_8 - Check that disallowed address can not transfer tokens to other account", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.setReleaseAgent(owner);
            await rnt.releaseTokenTransfer({ from: owner });
            await vault.addTokensToAccount("1337-er2w-df24-aaa1", 200, { from: owner });
            await rnt.transfer(vault.address, 200, { from: owner });

            expectThrow(
                vault.transferTokensToAccount("1337-er2w-df24-aaa1", "1337-er2w-df24-aaa2", 100, { from: accounts[6] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_9 - Check that account balance can be moved to address", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.setReleaseAgent(owner);
            await rnt.releaseTokenTransfer({ from: owner });
            await vault.addTokensToAccount("1337-er2w-df24-aaa1", 200, { from: owner });
            await rnt.transfer(vault.address, 200, { from: owner });
            await vault.moveTokensToAddress("1337-er2w-df24-aaa1", accounts[3], 100, { from: owner });
            let remains = await vault.balanceOf.call("1337-er2w-df24-aaa1", { from: owner });
            let transfered = await rnt.balanceOf.call(accounts[3]);
            assert.equal(remains.c[0], 100);
            assert.equal(transfered.c[0], 100);
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_10 - Check that unregistered account can not move tokens", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.setReleaseAgent(owner);
            await rnt.releaseTokenTransfer({ from: owner });
            await rnt.approve(vault.address, 10000, { from: owner });

            expectThrow(
                vault.moveTokensToAddress("1337-er2w-df24-aaa1", accounts[3], 100, { from: owner })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_11 - Check that disallowed address can not move tokens", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.setReleaseAgent(owner);
            await rnt.releaseTokenTransfer({ from: owner });
            await vault.addTokensToAccount("1337-er2w-df24-aaa1", 200, { from: owner });
            await rnt.transfer(vault.address, 200, { from: owner });

            expectThrow(
                vault.moveTokensToAddress("1337-er2w-df24-aaa1", accounts[3], 100, { from: accounts[8] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_TOKEN_VAULT_12 - Check that all tokens from account can be moved to address", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.setReleaseAgent(owner);
            await rnt.releaseTokenTransfer({ from: owner });
            await vault.addTokensToAccount("1337-er2w-df24-aaa1", 200, { from: owner });
            await rnt.transfer(vault.address, 200, { from: owner });
            await vault.moveAllTokensToAddress("1337-er2w-df24-aaa1", accounts[3], { from: owner });
            let remains = await vault.balanceOf.call("1337-er2w-df24-aaa1", { from: owner });
            let transfered = await rnt.balanceOf.call(accounts[3]);
            assert.equal(remains.c[0], 0);
            assert.equal(transfered.c[0], 200);
        } catch (err) {
            assert(false);
        }
    });

    it("RNT_TOKEN_VAULT_13 - Check that disallowed address can not move all tokens", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.setReleaseAgent(owner);
            await rnt.releaseTokenTransfer({ from: owner });
            await vault.addTokensToAccount("1337-er2w-df24-aaa1", 200, { from: owner });
            await rnt.transfer(vault.address, 200, { from: owner });

            expectThrow(
                vault.moveAllTokensToAddress("1337-er2w-df24-aaa1", accounts[3], { from: accounts[8] })
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

    // balanceOf()
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

    it("Check balance of account", async function () {
        try {
            let rnt = await deployToken();
            let vault = await deployVault(rnt.address);
            await rnt.setReleaseAgent(owner);
            await rnt.releaseTokenTransfer({ from: owner });
            await rnt.approve(vault.address, 10000, { from: owner });
            await vault.addTokensToAccount("1337-er2w-df24-aaa1", 100, { from: owner });
            const vResponse = await vault.balanceOf.call("1337-er2w-df24-aaa1", { from: owner });
            let value = vResponse.valueOf();
            assert.equal(value, 100);
        } catch (err) {
            assert(false, err.message);
        }

    });

});