const { constants } = require('@openzeppelin/test-helpers');

const AdvertisementSurface = artifacts.require("AdvertisementSurface");
const AdvertisementSurfaceAuction = artifacts.require("AdvertisementSurfaceAuction");
const IAdvertisementSurfaceAuction = artifacts.require("IAdvertisementSurfaceAuction");


const MockDai = artifacts.require("MockDai");

let { catchRevert } = require("./exceptionsHelpers.js");

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

contract("AdvertisementSurface", accounts => {
    let advSurface;
    let advSurfaceAuction;

    let erc20Dai;
    let erc721NFT;

    let surfaceOne = BigInt("1");
    let surfaceNotExistOne = BigInt("1000000");

    let bob = accounts[0];
    let alice = accounts[1];
    let matt = accounts[2];

    beforeEach(async () => {
        advSurface = await AdvertisementSurface.new();
        advSurfaceAuction = await AdvertisementSurfaceAuction.new(advSurface.address);
        erc20Dai = await MockDai.new();

        await erc20Dai.mint(bob, BigInt("100000000000000000"));
        await erc20Dai.mint(alice, BigInt("100000000000000000"));
        await erc20Dai.mint(matt, BigInt("10"));

        await erc20Dai.approve(advSurfaceAuction.address, BigInt("100000000000000000"))
        await erc20Dai.mint(matt, BigInt("100000000000000000"), {from: matt});

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
        let unixTime;

        beforeEach(async () => {
            await advSurface.registerAdvertisementSurface("abc", {
                "erc20": erc20Dai.address,
                "minBid": BigInt("100")
            });

            unixTime = Math.floor(Date.now() / 1000);
        });

        it("add single bid simple", async () => {
            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            let bidCount = await advSurfaceAuction.getBidCount();
            let myBidCount = await advSurfaceAuction.getMyBidsCount();
            let surfaceBidCount = await advSurfaceAuction.getSurfaceBidCount(surfaceOne);

            assert.equal(BigInt("1"), bidCount);
            assert.equal(BigInt("1"), myBidCount);
            assert.equal(BigInt("1"), surfaceBidCount);
        });

        it("add two bids simple", async () => {
            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 220),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            let bidCount = await advSurfaceAuction.getBidCount();
            let myBidCount = await advSurfaceAuction.getMyBidsCount();
            let surfaceBidCount = await advSurfaceAuction.getSurfaceBidCount(surfaceOne);

            assert.equal(BigInt("2"), bidCount);
            assert.equal(BigInt("2"), myBidCount);
            assert.equal(BigInt("2"), surfaceBidCount);
        });

        it("add two bids overlap right", async () => {
            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("100000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await catchRevert(advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 120),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add two bids overlap left", async () => {
            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("100000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await catchRevert(advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 80),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add two bids overlap inner", async () => {
            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("100000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await catchRevert(advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 120),
                "duration":   BigInt("20"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add two bids overlap outer", async () => {
            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("100000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await catchRevert(advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 80),
                "duration":   BigInt("200"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add two bids overlap inner bigger worth", async () => {
            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("1000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 120),
                "duration":   BigInt("20"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            let bidCount = await advSurfaceAuction.getBidCount();
            let myBidCount = await advSurfaceAuction.getMyBidsCount();
            let surfaceBidCount = await advSurfaceAuction.getSurfaceBidCount(surfaceOne);
            let surfaceActiveBids = await advSurfaceAuction.getActiveBidCount(surfaceOne);

            assert.equal(BigInt("2"), bidCount);
            assert.equal(BigInt("2"), myBidCount);
            assert.equal(BigInt("2"), surfaceBidCount);
            assert.equal(BigInt("1"), surfaceActiveBids);

            let oldBid = await advSurfaceAuction.getMyBid(BigInt("0"));
            let newBid = await advSurfaceAuction.getMyBid(BigInt("1"));
            assert.equal(IAdvertisementSurfaceAuction.enums.BidState.Outbid, oldBid[1].state);
            assert.equal(IAdvertisementSurfaceAuction.enums.BidState.Active, newBid[1].state);
        });

        it("add two bids overlap inner bigger worth refund outbid bid", async () => {
            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("1000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 120),
                "duration":   BigInt("20"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            let oldBid = await advSurfaceAuction.getMyBid(BigInt("0"));

            const daiBalanceBefore = await erc20Dai.balanceOf(bob);
            await advSurfaceAuction.refundBid(oldBid[0]);
            const daiBalanceAfter = await erc20Dai.balanceOf(bob);

            oldBid = await advSurfaceAuction.getMyBid(BigInt("0"));
            assert.equal(daiBalanceBefore.add(new web3.utils.BN(120*1000)).toString(), daiBalanceAfter.toString());
            assert.equal(IAdvertisementSurfaceAuction.enums.BidState.Finished, oldBid[1].state);
        });

        it("add two bids overlap inner bigger worth refund outbid bid not bidder", async () => {
            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("1000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 120),
                "duration":   BigInt("20"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            let oldBid = await advSurfaceAuction.getMyBid(BigInt("0"));
            await catchRevert(advSurfaceAuction.refundBid(oldBid[0], {from: alice}));
        });

        it("add two bids overlap inner bigger worth refund active bid", async () => {
            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("1000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 120),
                "duration":   BigInt("20"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            let newBid = await advSurfaceAuction.getMyBid(BigInt("1"));
            await catchRevert(advSurfaceAuction.refundBid(newBid[0]));
        });

        it("add two bids overlap inner bigger worth 3 bids", async () => {
            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("1000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("100"),
                "startTime":  BigInt(unixTime + 240),
                "duration":   BigInt("20"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 80),
                "duration":   BigInt("300"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            let bidCount = await advSurfaceAuction.getBidCount();
            let myBidCount = await advSurfaceAuction.getMyBidsCount();
            let surfaceBidCount = await advSurfaceAuction.getSurfaceBidCount(surfaceOne);
            let surfaceActiveBids = await advSurfaceAuction.getActiveBidCount(surfaceOne);

            assert.equal(BigInt("3"), bidCount);
            assert.equal(BigInt("3"), myBidCount);
            assert.equal(BigInt("3"), surfaceBidCount);
            assert.equal(BigInt("1"), surfaceActiveBids);

            let oldBid = await advSurfaceAuction.getMyBid(BigInt("0"));
            let old2Bid = await advSurfaceAuction.getMyBid(BigInt("1"));
            let newBid = await advSurfaceAuction.getMyBid(BigInt("2"));
            assert.equal(IAdvertisementSurfaceAuction.enums.BidState.Outbid, oldBid[1].state);
            assert.equal(IAdvertisementSurfaceAuction.enums.BidState.Outbid, old2Bid[1].state);
            assert.equal(IAdvertisementSurfaceAuction.enums.BidState.Active, newBid[1].state);
        });

        it("add single bid to not existing surface", async () => {
            await catchRevert(advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceNotExistOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add single bid for startTime that already passed", async () => {
            await catchRevert(advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(100),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add single bid for bidder with zero address", async () => {
            await catchRevert(advSurfaceAuction.newBid({
                "bidder": constants.ZERO_ADDRESS,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add single bid for ERC721 zero address", async () => {
            await catchRevert(advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  constants.ZERO_ADDRESS,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add single bid for ERC721 zero token id", async () => {
            await catchRevert(advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("0"),
                "bid":        BigInt("10000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add single bid for bid 0", async () => {
            await catchRevert(advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("0"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add single bid for bid less minimal bid", async () => {
            await catchRevert(advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("10"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("120"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add single bid for duration 0", async () => {
            await catchRevert(advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("1000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("0"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            }));
        });

        it("add single bid for state not active", async () => {
            await catchRevert(advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("1000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("100"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Outbid,
            }));
        });

        it("add single bid for no allowance to transfer", async () => {
            await catchRevert(advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("1000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("100"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Outbid,
            }, {from: alice}));
        });

        it("add single bid for too small balance to transfer", async () => {
            await catchRevert(advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("1000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("100"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Outbid,
            }, {from: matt}));
        });

        it("collect", async () => {
            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("100"),
                "startTime":  BigInt(unixTime + 1),
                "duration":   BigInt("1"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            let myBid = await advSurfaceAuction.getMyBid(BigInt("0"));

            await sleep(3000);

            const daiBalanceBefore = await erc20Dai.balanceOf(bob);
            await advSurfaceAuction.collectBid(myBid[0]);
            const daiBalanceAfter = await erc20Dai.balanceOf(bob);

            myBid = await advSurfaceAuction.getMyBid(BigInt("0"));

            assert.equal(daiBalanceBefore.add(new web3.utils.BN(100)).toString(), daiBalanceAfter.toString());
            assert.equal(IAdvertisementSurfaceAuction.enums.BidState.Finished, myBid[1].state);
        });

        it("collect not finished", async () => {
            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("100"),
                "startTime":  BigInt(unixTime + 2),
                "duration":   BigInt("1"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            let myBid = await advSurfaceAuction.getMyBid(BigInt("0"));

            await catchRevert(advSurfaceAuction.collectBid(myBid[0]));
        });

        it("events LogActive", async () => {
            const tx = await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("100"),
                "startTime":  BigInt(unixTime + 1),
                "duration":   BigInt("1"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            assert.equal("LogActive", tx.logs[0].event);
            assert.equal((new web3.utils.BN(1)).toString(), tx.logs[0].args.tokenId.toString());
            assert.equal(bob, tx.logs[0].args.bidder);
            assert.equal((new web3.utils.BN(0)).toString(), tx.logs[0].args.bidId.toString());
        });

        it("events LogOutbid", async () => {
            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("100"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("1"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            const tx = await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("1000"),
                "startTime":  BigInt(unixTime + 100),
                "duration":   BigInt("2"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            assert.equal("LogOutbid", tx.logs[0].event);
            assert.equal((new web3.utils.BN(1)).toString(), tx.logs[0].args.tokenId.toString());
            assert.equal(bob, tx.logs[0].args.bidder);
            assert.equal((new web3.utils.BN(0)).toString(), tx.logs[0].args.bidId.toString());

            assert.equal("LogActive", tx.logs[1].event);
            assert.equal((new web3.utils.BN(1)).toString(), tx.logs[1].args.tokenId.toString());
            assert.equal(bob, tx.logs[1].args.bidder);
            assert.equal((new web3.utils.BN(1)).toString(), tx.logs[1].args.bidId.toString());
        });

        it("events LogFinished", async () => {
            await advSurfaceAuction.newBid({
                "bidder": bob,
                "surTokenId": surfaceOne,
                "advERC721":  erc721NFT,
                "advTokenId": BigInt("1"),
                "bid":        BigInt("100"),
                "startTime":  BigInt(unixTime + 1),
                "duration":   BigInt("1"),
                "state": IAdvertisementSurfaceAuction.enums.BidState.Active,
            });

            let myBid = await advSurfaceAuction.getMyBid(BigInt("0"));

            await sleep(3000);

            const tx = await advSurfaceAuction.collectBid(myBid[0]);

            assert.equal("LogFinished", tx.logs[0].event);
            assert.equal((new web3.utils.BN(1)).toString(), tx.logs[0].args.tokenId.toString());
            assert.equal(bob, tx.logs[0].args.receiver);
            assert.equal((new web3.utils.BN(0)).toString(), tx.logs[0].args.bidId.toString());
        });

    });
});