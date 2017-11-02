const RNTMultiSigWallet = artifacts.require('RNTMultiSigWallet');
const web3 = RNTMultiSigWallet.web3;
const deployMultisig = (owners, confirmations) => {
    return RNTMultiSigWallet.new(owners, confirmations)
};

const getParamFromTxEvent = require('./helpers/getParamFromTxEvent');
const expectThrow = require('./helpers/expectThrow');
const ether = require('./helpers/ether');

contract('RNTMultiSigWallet', (accounts) => {
    let multisigInstance;
    const requiredConfirmations = 2;

    beforeEach(async () => {
        multisigInstance = await deployMultisig([accounts[0], accounts[1]], requiredConfirmations);
        assert.ok(multisigInstance);
    });

    it('RNT_WALLET_1 - Create transaction for transfer of 100 ether', async () => {
        try {
            const etherToTransfer = web3.toBigNumber("100");

            const adminTransactionId = getParamFromTxEvent(
                await multisigInstance.submitTransaction(accounts[4], etherToTransfer, "", {from: accounts[0]}),
                'transactionId',
                null,
                'Submission'
            );

            const includePending = true;
            const excludeExecuted = true;

            assert.include(
                await multisigInstance.getTransactionIds(0, 1, includePending, excludeExecuted),
                adminTransactionId
            );

            assert.include(
                await multisigInstance.getConfirmations(adminTransactionId),
                accounts[0]
            );
        } catch (e) {
            assert(false, e.message);
        }
    });

    it('RNT_WALLET_2 - Get exception when non-owner trying to create transaction', async () => {
        try {
            const etherToTransfer = web3.toBigNumber("100");

            expectThrow(
                multisigInstance.submitTransaction(accounts[4], etherToTransfer, "", {from: accounts[3]})
            );
        } catch (e) {
            assert(false, e.message);
        }

    });

    it('RNT_WALLET_3 - Confirm transaction by owner', async () => {
        try {
            const etherToTransfer = web3.toBigNumber("100");

            const adminTransactionId = getParamFromTxEvent(
                await multisigInstance.submitTransaction(accounts[4], etherToTransfer, "", {from: accounts[0]}),
                'transactionId',
                null,
                'Submission'
            );

            await multisigInstance.confirmTransaction(adminTransactionId, {from: accounts[1]});

            assert.include(
                await multisigInstance.getConfirmations(adminTransactionId),
                accounts[1]
            );
        } catch (e) {
            assert(false, e.message);
        }

    });


    it('RNT_WALLET_4 - Get an exception when trying to confirm an transaction by non-owner/non-admin', async () => {
        try {
            const etherToTransfer = web3.toBigNumber("100");

            const adminTransactionId = getParamFromTxEvent(
                await multisigInstance.submitTransaction(accounts[4], etherToTransfer, "", {from: accounts[0]}),
                'transactionId',
                null,
                'Submission'
            );

            expectThrow(
                multisigInstance.confirmTransaction(adminTransactionId, {from: accounts[2]})
            );
        } catch (e) {
            assert(false, e.message);
        }
    });

    it('RNT_WALLET_5 - Revoke confirmation', async () => {
        try {
            const etherToTransfer = web3.toBigNumber("100");

            const adminTransactionId = getParamFromTxEvent(
                await multisigInstance.submitTransaction(accounts[4], etherToTransfer, "", {from: accounts[0]}),
                'transactionId',
                null,
                'Submission'
            );

            //Revoke confirmation for transaction from owner (admin)
            await multisigInstance.revokeConfirmation(adminTransactionId, {from: accounts[0]});

            assert.notInclude(
                await multisigInstance.getConfirmations(adminTransactionId),
                accounts[0]
            );

        } catch (e) {
            assert(false, e.message);
        }
    });

    it('RNT_WALLET_6 - Get exception when trying to revoke a confirmed transaction from non-owner (non-admin)', async () => {
        try {
            const etherToTransfer = web3.toBigNumber("100");

            const adminTransactionId = getParamFromTxEvent(
                await multisigInstance.submitTransaction(accounts[4], etherToTransfer, "", {from: accounts[0]}),
                'transactionId',
                null,
                'Submission'
            );

            //Revoke confirmation for transaction from non-owner (non-admin)
            expectThrow(
                multisigInstance.revokeConfirmation(adminTransactionId, {from: accounts[3]})
            )
        } catch (e) {
            assert(false, e.message);
        }
    });

    it('RNT_WALLET_7 - Send 101 ether from wallet to the 3rd party address', async () => {
        try {
            const initialWalletBalance = web3.toBigNumber("200");
            const etherToTransfer = web3.toBigNumber("101");

            await web3.eth.sendTransaction({
                to: multisigInstance.address,
                value: initialWalletBalance,
                from: accounts[0],
            });

            assert.equal(
                await web3.eth.getBalance(multisigInstance.address).valueOf(),
                initialWalletBalance.toString()
            );

            const receiverAccount = accounts[2];
            const initialReceiverBalance = await web3.eth.getBalance(receiverAccount);
            //create a transaction
            const adminTransactionId = getParamFromTxEvent(
                await multisigInstance.submitTransaction(receiverAccount, etherToTransfer, "", {from: accounts[0]}),
                'transactionId',
                null,
                'Submission'
            );

            //add confirmation and execute transaction
            await multisigInstance.confirmTransaction(adminTransactionId, {from: accounts[1]});

            assert.include(
                await multisigInstance.getConfirmations(adminTransactionId),
                accounts[1]
            );

            const NOT_PENDING = false;
            const EXECUTED = true;
            assert.include(
                await multisigInstance.getTransactionIds(0, 1, NOT_PENDING, EXECUTED),
                adminTransactionId
            );

            assert.equal(
                (await web3.eth.getBalance(accounts[2])).toString(),
                initialReceiverBalance.plus(etherToTransfer).toString()
            );

            assert.equal(
                (await web3.eth.getBalance(multisigInstance.address)).toString(),
                (initialWalletBalance - etherToTransfer).toString()
            );
        } catch (e) {
            assert(false, e.message);
        }
    });

    it('RNT_WALLET_8 - Get an exception when trying to send 101 ether from wallet to the 3rd party address with only 1 confirmation', async () => {
        try {
            const initialWalletBalance = web3.toBigNumber("200");
            const etherToTransfer = web3.toBigNumber("101");

            await web3.eth.sendTransaction({
                to: multisigInstance.address,
                value: initialWalletBalance,
                from: accounts[0],
            });

            assert.equal(
                await web3.eth.getBalance(multisigInstance.address).valueOf(),
                initialWalletBalance.toString()
            );

            const receiverAccount = accounts[2];
            //create a transaction
            const adminTransactionId = getParamFromTxEvent(
                await multisigInstance.submitTransaction(receiverAccount, etherToTransfer, "", {from: accounts[0]}),
                'transactionId',
                null,
                'Submission'
            );

            expectThrow(
                multisigInstance.executeTransaction(adminTransactionId, {from: accounts[1]})
            )
        } catch (e) {
            assert(false, e.message);
        }
    });

    it('RNT_WALLET_9 - Owner added by admin', async () => {
        try {
            const ownerToAdd = accounts[3];

            await multisigInstance.addOwner(ownerToAdd, {from: accounts[0]});

            assert.include(
                await multisigInstance.getOwners(),
                ownerToAdd
            );
        } catch (e) {
            assert(false, e.message);
        }

    });

    it('RNT_WALLET_10 - Raise an expection if trying to add owner by non-admin', async () => {
        try {
            const ownerAdded = accounts[3];
            await multisigInstance.addOwner(ownerAdded, {from: accounts[0]});

            assert.include(
                await multisigInstance.getOwners(),
                ownerAdded
            );

            const ownerToAdd = accounts[4];
            expectThrow(
                multisigInstance.addOwner(ownerToAdd, {from: ownerAdded})
            );
        } catch (e) {
            assert(false, e.message);
        }
    });

    it('RNT_WALLET_11 - Admin removed owner of a wallet', async () => {
        try {
            const ownerToRemove = accounts[3];
            await multisigInstance.addOwner(ownerToRemove, {from: accounts[0]});
            assert.include(
                await multisigInstance.getOwners(),
                ownerToRemove
            );

            await multisigInstance.removeOwner(ownerToRemove, {from: accounts[0]});

            assert.notInclude(
                await multisigInstance.getOwners(),
                ownerToRemove
            );
        } catch (e) {
            assert(false, e.message);
        }
    });

    it('RNT_WALLET_12 - Get an exception if trying to remove owner of a wallet from non-admin account', async () => {
        try {
            const ownerAdded = accounts[3];
            await multisigInstance.addOwner(ownerAdded, {from: accounts[0]});
            assert.include(
                await multisigInstance.getOwners(),
                ownerAdded
            );

            const ownerToRemove = accounts[4];
            await multisigInstance.addOwner(ownerToRemove, {from: accounts[0]});
            assert.include(
                await multisigInstance.getOwners(),
                ownerToRemove
            );

            expectThrow(
                multisigInstance.removeOwner(ownerToRemove, {from: ownerAdded})
            )
        } catch (e) {
            assert(false, e.message);
        }
    });

    it('RNT_WALLET_13 - Get an exception when trying to remove administrator', async () => {
        try {
            const ownerAdded = accounts[2];
            await multisigInstance.addOwner(ownerAdded, {from: accounts[0]});
            assert.include(
                await multisigInstance.getOwners(),
                ownerAdded
            );

            expectThrow(
                multisigInstance.removeOwner(accounts[0], {from: accounts[1]})
            );

            expectThrow(
                multisigInstance.removeOwner(accounts[1], {from: accounts[0]})
            );

            expectThrow(
                multisigInstance.removeOwner(accounts[0], {from: ownerAdded})
            );

            expectThrow(
                multisigInstance.removeOwner(accounts[1], {from: ownerAdded})
            )
        } catch (e) {
            assert(false, e.message);
        }
    });

    it('RNT_WALLET_14 - Set pause for contract by admin', async () => {
        try {
            const etherToTransfer = web3.toBigNumber("100");
            const adminAccount = accounts[0];
            await multisigInstance.pause({from: adminAccount});
            assert.isTrue(await multisigInstance.paused.call());

            expectThrow(
                multisigInstance.submitTransaction(accounts[2], etherToTransfer, "", {from: adminAccount}),
            )
        } catch (e) {
            assert(false, e.message);
        }
    });

    it('RNT_WALLET_15 - Send 100 ether to wallet', async () => {
        try {
            const initialWalletBalance = web3.toBigNumber("100");

            await web3.eth.sendTransaction({
                to: multisigInstance.address,
                value: initialWalletBalance,
                from: accounts[0],
            });

            assert.equal(
                await web3.eth.getBalance(multisigInstance.address).valueOf(),
                initialWalletBalance.toString()
            );
        } catch (e) {
            assert(false, e.message);
        }
    });

    it('RNT_WALLET_16 - Unpause a contract by admin', async () => {
        try {
            const etherToTransfer = web3.toBigNumber("100");
            const adminAccount = accounts[0];
            await multisigInstance.pause({from: adminAccount});
            assert.isTrue(await multisigInstance.paused.call());

            await multisigInstance.unpause({from: adminAccount});
            assert.isFalse(await multisigInstance.paused.call());

            await multisigInstance.submitTransaction(accounts[2], etherToTransfer, "", {from: adminAccount});
        } catch (e) {
            assert(false, e.message);
        }
    });

    it('RNT_WALLET_17 - Get an exception when trying to pause a contract by non-admin', async () => {
        try {
            const adminAccount = accounts[0];
            const nonAdminOwner = accounts[2];

            await multisigInstance.addOwner(nonAdminOwner, {from: adminAccount});

            expectThrow(
                multisigInstance.pause({from: nonAdminOwner})
            )
        } catch (e) {
            assert(false, e.message);
        }
    });

    it('RNT_WALLET_18 - Get an exception when trying to unpause a contract by non-admin', async () => {
        try {
            const adminAccount = accounts[0];
            const nonAdminOwner = accounts[2];

            await multisigInstance.addOwner(nonAdminOwner, {from: adminAccount});

            expectThrow(
                multisigInstance.unpause({from: nonAdminOwner})
            )
        } catch (e) {
            assert(false, e.message);
        }
    });

    //default gnosis test fallback
    it('test execution after requirements changed', async () => {
        const etherToTransfer = web3.toBigNumber("100");
        const deposit = web3.toBigNumber("1000");

        // Send money to wallet contract
        await new Promise((resolve, reject) => web3.eth.sendTransaction({
            to: multisigInstance.address,
            value: deposit,
            from: accounts[0]
        }, e => (e ? reject(e) : resolve())));
        const balance = await web3.eth.getBalance(multisigInstance.address);
        assert.equal(balance.valueOf(), deposit);

        // Add owner wa_4
        await multisigInstance.addOwner(accounts[3], {from: accounts[0]});

        // Update required to 1
        const newRequired = 1;
        await multisigInstance.changeRequirement(newRequired, {from: accounts[0]});

        const transactionId = getParamFromTxEvent(
            await multisigInstance.submitTransaction(accounts[4], etherToTransfer, "", {from: accounts[0]}),
            'transactionId',
            null,
            'Submission'
        );

        assert.include(
            await multisigInstance.getTransactionIds(0, 1, false, true),
            transactionId
        )
    })
});
