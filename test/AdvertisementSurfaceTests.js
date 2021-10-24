const AdvertisementSurface = artifacts.require("AdvertisementSurface");
const AdvertisementSurfaceAuction = artifacts.require("AdvertisementSurfaceAuction");


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
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            });

            let bidCount = await advSurface.getBidCount();
            let myBidCount = await advSurface.getMyBidsCount();
            let surfaceBidCount = await advSurface.getSurfaceBidCount(surfaceOne);

            assert.equal(BigInt("1"), bidCount);
            assert.equal(BigInt("1"), myBidCount);
            assert.equal(BigInt("1"), surfaceBidCount);
        });

        it("add two bids simple", async () => {
            await advSurface.newBid({
                "bidder": accounts[0],
                "surTokenId": surfaceOne,
                "advERC721":  "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt("100"),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await advSurface.newBid({
                "bidder": accounts[0],
                "surTokenId": surfaceOne,
                "advERC721":  "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt("220"),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            });

            let bidCount = await advSurface.getBidCount();
            let myBidCount = await advSurface.getMyBidsCount();
            let surfaceBidCount = await advSurface.getSurfaceBidCount(surfaceOne);

            assert.equal(BigInt("2"), bidCount);
            assert.equal(BigInt("2"), myBidCount);
            assert.equal(BigInt("2"), surfaceBidCount);
        });

        it("add two bids overlap right", async () => {
            await advSurface.newBid({
                "bidder": accounts[0],
                "surTokenId": surfaceOne,
                "advERC721":  "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "advTokenId": BigInt("1"),
                "bid":        BigInt("100000"),
                "startTime":  BigInt("100"),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await catchRevert(advSurface.newBid({
                "bidder": accounts[0],
                "surTokenId": surfaceOne,
                "advERC721":  "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt("120"),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add two bids overlap left", async () => {
            await advSurface.newBid({
                "bidder": accounts[0],
                "surTokenId": surfaceOne,
                "advERC721":  "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "advTokenId": BigInt("1"),
                "bid":        BigInt("100000"),
                "startTime":  BigInt("100"),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await catchRevert(advSurface.newBid({
                "bidder": accounts[0],
                "surTokenId": surfaceOne,
                "advERC721":  "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt("80"),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add two bids overlap inner", async () => {
            await advSurface.newBid({
                "bidder": accounts[0],
                "surTokenId": surfaceOne,
                "advERC721":  "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "advTokenId": BigInt("1"),
                "bid":        BigInt("100000"),
                "startTime":  BigInt("100"),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await catchRevert(advSurface.newBid({
                "bidder": accounts[0],
                "surTokenId": surfaceOne,
                "advERC721":  "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt("120"),
                "duration":   BigInt("20"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add two bids overlap outer", async () => {
            await advSurface.newBid({
                "bidder": accounts[0],
                "surTokenId": surfaceOne,
                "advERC721":  "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "advTokenId": BigInt("1"),
                "bid":        BigInt("100000"),
                "startTime":  BigInt("100"),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await catchRevert(advSurface.newBid({
                "bidder": accounts[0],
                "surTokenId": surfaceOne,
                "advERC721":  "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt("80"),
                "duration":   BigInt("200"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add two bids overlap inner bigger worth", async () => {
            await advSurface.newBid({
                "bidder": accounts[0],
                "surTokenId": surfaceOne,
                "advERC721":  "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "advTokenId": BigInt("1"),
                "bid":        BigInt("1000"),
                "startTime":  BigInt("100"),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await advSurface.newBid({
                "bidder": accounts[0],
                "surTokenId": surfaceOne,
                "advERC721":  "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt("120"),
                "duration":   BigInt("20"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            })

            let bidCount = await advSurface.getBidCount();
            let myBidCount = await advSurface.getMyBidsCount();
            let surfaceBidCount = await advSurface.getSurfaceBidCount(surfaceOne);
            let surfaceActiveBids = await advSurface.getActiveBidCount(surfaceOne);

            assert.equal(BigInt("2"), bidCount);
            assert.equal(BigInt("2"), myBidCount);
            assert.equal(BigInt("2"), surfaceBidCount);
            assert.equal(BigInt("1"), surfaceActiveBids);

            let oldBid = await advSurface.getMyBid(BigInt("0"));
            let newBid = await advSurface.getMyBid(BigInt("1"));
            assert.equal(AdvertisementSurfaceAuction.enums.BidState.Outbid, oldBid.state);
            assert.equal(AdvertisementSurfaceAuction.enums.BidState.Active, newBid.state);
        });

        it("add two bids overlap inner bigger worth 3 bids", async () => {
            await advSurface.newBid({
                "bidder": accounts[0],
                "surTokenId": surfaceOne,
                "advERC721":  "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "advTokenId": BigInt("1"),
                "bid":        BigInt("1000"),
                "startTime":  BigInt("100"),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await advSurface.newBid({
                "bidder": accounts[0],
                "surTokenId": surfaceOne,
                "advERC721":  "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10"),
                "startTime":  BigInt("240"),
                "duration":   BigInt("20"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            })

            await advSurface.newBid({
                "bidder": accounts[0],
                "surTokenId": surfaceOne,
                "advERC721":  "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt("80"),
                "duration":   BigInt("300"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            })

            let bidCount = await advSurface.getBidCount();
            let myBidCount = await advSurface.getMyBidsCount();
            let surfaceBidCount = await advSurface.getSurfaceBidCount(surfaceOne);
            let surfaceActiveBids = await advSurface.getActiveBidCount(surfaceOne);

            assert.equal(BigInt("3"), bidCount);
            assert.equal(BigInt("3"), myBidCount);
            assert.equal(BigInt("3"), surfaceBidCount);
            assert.equal(BigInt("1"), surfaceActiveBids);

            let oldBid = await advSurface.getMyBid(BigInt("0"));
            let old2Bid = await advSurface.getMyBid(BigInt("1"));
            let newBid = await advSurface.getMyBid(BigInt("2"));
            assert.equal(AdvertisementSurfaceAuction.enums.BidState.Outbid, oldBid.state);
            assert.equal(AdvertisementSurfaceAuction.enums.BidState.Outbid, old2Bid.state);
            assert.equal(AdvertisementSurfaceAuction.enums.BidState.Active, newBid.state);
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
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

    });
});