#### Install project dependencies
1. Install nodejs and npm
2. Install project dependencies: `npm install`

#### Run testrpc (do it in a separate bash session). You will need this one before you start testing.
`sh testrpc.sh` or `./node_modules/.bin/testrpc`   
(in the first case you will get predefined set of accounts suitable for the all test case)

#### Run full test suite
`npm run tests`  

#### Run specified test
`npm run test ./test/RNTMultiSigWallet.js`  

#### Compile smart contracts
`npm run compile`  

#### Generate test coverage report
`sh coverage.sh` or `./node_modules/.bin/solidity-coverage`   
(in the second case you should start testrpc manually)  
@todo fix dependencies error

#### Run Solium linter
`./node_modules/.bin/solium --dir ./contracts`  

#### Reformat the code according to Solium rules
`./node_modules/.bin/solium --dir ./contracts --fix`  

#### Run solcheck linter
`./node_modules/.bin/solcheck contracts/*`

#### Run all linters in project
`sh lint.sh`  

#### Run security analysis
`todo`

#### Software versions
Solidity v0.4.15  
Truffle v3.4.11  
OpenZeppelin 1.3.0  
solidity-coverage 0.2.5  
Solium linter 1.0.0 BETA  
solcheck linter 0.1.3    

#### Deployment price
Gas usage: 10455403
Price in wei: 2.19563463e+17
Price in ether: 0.219563463
