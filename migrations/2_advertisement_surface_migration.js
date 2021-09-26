const AdvertisementSurface = artifacts.require("AdvertisementSurface");

module.exports = function (deployer) {
    deployer.deploy(AdvertisementSurface);
};