const AdvertisementSurface = artifacts.require("AdvertisementSurface");

contract("AdvertisementSurface", accounts => {
    it("tokenize advertisement surface", async () => {
        let advSurface = await AdvertisementSurface.deployed();
        await advSurface.registerAdvertisementSurface({
            "erc20": "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
            "minBid": BigInt("100"),
            "defaultERC721": "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
            "defaultTokenId": BigInt("1"),
            "metadataURI": "ipfs://abcde",
            "metadataHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        });

        let balance = await advSurface.balanceOf(accounts[0]);
        assert.equal(BigInt("1"), balance);

        let advSurfaceInfo = await advSurface.getAdvertisementSurfaceInfo(BigInt("1"));
        assert.equal("0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d", advSurfaceInfo.erc20);
        assert.equal(BigInt("100"), advSurfaceInfo.minBid);
        assert.equal("0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d", advSurfaceInfo.defaultERC721);
        assert.equal(BigInt("1"), advSurfaceInfo.defaultTokenId);
        assert.equal("ipfs://abcde", advSurfaceInfo.metadataURI);
        assert.equal("0x0000000000000000000000000000000000000000000000000000000000000000", advSurfaceInfo.metadataHash);
    });
});