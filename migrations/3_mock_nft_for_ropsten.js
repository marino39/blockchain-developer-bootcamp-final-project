const MockNFT = artifacts.require("MockNFT");


module.exports = async function (deployer, network, accounts) {
    if (network === "ropsten") {
        await deployer.deploy(MockNFT);
    }
};