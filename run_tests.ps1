truffle compile
truffle migrate --reset
truffle test ./test/1_PricingStrategy.js
truffle test ./test/2_RntCrowdsale.js
truffle test ./test/3_RNTMultisigWallet.js
truffle test ./test/4_RntPresaleEthereumDeposit.js
truffle test ./test/5_RntToken.js
truffle test ./test/6_RntTokenProxy.js
truffle test ./test/7_RntTokenVault.js
truffle test ./test/8_IntegrationTest.js