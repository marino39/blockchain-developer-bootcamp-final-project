const AdvertisementSurface = artifacts.require("AdvertisementSurface");
const AdvertisementSurfaceAuction = artifacts.require("AdvertisementSurfaceAuction");

const MockDai = artifacts.require("MockDai");

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(AdvertisementSurface);

    const advSurface = await AdvertisementSurface.deployed();
    await deployer.deploy(AdvertisementSurfaceAuction, advSurface.address);

    if (network === "development") {
        await deployer.deploy(MockDai);
    }
};