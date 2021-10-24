const AdvertisementSurface = artifacts.require("AdvertisementSurface");

let { catchRevert } = require("./exceptionsHelpers.js");


contract("AdvertisementSurface", accounts => {
    let advSurface;
    let surfaceOne = BigInt("1");
    let surfaceNotExistOne = BigInt("1000000");

    beforeEach(async () => {
        advSurface = await AdvertisementSurface.new();
    });

    describe("The ERC721 functionality", () => {
        it("ERC721Metadata contract", async () => {
            let name = await advSurface.name();
            assert.equal("Advertisement Surface", name);

            let symbol = await advSurface.symbol();
            assert.equal("ADS", symbol);
        });

        it("register advertisement surface", async () => {
            await advSurface.registerAdvertisementSurface("abc", {
                "erc20": "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "minBid": BigInt("100")
            });

            let balance = await advSurface.balanceOf(accounts[0]);
            assert.equal(BigInt("1"), balance);

            let paymentnfo = await advSurface.getPaymentInfo(surfaceOne);
            assert.equal("0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d", paymentnfo.erc20);
            assert.equal(BigInt("100"), paymentnfo.minBid);

            let tokenURI = await advSurface.tokenURI(surfaceOne);
            assert.equal("ipfs://abc", tokenURI);
        });
    });

    describe("The Auction System", async () => {
        beforeEach(async () => {
            await advSurface.registerAdvertisementSurface("abc", {
                "erc20": "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "minBid": BigInt("100")
            });
        });

        it("add single bid simple", async () => {
            await advSurface.newBid({
                "bidder": accounts[0],
                "surTokenId": surfaceOne,
                "advERC721":  "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt("100"),
                "duration":   BigInt("120"),
                "state": 0,
            });

            let bidCount = await advSurface.getBidCount();
            let myBidCount = await advSurface.getMyBidsCount();
            let surfaceBidCount = await advSurface.getSurfaceBidCount(surfaceOne);

            assert.equal(BigInt("1"), bidCount);
            assert.equal(BigInt("1"), myBidCount);
            assert.equal(BigInt("1"), surfaceBidCount);
        });

        it("add single bid to not existing surface", async () => {
            await advSurface.registerAdvertisementSurface("abc", {
                "erc20": "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "minBid": BigInt("100")
            });

            await catchRevert(advSurface.newBid({
                "bidder": accounts[0],
                "surTokenId": surfaceNotExistOne,
                "advERC721":  "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt("100"),
                "duration":   BigInt("120"),
                "state": 0,
            }));
        });

    });
});