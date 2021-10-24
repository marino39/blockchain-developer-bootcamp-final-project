const AdvertisementSurface = artifacts.require("AdvertisementSurface");
const AdvertisementSurfaceAuction = artifacts.require("AdvertisementSurfaceAuction");

const MockDai = artifacts.require("MockDai");

let { catchRevert } = require("./exceptionsHelpers.js");


contract("AdvertisementSurface", accounts => {
    let advSurface;
    let erc20Dai;
    let erc721NFT;
    let surfaceOne = BigInt("1");
    let surfaceNotExistOne = BigInt("1000000");

    let bob = accounts[0];
    let alice = accounts[1];
    let matt = accounts[2];

    beforeEach(async () => {
        advSurface = await AdvertisementSurface.new();
        erc20Dai = await MockDai.new();

        await erc20Dai.mint(bob, BigInt("100000000000000000"));
        await erc20Dai.mint(alice, BigInt("100000000000000000"));
        await erc20Dai.mint(matt, BigInt("100000000000000000"));

        erc721NFT = "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d";
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
                "erc20": erc20Dai.address,
                "minBid": BigInt("100")
            });

            let balance = await advSurface.balanceOf(bob);
            assert.equal(BigInt("1"), balance);

            let paymentnfo = await advSurface.getPaymentInfo(surfaceOne);
            assert.equal(erc20Dai.address, paymentnfo.erc20);
            assert.equal(BigInt("100"), paymentnfo.minBid);

            let tokenURI = await advSurface.tokenURI(surfaceOne);
            assert.equal("ipfs://abc", tokenURI);
        });
    });

    describe("The Auction System", async () => {
        beforeEach(async () => {
            await advSurface.registerAdvertisementSurface("abc", {
                "erc20": erc20Dai.address,
                "minBid": BigInt("100")
            });
        });

        it("add single bid simple", async () => {
            let unixTime = Math.floor(Date.now() / 1000);

            await advSurface.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 100),
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
            let unixTime = Math.floor(Date.now() / 1000);

            await advSurface.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await advSurface.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 220),
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
            let unixTime = Math.floor(Date.now() / 1000);

            await advSurface.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("100000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await catchRevert(advSurface.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 120),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add two bids overlap left", async () => {
            let unixTime = Math.floor(Date.now() / 1000);

            await advSurface.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("100000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await catchRevert(advSurface.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 80),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add two bids overlap inner", async () => {
            let unixTime = Math.floor(Date.now() / 1000);

            await advSurface.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("100000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await catchRevert(advSurface.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 120),
                "duration":   BigInt("20"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add two bids overlap outer", async () => {
            let unixTime = Math.floor(Date.now() / 1000);

            await advSurface.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("100000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await catchRevert(advSurface.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 80),
                "duration":   BigInt("200"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add two bids overlap inner bigger worth", async () => {
            let unixTime = Math.floor(Date.now() / 1000);

            await advSurface.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("1000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await advSurface.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 120),
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
            assert.equal(AdvertisementSurfaceAuction.enums.BidState.Outbid, oldBid[1].state);
            assert.equal(AdvertisementSurfaceAuction.enums.BidState.Active, newBid[1].state);
        });

        it("add two bids overlap inner bigger worth 3 bids", async () => {
            let unixTime = Math.floor(Date.now() / 1000);

            await advSurface.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("1000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await advSurface.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10"),
                "startTime":  BigInt(unixTime + 240),
                "duration":   BigInt("20"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            })

            await advSurface.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 80),
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
            assert.equal(AdvertisementSurfaceAuction.enums.BidState.Outbid, oldBid[1].state);
            assert.equal(AdvertisementSurfaceAuction.enums.BidState.Outbid, old2Bid[1].state);
            assert.equal(AdvertisementSurfaceAuction.enums.BidState.Active, newBid[1].state);
        });

        it("add single bid to not existing surface", async () => {
            let unixTime = Math.floor(Date.now() / 1000);

            await catchRevert(advSurface.newBid({
                "bidder": bob,
                "surTokenId": surfaceNotExistOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": AdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

    });
});