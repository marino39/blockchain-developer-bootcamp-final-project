const AdvertisementSurface = artifacts.require("AdvertisementSurface");
const MockDai = artifacts.require("MockDai");


module.exports = async function (callback) {
    let dai = await MockDai.deployed();
    let advSurface = await AdvertisementSurface.deployed();

    let accounts = await web3.eth.getAccounts();
    let balance = await advSurface.balanceOf(accounts[0]);
    if (balance.toString() === "0") {
        await advSurface.registerAdvertisementSurface(
            "QmXasBSgmZrtRnxvEMZk8cSYPGogMnUexNVW8ynLEq9CK9",
            {
                "erc20": dai.address,
                "minBid": BigInt("100")
            }
        );

        await advSurface.registerAdvertisementSurface(
            "QmaWeYNcqwPxM3aoAwS2GoicPoGSo79eny6EZL7Pe4Jkrx",
            {
                "erc20": dai.address,
                "minBid": BigInt("10000")
            }
        );
    } else {
        console.log("Advertisement surfaces already registered!");
    }

    callback();
}