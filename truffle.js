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
        demo: {
            host: "192.168.0.77",
            network_id: 211211,
            port: 8545,
            from: "9e65c373a97793e8d36cb8316ecbe79940110f90",
        }
    }
};
