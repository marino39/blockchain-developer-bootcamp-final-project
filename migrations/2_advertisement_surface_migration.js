const AdvertisementSurface = artifacts.require("AdvertisementSurface");
const AdvertisementSurfaceAuction = artifacts.require("AdvertisementSurfaceAuction");

const MockDai = artifacts.require("MockDai");
const MockNFT = artifacts.require("MockNFT");


module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(AdvertisementSurface);

    const advSurface = await AdvertisementSurface.deployed();
    await deployer.deploy(AdvertisementSurfaceAuction, advSurface.address);

    if (network === "develop") {
        await deployer.deploy(MockDai);
        await deployer.deploy(MockNFT);
    }
};