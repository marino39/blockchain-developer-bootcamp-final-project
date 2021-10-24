const AdvertisementSurface = artifacts.require("AdvertisementSurface");
const MockDai = artifacts.require("MockDai");

module.exports = function (deployer, network, accounts) {
    deployer.deploy(AdvertisementSurface);

    if (network === "development") {
        deployer.deploy(MockDai);
    }
};