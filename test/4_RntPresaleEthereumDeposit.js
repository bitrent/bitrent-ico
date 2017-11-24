const Deposit = artifacts.require("RntPresaleEthereumDeposit");
const RNTMultiSigWallet = artifacts.require('RNTMultiSigWallet');

const getParamFromTxEvent = require('./helpers/getParamFromTxEvent');
const expectThrow = require('./helpers/expectThrow');
const ether = require('./helpers/ether');

const deployDeposit = (walletAddr) => {
    return Deposit.new(walletAddr);
};

const deployMultisig = (owners, confirmations) => {
    return RNTMultiSigWallet.new(owners, confirmations)
};

contract('RntPresaleEthereumDeposit', function (accounts) {

    const owner = accounts[0];
    const acc1 = accounts[1];
    const acc2 = accounts[2];
    const acc3 = accounts[3];
    const acc4 = accounts[4];
    const acc5 = accounts[5];
    const acc6 = accounts[6];

    it("RNT_PRESALE_DEPOSIT_1 - Check that account can pay", async function () {
        try {
            const wallet = await deployMultisig([accounts[0], accounts[1]], 2);
            const instance = await deployDeposit(wallet.address);
            await instance.sendTransaction({ from: acc1, value: web3.toBigNumber("100") });
            await instance.sendTransaction({ from: acc1, value: web3.toBigNumber("42") });
            await instance.sendTransaction({ from: acc2, value: web3.toBigNumber("132") });
            const acc1Ether1 = await instance.receivedEtherFrom.call(acc1, { from: owner });
            const acc2Ether1 = await instance.receivedEtherFrom.call(acc2, { from: owner });
            const acc1Ether2 = await instance.receivedEtherFrom.call(acc1, { from: acc1 });
            const acc2Ether2 = await instance.receivedEtherFrom.call(acc2, { from: acc2 });
            assert.equal(acc1Ether1, 142);
            assert.equal(acc2Ether1, 132);
            assert.equal(acc1Ether2, 142);
            assert.equal(acc2Ether2, 132);
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_PRESALE_DEPOSIT_2 - Checking ether of address", async function () {
        try {
            const wallet = await deployMultisig([accounts[0], accounts[1]], 2);
            const instance = await deployDeposit(wallet.address);
            await instance.sendTransaction({ from: acc1, value: web3.toBigNumber("100") });
            await instance.sendTransaction({ from: acc2, value: web3.toBigNumber("132") });
            const ether = await instance.receivedEtherFrom.call(acc1, { from: acc4 });
            assert.equal(ether.valueOf(), web3.toBigNumber("100").toString());
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_PRESALE_DEPOSIT_3 - List of addresses with their ether", async function () {
        try {
            const wallet = await deployMultisig([accounts[0], accounts[1]], 2);
            const instance = await deployDeposit(wallet.address);
            await instance.sendTransaction({ from: acc1, value: web3.toBigNumber("100") });
            await instance.sendTransaction({ from: acc2, value: web3.toBigNumber("132") });
            let length = await instance.getDonatorsNumber.call({ from: owner });
            length = length.c[0];
            assert.equal(length, 2);
            for (let i = 0; i < length; i++) {
                let response = await instance.getDonator.call(i, { from: owner });
            }
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_PRESALE_DEPOSIT_4 - Pause contract", async function () {
        try {
            const wallet = await deployMultisig([accounts[0], accounts[1]], 2);
            const instance = await deployDeposit(wallet.address);
            await instance.pause({ from: owner });

            expectThrow(
                instance.receivedEtherFrom.call(acc1, { from: owner })
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it("RNT_PRESALE_DEPOSIT_5 - Check that every account can check taken ether", async function () {
        try {
            const wallet = await deployMultisig([accounts[0], accounts[1]], 2);
            const instance = await deployDeposit(wallet.address);
            await instance.sendTransaction({ from: acc1, value: 2 });
            const overallEther = await instance.overallTakenEther.call({ from: acc3 });
        } catch (err) {
            assert(false, err.message);
        }
    });

    
    it("RNT_PRESALE_DEPOSIT_6 - Check that every account can check their ether", async function () {
        try {
            const wallet = await deployMultisig([accounts[0], accounts[1]], 2);
            const instance = await deployDeposit(wallet.address);
            await instance.sendTransaction({ from: acc1, value: 2 });
            const overallEther = await instance.myEther.call({ from: acc1 });
        } catch (err) {
            assert(false, err.message);
        }
    });
});