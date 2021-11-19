import {Box, Center, Image, Text} from "@chakra-ui/react";
import React, {useCallback, useEffect, useReducer, useState} from "react";
import {useWeb3Context} from "web3-react";

import config from "../config";

import AdvertisementSurfaceAuction from "../contracts/AdvertisementSurfaceAuction.json"
import ERC721 from "../contracts/ERC721.json"

import {useParams} from "react-router-dom";
import {getJsonFromIPFS} from "../utils/ipfsUtils";

export default function SurfaceView(props) {
    const {id} = useParams();
    const context = useWeb3Context();

    const [initialized, setInitialized] = useState(false);
    const [bids, setBids] = useState([]);
    const [bidsCount, setBidsCount] = useState(0);
    const [bid, setBid] = useState(null);
    const [bidMetadata, setBidMetadata] = useState(null);

    const [foceX, forceUpdate] = useReducer((x) => x + 1, 0);

    const [advrtAuction,] = useState(new context.library.eth.Contract(
        AdvertisementSurfaceAuction.abi,
        AdvertisementSurfaceAuction.networks[config.NetworkIdToChainId[context.networkId].toString()].address
    ));

    const logActiveCallback = useCallback(async (error, event) => {
        console.log("LogActive", event);
        setBidsCount(
            await advrtAuction.methods.getActiveBidCount(id).call()
        );
    }, [id, advrtAuction]);

    const logOutbidCallback = useCallback(async (error, event) => {
        console.log("LogOutbid", event);
        setBidsCount(
            await advrtAuction.methods.getActiveBidCount(id).call()
        );
    }, [id, advrtAuction]);

    const logFinishedCallback = useCallback(async (error, event) => {
        console.log("LogFinished", event);
        setBidsCount(
            await advrtAuction.methods.getActiveBidCount(id).call()
        );
    }, [id, advrtAuction]);

    useEffect(() => {
        async function fetchData() {
            const activeBidSize = await advrtAuction.methods.getActiveBidCount(id).call();

            let newBids = [];
            for (let i = 0; i < activeBidSize; i++) {
                const ret = await advrtAuction.methods.getActiveBid(id, i).call();
                const bidId = ret[0];
                const bidInfo = ret[1];

                newBids.push({
                    bidId: bidId,
                    bidder: bidInfo.bidder,
                    from: Number(bidInfo.startTime),
                    to: Number(bidInfo.startTime) + Number(bidInfo.duration),
                    duration: bidInfo.duration,
                    advERC721: bidInfo.advERC721,
                    advTokenId: bidInfo.advTokenId,
                });
            }

            setBids(newBids);
            setBidsCount(activeBidSize);
            setInitialized(true);
        }

        fetchData();
    }, [initialized, id, advrtAuction, bidsCount]);

    useEffect(() => {
        async function fetchData() {
            const currentTime = (new Date()) / 1000;

            let found = false;
            for (let i = 0; i < bids.length; i++) {
                const curBid = bids[i];
                if (curBid.from <= currentTime && curBid.to > currentTime) {
                    console.log(Number(curBid.from).toString() + " <= " + Number(currentTime).toString() + " && " + Number(curBid.to).toString() + " > " + Number(currentTime).toString());
                    if (bid === null || bid.bidId !== curBid.bidId) {
                        setBid(curBid);
                    }
                    found = true;
                    break;
                }
            }

            if (!found) {
                setBid(null);
                setBidMetadata(null);
            }
        }

        fetchData();
    }, [bids, bid, foceX]);

    useEffect(() => {
        async function fetchData() {
            if (bid === null) {
                return;
            }

            const erc721 = new context.library.eth.Contract(ERC721.abi, bid.advERC721);
            const tokenURI = await erc721.methods.tokenURI(bid.advTokenId).call();

            console.log(tokenURI);
            let metadata = {}
            if (tokenURI.startsWith("ipfs://")) {
                metadata = await getJsonFromIPFS(tokenURI.substr(7));
            }

            console.log(metadata);
            setBidMetadata(metadata);
        }

        fetchData();
    }, [context, bid])

    useEffect(() => {
        const logActiveSubscription = advrtAuction.events.LogActive({filter: {tokenId: id}}, logActiveCallback);

        const logOutbidSubscription = advrtAuction.events.LogOutbid({filter: {tokenId: id}}, logOutbidCallback);

        const logFinishedSubscription = advrtAuction.events.LogFinished({filter: {tokenId: id}}, logFinishedCallback);

        return () => {
            logActiveSubscription.unsubscribe();
            logOutbidSubscription.unsubscribe();
            logFinishedSubscription.unsubscribe();
        }
    }, [id, advrtAuction, logActiveCallback, logOutbidCallback, logFinishedCallback])

    useEffect(() => {
        setTimeout(() => {
            forceUpdate();
        }, 1000);
    }, [foceX]);

    if (!initialized) {
        setInitialized(true);
    }

    if (bid === null || bidMetadata === null) {
        return (
            <Center w="full" h="100vh" alignContent="center" verticalAlign="center">
                <Text fontSize="xl" fontWeight="bold">Bid to show your advertisement!</Text>
            </Center>
        )
    } else {
        return (
            <Box w="full" h="100vh">
                <Image src={bidMetadata.properties.image} w="full" h="full"/>
            </Box>
        )
    }
}