module.exports = {
    port: 8555,
    norpc: true,
    skipFiles: ['Migrations.sol'],
    copyNodeModules: true,
    testCommand: 'node --max-old-space-size=4096 ../node_modules/.bin/truffle test --network coverage',
};