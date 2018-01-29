module.exports = function () {
    let ethereumjsWallet = require('ethereumjs-wallet');
    let ProviderEngine = require("web3-provider-engine");
    let WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
    let Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
    let Web3 = require("web3");
    let FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');

// create wallet from existing private key
    let privateKey = 'NEED TO FILL DEPLOYMENT ACCOUNT PRIVATE KEY';
    let wallet = ethereumjsWallet.fromPrivateKey(new Buffer(privateKey, "hex"));
    let address = "0x" + wallet.getAddress().toString("hex");

//don't forget to change network with API
    let providerUrl = "https://ropsten.infura.io/YOUR-API-KEY";
    let engine = new ProviderEngine();

// filters
    engine.addProvider(new FilterSubprovider());
    engine.addProvider(new WalletSubprovider(wallet, {}));
    engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(providerUrl)));
    engine.start(); // Required by the provider engine.

    return {
        provider: engine,
        from: address
    }
};

