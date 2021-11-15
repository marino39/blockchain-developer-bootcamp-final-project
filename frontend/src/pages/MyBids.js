import LandingLayout from "../components/layouts/LandingLayout";
import {Button, Flex, Text} from "@chakra-ui/react";
import React, {useCallback, useEffect, useState} from "react";
import {useWeb3Context} from "web3-react";
import BidsTable from "../components/ui/BidsTable";
import BigNumber from "bignumber.js";
import config from "../config";

import AdvertisementSurface from "../contracts/AdvertisementSurface.json"
import AdvertisementSurfaceAuction from "../contracts/AdvertisementSurfaceAuction.json"
import ERC20 from "../contracts/ERC20.json"

function MyBids(props) {
    const context = useWeb3Context();

    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalSize, setTotalSize] = useState(0);

    const [initialized, setInitialized] = useState(false);

    const advrtSurface = new context.library.eth.Contract(
        AdvertisementSurface.abi,
        AdvertisementSurface.networks[config.NetworkIdToChainId[context.networkId].toString()].address
    );

    const advrtAuction = new context.library.eth.Contract(
        AdvertisementSurfaceAuction.abi,
        AdvertisementSurfaceAuction.networks[config.NetworkIdToChainId[context.networkId].toString()].address
    );

    const logActiveCallback = useCallback(async (error, event) => {
        console.log("LogActive", event);
        setTotalSize(
            await advrtAuction.methods.getMyBidsCount().call()
        );
    }, [setTotalSize]);

    const logOutbidCallback = useCallback(async (error, event) => {
        console.log("LogOutbid", event);
        setTotalSize(
            await advrtAuction.methods.getMyBidsCount().call()
        );
    }, [setTotalSize]);

    const logFinishedCallback = useCallback(async (error, event) => {
        console.log("LogFinished", event);
        setTotalSize(
            await advrtAuction.methods.getMyBidsCount().call()
        );
    }, [setTotalSize]);

    useEffect(() => {
        async function fetchData() {
            setTotalSize(
                await advrtAuction.methods.getMyBidsCount().call()
            );

            setInitialized(true);
        }

        fetchData();

        const logActiveSubscription = advrtAuction.events.LogActive({filter: {bidder: context.address}}, logActiveCallback);

        const logOutbidSubscription = advrtAuction.events.LogOutbid({filter: {bidder: context.address}}, logOutbidCallback);

        const logFinishedSubscription = advrtAuction.events.LogFinished({filter: {bidder: context.address}}, logFinishedCallback);

        return () => {
            logActiveSubscription.unsubscribe();
            logOutbidSubscription.unsubscribe();
            logFinishedSubscription.unsubscribe();
        }
    }, [initialized]);

    useEffect(() => {
        async function fetchData() {
            const myBidCount = await advrtAuction.methods.getMyBidsCount().call();

            let newItems = [];
            for (let i = (page - 1) * pageSize; i < Math.min(page * pageSize, totalSize); i++) {
                const ret = await advrtAuction.methods.getMyBid(i).call();
                const bidId = ret[0];
                const bidInfo = ret[1];

                const paymentInfo = await advrtSurface.methods.getPaymentInfo(bidInfo.surTokenId).call();

                let erc20 = new context.library.eth.Contract(ERC20.abi, paymentInfo.erc20);
                let tokenSymbol = await erc20.methods.symbol().call();
                let tokenDecimals = await erc20.methods.decimals().call();

                const bid = (new BigNumber(bidInfo.bid)).div(
                    (new BigNumber("10")).pow(new BigNumber(tokenDecimals))
                ).toString();
                const total = (new BigNumber(bid)).multipliedBy(new BigNumber(bidInfo.duration)).toString();

                newItems.push({
                    bidId: bidId,
                    state: bidInfo.state,
                    surfaceId: bidInfo.surTokenId,
                    bidder: bidInfo.bidder,
                    from: Number(bidInfo.startTime),
                    to: Number(bidInfo.startTime) + Number(bidInfo.duration),
                    duration: bidInfo.duration,
                    tokenSymbol: tokenSymbol,
                    bid: bid,
                    total: total,
                    isOwner: false,
                    isBidder: true,
                });
            }

            setItems(newItems);
            setTotalSize(myBidCount);
        }

        fetchData();
    }, [page, pageSize, totalSize]);

    return (
        <LandingLayout>
            <Flex w={'full'} pl={10} pr={10}>
                <Text fontSize="xl" fontWeight="semibold">
                    My Bids
                </Text>
            </Flex>
            <BidsTable items={items}/>
            <Flex w="full" alignItems="center" justifyContent="center" m={10}>
                {page - 1 > 0 && (<Button m={1} onClick={() => {
                    setPage(page - 1);
                }}>{page - 1}</Button>)}
                <Button m={1}>{page}</Button>
                {totalSize > page * pageSize && (<Button m={1} onClick={() => {
                    setPage(page + 1);
                }}>{page + 1}</Button>)}
            </Flex>
        </LandingLayout>
    );
}

export default MyBids;