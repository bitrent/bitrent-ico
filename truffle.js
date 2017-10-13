let provider;
const HDWalletProvider = require('truffle-hdwallet-provider');
const mnemonic = '[REDACTED]';

if (!process.env.SOLIDITY_COVERAGE) {
    provider = new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/')
}

module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8444,
            network_id: "*" // Match any network id
        },
        coverage: {
            host: "localhost",
            network_id: "*",
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 0x01
        },
        ropsten: {
            provider: provider,
            network_id: 3 // official id of the ropsten public test network
        },
    }
};
