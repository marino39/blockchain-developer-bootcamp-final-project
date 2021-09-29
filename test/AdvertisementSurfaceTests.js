const AdvertisementSurface = artifacts.require("AdvertisementSurface");

contract("AdvertisementSurface", accounts => {
    it("ERC721Metadata contract", async () => {
        let advSurface = await AdvertisementSurface.deployed();

        let name = await advSurface.name();
        assert.equal("Advertisement Surface", name);

        let symbol = await advSurface.symbol();
        assert.equal("ADS", symbol);
    });

    it("register advertisement surface", async () => {
        let advSurface = await AdvertisementSurface.deployed();
        await advSurface.registerAdvertisementSurface("abc", {
            "erc20": "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
            "minBid": BigInt("100")
        });

        let balance = await advSurface.balanceOf(accounts[0]);
        assert.equal(BigInt("1"), balance);

        let paymentnfo = await advSurface.getPaymentInfo(BigInt("1"));
        assert.equal("0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d", paymentnfo.erc20);
        assert.equal(BigInt("100"), paymentnfo.minBid);

        let tokenURI = await advSurface.tokenURI(BigInt("1"));
        assert.equal("ipfs://abc", tokenURI);
    });
});