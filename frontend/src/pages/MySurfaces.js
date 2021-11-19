import React from "react"
import {useEffect, useState} from "react";

import config from "../config"
import {getJsonFromIPFS} from "../utils/ipfsUtils"

import LandingLayout from "../components/layouts/LandingLayout";
import CardList from "../components/ui/Cards";
import RegisterSurfaceModal from "../components/ui/RegisterSurfaceModal";

import {
    Button,
    Flex,
    Spacer,
    Text,
} from "@chakra-ui/react";

import {useWeb3Context} from "web3-react";

import AdvertisementSurface from "../contracts/AdvertisementSurface.json"
import ERC20 from "../contracts/ERC20.json"
import BigNumber from "bignumber.js";

async function getSurfaceInfo(context, advrtSurface, tokenId) {
    let tokenURI = await advrtSurface.methods.tokenURI(tokenId).call();
    let tokenPayment = await advrtSurface.methods.getPaymentInfo(tokenId).call();

    let erc20 = new context.library.eth.Contract(ERC20.abi, tokenPayment.erc20);
    let tokenSymbol = await erc20.methods.symbol().call();
    let tokenDecimals = await erc20.methods.decimals().call();

    let minBid = (new BigNumber(tokenPayment.minBid)).div(
        (new BigNumber("10")).pow(new BigNumber(tokenDecimals))
    ).toNumber();

    let metadata = await getJsonFromIPFS(tokenURI.substr(7));
    return {
        tokenId: tokenId,
        tokenURI: tokenURI,
        metadata: metadata,
        tokenSymbol: tokenSymbol,
        minBid: minBid
    };
}

function tokenInfoToCard(tokenInfo) {
    return {
        tokenId: tokenInfo.tokenId,
        name: tokenInfo.metadata.properties.name,
        imageURL: tokenInfo.metadata.properties.image,
        tokenSymbol: tokenInfo.tokenSymbol,
        minBid: tokenInfo.minBid,
    };
}

function MySurfaces() {
    const context = useWeb3Context();

    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize,] = useState(6);
    const [totalSize, setTotalSize] = useState(0)

    const [initialized, setInitialized] = useState(false);

    const [advrtSurface,] = useState(new context.library.eth.Contract(
        AdvertisementSurface.abi,
        AdvertisementSurface.networks[config.NetworkIdToChainId[context.networkId].toString()].address
    ));

    useEffect(() => {
        async function fetchData() {
            const balance = await advrtSurface.methods.balanceOf(context.account).call();

            setTotalSize(balance);
        }

        fetchData();
    }, [initialized, context, advrtSurface]);

    useEffect(() => {
        async function fetchData() {
            const balance = await advrtSurface.methods.balanceOf(context.account).call();

            let newItems = [];
            for (let i = (page - 1) * pageSize; i < Math.min(page * pageSize, totalSize); i++) {
                let tokenId = await advrtSurface.methods.tokenOfOwnerByIndex(context.account, i).call();
                let tokenInfo = await getSurfaceInfo(context, advrtSurface, tokenId);
                newItems.push(tokenInfoToCard(tokenInfo));
            }

            setItems(newItems);
            setTotalSize(balance);
        }

        fetchData();
    }, [context, advrtSurface, page, pageSize, totalSize])

    useEffect(() => {
        let subscriptionTransferTo = advrtSurface.events.Transfer(
            {filter: {to: context.account}},
            async function (error, event) {
                if (items.length < pageSize) {
                    let tokenId = event.returnValues.tokenId;

                    let found = false;
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].tokenId === tokenId) {
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        let newItems = [...items];
                        let tokenInfo = await getSurfaceInfo(context, advrtSurface, tokenId);
                        newItems.push(tokenInfoToCard(tokenInfo));
                        setItems(newItems);
                    }
                } else {
                    const balance = await advrtSurface.methods.balanceOf(context.account).call();
                    setTotalSize(balance);
                }
            }
        );

        let subscriptionTransferFrom = advrtSurface.events.Transfer(
            {filter: {from: context.account}},
            async function (error, event) {
                let tokenId = event.returnValues.tokenId;

                let found = false;
                let newItems = []
                for (let i = 0; i < items.length; i++) {
                    if (items[i].tokenId === tokenId) {
                        found = true;
                        continue;
                    }
                    newItems.push(items[i])
                }

                if (!found) {
                    setItems(newItems);
                }
            }
        );

        return () => {
            subscriptionTransferTo.unsubscribe();
            subscriptionTransferFrom.unsubscribe();
        }
    }, [context, advrtSurface, items, pageSize])

    if (!initialized) {
        setInitialized(true);
    }

    return (
        <LandingLayout>
            <Flex w={'full'} pl={10} pr={10}>
                <Text fontSize="xl" fontWeight="semibold">
                    My Surfaces
                </Text>
                <Spacer/>
                <RegisterSurfaceModal/>
            </Flex>
            <CardList items={items}/>
            <Flex w="full" alignItems="center" justifyContent="center" mb={10}>
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

export default MySurfaces;