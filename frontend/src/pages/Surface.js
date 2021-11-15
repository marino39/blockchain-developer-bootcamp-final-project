import {Badge, Box, Button, Flex, Image, Spacer, Text, useColorModeValue} from "@chakra-ui/react";
import {Link, useParams} from "react-router-dom";
import LandingLayout from "../components/layouts/LandingLayout";
import BidsTable from "../components/ui/BidsTable";
import React, {useCallback, useEffect, useState} from "react";
import {useWeb3Context} from "web3-react";

import BigNumber from "bignumber.js";

import config from "../config";
import {getJsonFromIPFS} from "../utils/ipfsUtils";

import AdvertisementSurface from "../contracts/AdvertisementSurface.json"
import AdvertisementSurfaceAuction from "../contracts/AdvertisementSurfaceAuction.json"
import ERC20 from "../contracts/ERC20.json"
import NewBidModal from "../components/ui/NewBidModal";

export default function Surface(props) {
    const {id} = useParams();
    const context = useWeb3Context();
    const [initialized, setInitialized] = useState(false);
    const [tokenInfo, setTokenInfo] = useState({});

    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalSize, setTotalSize] = useState(0);

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
            await advrtAuction.methods.getActiveBidCount(id).call()
        );
    }, [id, setTotalSize]);

    const logOutbidCallback = useCallback(async (error, event) => {
        console.log("LogOutbid", event);
        setTotalSize(
            await advrtAuction.methods.getActiveBidCount(id).call()
        );
    }, [id, setTotalSize]);

    const logFinishedCallback = useCallback(async (error, event) => {
        console.log("LogFinished", event);
        setTotalSize(
            await advrtAuction.methods.getActiveBidCount(id).call()
        );
    }, [id, setTotalSize]);

    useEffect(() => {
        async function fetchData() {
            const tokenURI = await advrtSurface.methods.tokenURI(id).call();
            const paymentInfo = await advrtSurface.methods.getPaymentInfo(id).call();
            const tokenMetadata = await getJsonFromIPFS(tokenURI.substr(7));
            const owner = await advrtSurface.methods.ownerOf(id).call();

            let erc20 = new context.library.eth.Contract(ERC20.abi, paymentInfo.erc20);
            let tokenSymbol = await erc20.methods.symbol().call();
            let tokenDecimals = await erc20.methods.decimals().call();

            let minBid = (new BigNumber(paymentInfo.minBid)).div(
                (new BigNumber("10")).pow(new BigNumber(tokenDecimals))
            ).toString();

            setTokenInfo({
                tokenId: id,
                name: tokenMetadata.properties.name,
                location: tokenMetadata.properties.location,
                description: tokenMetadata.properties.description,
                image: tokenMetadata.properties.image,
                paymentToken: tokenSymbol,
                paymentTokenAddress: paymentInfo.erc20,
                paymentTokenDecimals: (new BigNumber(tokenDecimals)).toString(),
                minBid: minBid,
                isOwner: owner === context.account
            });

            const activeBidSize = await advrtAuction.methods.getActiveBidCount(id).call();
            setTotalSize(activeBidSize);

            setInitialized(true);
        }

        fetchData();
    }, [initialized]);

    useEffect(() => {
        if (tokenInfo.paymentToken === undefined) {
            return;
        }

        async function fetchData() {
            const activeBidSize = await advrtAuction.methods.getActiveBidCount(id).call();

            let newItems = [];
            for (let i = (page - 1) * pageSize; i < Math.min(page * pageSize, totalSize); i++) {
                const ret = await advrtAuction.methods.getActiveBid(id, i).call();
                const bidId = ret[0];
                const bidInfo = ret[1];

                const bid = (new BigNumber(bidInfo.bid)).div(
                    (new BigNumber("10")).pow(new BigNumber(tokenInfo.paymentTokenDecimals))
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
                    tokenSymbol: tokenInfo.paymentToken,
                    bid: bid,
                    total: total,
                    isOwner: tokenInfo.isOwner,
                    isBidder: bid.bidder === context.account,
                });
            }

            setItems(newItems);
            setTotalSize(activeBidSize);
        }

        fetchData();
    }, [page, pageSize, totalSize, id, tokenInfo]);

    useEffect(() => {
        const logActiveSubscription = advrtAuction.events.LogActive({filter: {tokenId: id}}, logActiveCallback);

        const logOutbidSubscription = advrtAuction.events.LogOutbid({filter: {tokenId: id}}, logOutbidCallback);

        const logFinishedSubscription = advrtAuction.events.LogFinished({filter: {tokenId: id}}, logFinishedCallback);

        return () => {
            logActiveSubscription.unsubscribe();
            logOutbidSubscription.unsubscribe();
            logFinishedSubscription.unsubscribe();
        }
    }, [id]);

    if (!initialized) {
        setInitialized(true);
    }

    return (
        <LandingLayout>
            <Flex w={'full'} pl={10} pr={10}>
                <Text fontSize="xl" fontWeight="semibold">
                    Surface #{id}
                </Text>
            </Flex>
            <Flex w={'full'} pl={10} pr={10} mt={5} alignContent={"left"}>
                <Image src={tokenInfo.image} boxSize="300px"/>
                <Box ml={5}>
                    <Flex justifyContent="space-between" alignContent="center">
                        <Box fontSize="2xl" color={useColorModeValue('gray.800', 'white')}>
                            <Box as="span" color={'gray.600'} fontSize="md">
                                Name: &nbsp;
                            </Box>
                            <Box as="span" fontSize="md">
                                {tokenInfo.name}
                            </Box>
                        </Box>
                    </Flex>

                    <Flex justifyContent="space-between" alignContent="center">
                        <Box fontSize="2xl" color={useColorModeValue('gray.800', 'white')}>
                            <Box as="span" color={'gray.600'} fontSize="md">
                                Description: &nbsp;
                            </Box>
                            <Box as="span" fontSize="md">
                                {tokenInfo.description}
                            </Box>
                        </Box>
                    </Flex>

                    <Flex justifyContent="space-between" alignContent="center">
                        <Box fontSize="2xl" color={useColorModeValue('gray.800', 'white')}>
                            <Box as="span" color={'gray.600'} fontSize="md">
                                Location: &nbsp;
                            </Box>
                            <Box as="span" fontSize="md">
                                {tokenInfo.location}
                            </Box>
                        </Box>
                    </Flex>

                    <Flex justifyContent="space-between" alignContent="center">
                        <Box fontSize="2xl" color={useColorModeValue('gray.800', 'white')}>
                            <Box as="span" color={'gray.600'} fontSize="md">
                                Payment Token: &nbsp;
                            </Box>
                            <Box as="span" fontSize="md">
                                {tokenInfo.paymentToken}
                            </Box>
                        </Box>
                    </Flex>

                    <Flex justifyContent="space-between" alignContent="center">
                        <Box fontSize="2xl" color={useColorModeValue('gray.800', 'white')}>
                            <Box as="span" color={'gray.600'} fontSize="md">
                                Min Bid: &nbsp;
                            </Box>
                            <Box as="span" fontSize="md">
                                {tokenInfo.minBid}
                            </Box>
                        </Box>
                    </Flex>
                    <Flex justifyContent="space-between" alignContent="center" mt={5} hidden={!tokenInfo.isOwner}>
                        <Badge colorScheme="green">You are owner</Badge>
                    </Flex>
                    <Flex justifyContent="space-between" alignContent="center" mt={5} hidden={!tokenInfo.isOwner}>
                        <Link to={"/surface/view/" + id}>
                            <Button size="sm" colorScheme="blue">View Advertisement</Button>
                        </Link>
                    </Flex>
                </Box>
            </Flex>
            <Flex w={'full'} pl={10} pr={10} mt={5}>
                <Text fontSize="xl" fontWeight="semibold">
                    Active Bids:
                </Text>
                <Spacer/>
                <Box>
                    <NewBidModal tokenId={id} tokenInfo={tokenInfo}/>
                </Box>
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
    )
}