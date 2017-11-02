const RntToken = artifacts.require("RntToken");
const RntTokenVault = artifacts.require("TestRntTokenVault");
const RntTokenProxy = artifacts.require("RntTokenProxy");
const RntCrowdsale = artifacts.require("RntCrowdsale");

const INITIAL_SUPPLY = web3.toBigNumber("1000000000000000000000000000");

const deployToken = () => {
    return RntToken.new();
};

const deployVault = (tokenAddress) => {
    return RntTokenVault.new(tokenAddress);
};

const deployProxy = (tokenAddress, vaultAddress, defaultAllowed, crowdsaleAddress) => {
    return RntTokenProxy.new(tokenAddress, vaultAddress, defaultAllowed, crowdsaleAddress);
};

const deployCrowdsale = (tokenAddress) => {
    return RntCrowdsale.new(tokenAddress);
};

const getParamFromTxEvent = require('./helpers/getParamFromTxEvent');
const expectThrow = require('./helpers/expectThrow');
const ether = require('./helpers/ether');
const uuidParser = require('./helpers/uuidParser');

contract('RntTokenProxy', function (accounts) {

    const owner = accounts[0];

    const uuid = uuidParser.parse("76061c06-8e01-41ac-bac1-547a41d9c1f3");

    it("RNT_BD_PROXY_BUYER_1 - Check tokens adding", async function () {
        try {
            const token = await deployToken();
            const vault = await deployVault(token.address);
            const crowdsale = await deployCrowdsale(token.address);
            const proxy = await deployProxy(token.address, vault.address, owner, crowdsale.address);
            await token.setReleaseAgent(owner);
            await token.releaseTokenTransfer({ from: owner });
            await token.approve(proxy.address, web3.toBigNumber("1000"), { from: owner });
            await vault.allowAddress(proxy.address, true, { form: owner });
            await proxy.addTokens(uuid, web3.toBigNumber("1000"), { from: owner });
            let uuidBalance = await vault.balances.call(uuid, { from: owner });
            let vaultBalance = await token.balanceOf.call(vault.address, { from: owner });
            assert.equal(uuidBalance.valueOf(), web3.toBigNumber("1000").toString());
            assert.equal(vaultBalance.valueOf(), web3.toBigNumber("1000").toString());
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_BD_PROXY_BUYER_2 - Check that disallowed address can not add tokens", async function () {
        try {
            const token = await deployToken();
            const vault = await deployVault(token.address);
            const crowdsale = await deployCrowdsale(token.address);
            const proxy = await deployProxy(token.address, vault.address, owner, crowdsale.address);
            await token.setReleaseAgent(owner);
            await token.releaseTokenTransfer({ from: owner });
            await token.approve(proxy.address, web3.toBigNumber("1000"), { from: owner });
            await vault.allowAddress(proxy.address, true, { form: owner });

            expectThrow(
                proxy.addTokens(uuid, web3.toBigNumber("1000"), { from: accounts[3] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_BD_PROXY_BUYER_3 - Check tokens transfering to specified address", async function () {
        try {
            const token = await deployToken();
            const vault = await deployVault(token.address);
            const crowdsale = await deployCrowdsale(token.address);
            const proxy = await deployProxy(token.address, vault.address, owner, crowdsale.address);
            await token.setReleaseAgent(owner);
            await token.releaseTokenTransfer({ from: owner });
            await token.approve(proxy.address, web3.toBigNumber("1001"), { from: owner });
            await vault.allowAddress(proxy.address, true, { form: owner });
            await proxy.addTokens(uuid, web3.toBigNumber("1001"), { from: owner });
            await proxy.moveTokens(accounts[9], uuid, web3.toBigNumber("1000"), { from: owner })
            let uuidBalance = await vault.balances.call(uuid, { from: owner });
            let vaultBalance = await token.balanceOf.call(vault.address, { from: owner });
            let recepientBalance = await token.balanceOf.call(accounts[9], { from: owner });
            assert.equal(uuidBalance.valueOf(), web3.toBigNumber("1").toString());
            assert.equal(vaultBalance.valueOf(), web3.toBigNumber("1").toString());
            assert.equal(recepientBalance.valueOf(), web3.toBigNumber("1000").toString());
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_BD_PROXY_BUYER_4 - Check that disallowed address can not move tokens", async function () {
        try {
            const token = await deployToken();
            const vault = await deployVault(token.address);
            const crowdsale = await deployCrowdsale(token.address);
            const proxy = await deployProxy(token.address, vault.address, owner, crowdsale.address);
            await token.setReleaseAgent(owner);
            await token.releaseTokenTransfer({ from: owner });
            await token.approve(proxy.address, web3.toBigNumber("1000"), { from: owner });
            await vault.allowAddress(proxy.address, true, { form: owner });
            await proxy.addTokens(uuid, web3.toBigNumber("1000"), { from: owner });

            expectThrow(
                proxy.moveTokens(accounts[9], uuid, web3.toBigNumber("1000"), { from: accounts[3] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_BD_PROXY_BUYER_5 - Check that move tokens is not allowed from unregistered account", async function () {
        try {
            const token = await deployToken();
            const vault = await deployVault(token.address);
            const crowdsale = await deployCrowdsale(token.address);
            const proxy = await deployProxy(token.address, vault.address, owner, crowdsale.address);
            await token.setReleaseAgent(owner);
            await token.releaseTokenTransfer({ from: owner });
            await token.approve(proxy.address, web3.toBigNumber("1000"), { from: owner });
            await vault.allowAddress(proxy.address, true, { form: owner });

            expectThrow(
                proxy.moveTokens(accounts[9], uuid, web3.toBigNumber("1000"), { from: owner })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_BD_PROXY_BUYER_6 - Check that account can not move more tokens than have", async function () {
        try {
            const token = await deployToken();
            const vault = await deployVault(token.address);
            const crowdsale = await deployCrowdsale(token.address);
            const proxy = await deployProxy(token.address, vault.address, owner, crowdsale.address);
            await token.setReleaseAgent(owner);
            await token.releaseTokenTransfer({ from: owner });
            await token.approve(proxy.address, web3.toBigNumber("500"), { from: owner });
            await vault.allowAddress(proxy.address, true, { form: owner });
            await proxy.addTokens(uuid, web3.toBigNumber("500"), { from: owner });

            expectThrow(
                proxy.moveTokens(accounts[9], uuid, web3.toBigNumber("1000"), { from: owner })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });


    it("RNT_BD_PROXY_BUYER_7 - Check that account can not move more tokens than vault have", async function () {
        try {
            const token = await deployToken();
            const vault = await deployVault(token.address);
            const crowdsale = await deployCrowdsale(token.address);
            const proxy = await deployProxy(token.address, vault.address, owner, crowdsale.address);
            await token.setReleaseAgent(owner);
            await token.releaseTokenTransfer({ from: owner });
            await token.approve(proxy.address, web3.toBigNumber("1000"), { from: owner });
            await vault.allowAddress(proxy.address, true, { form: owner });
            await proxy.addTokens(uuid, web3.toBigNumber("1000"), { from: owner });
            await vault.transferTokensFromVault(owner, web3.toBigNumber("500"), { from: owner });

            expectThrow(
                proxy.moveTokens(accounts[3], uuid, web3.toBigNumber("1000"), { from: owner })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_BD_PROXY_BUYER_8 - Check that owner can allow address", async function () {
        try {
            const token = await deployToken();
            const vault = await deployVault(token.address);
            const crowdsale = await deployCrowdsale(token.address);
            const proxy = await deployProxy(token.address, vault.address, owner, crowdsale.address);
            await token.setReleaseAgent(owner);
            await token.releaseTokenTransfer({ from: owner });
            await token.approve(proxy.address, web3.toBigNumber("500"), { from: owner });
            await vault.allowAddress(proxy.address, true, { form: owner });
            await proxy.allowAddress(accounts[5], true, { from: owner });
            await proxy.addTokens(uuid, web3.toBigNumber("500"), { from: accounts[5] });
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_BD_PROXY_BUYER_9 - Check that not owner can not allow address", async function () {
        try {
            const token = await deployToken();
            const vault = await deployVault(token.address);
            const crowdsale = await deployCrowdsale(token.address);
            const proxy = await deployProxy(token.address, vault.address, owner, crowdsale.address);
            await token.setReleaseAgent(owner);
            await token.releaseTokenTransfer({ from: owner });
            await token.approve(proxy.address, web3.toBigNumber("500"), { from: owner });
            await vault.allowAddress(proxy.address, true, { form: owner });

            expectThrow(
                proxy.allowAddress(accounts[5], true, { from: accounts[3] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_BD_PROXY_BUYER_10 - Check that owner can disallow address", async function () {
        try {
            const token = await deployToken();
            const vault = await deployVault(token.address);
            const crowdsale = await deployCrowdsale(token.address);
            const proxy = await deployProxy(token.address, vault.address, owner, crowdsale.address);
            await token.setReleaseAgent(owner);
            await token.releaseTokenTransfer({ from: owner });
            await token.approve(proxy.address, web3.toBigNumber("90000"), { from: owner });
            await vault.allowAddress(proxy.address, true, { form: owner });
            await proxy.allowAddress(accounts[5], true, { from: owner });
            await proxy.addTokens(uuid, web3.toBigNumber("500"), { from: accounts[5] });
            await proxy.allowAddress(accounts[5], false, { from: owner });

            expectThrow(
                proxy.addTokens(uuid, web3.toBigNumber("500"), { from: accounts[5] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_BD_PROXY_BUYER_11 - Check that not owner can not disallow address", async function () {
        try {
            const token = await deployToken();
            const vault = await deployVault(token.address);
            const crowdsale = await deployCrowdsale(token.address);
            const proxy = await deployProxy(token.address, vault.address, owner, crowdsale.address);
            await token.setReleaseAgent(owner);
            await token.releaseTokenTransfer({ from: owner });
            await token.approve(proxy.address, web3.toBigNumber("90000"), { from: owner });
            await vault.allowAddress(proxy.address, true, { form: owner });
            await proxy.allowAddress(accounts[5], true, { from: owner });
            await proxy.addTokens(uuid, web3.toBigNumber("500"), { from: accounts[5] });

            expectThrow(
                proxy.allowAddress(accounts[5], false, { from: accounts[3] })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });
});