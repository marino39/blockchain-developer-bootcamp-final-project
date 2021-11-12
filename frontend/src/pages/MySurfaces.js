import React from "react"
import {useEffect, useState} from "react";

import config from "../config"
import {getJsonFromIPFS} from "../utils/ipfsUtils"

import LandingLayout from "../components/layouts/LandingLayout";
import CardList from "../components/ui/Cards";
import RegisterSurfaceModal from "../components/ui/RegisterSurfaceModal";

import {
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

function MySurfaces(props) {
    const context = useWeb3Context();
    const [items, setItems] = useState([]);
    const [initialized, setInitialized] = useState(false);

    const advrtSurface = new context.library.eth.Contract(
        AdvertisementSurface.abi,
        AdvertisementSurface.networks[config.NetworkIdToChainId[context.networkId].toString()].address
    );

    useEffect(() => {
        async function fetchData() {
            const balance = await advrtSurface.methods.balanceOf(context.account).call();

            let advertisementSurfacesList = []
            for (let i = 0; i < balance; i++) {
                let tokenId = await advrtSurface.methods.tokenOfOwnerByIndex(context.account, i).call();
                let tokenInfo = await getSurfaceInfo(context, advrtSurface, tokenId);
                advertisementSurfacesList.push(tokenInfo);
            }

            let newItems = [];
            for (let i = 0; i < advertisementSurfacesList.length; i++) {
                newItems.push(tokenInfoToCard(advertisementSurfacesList[i]));
            }

            setItems(newItems);
        }

        let subscription = advrtSurface.events.Transfer(
            {filter: {to: context.account}},
            function (error, event) {
                console.log(event);
            }
        );

        fetchData();

        return () => {
            subscription.unsubscribe();
        }
    }, [initialized])

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
        </LandingLayout>
    );
}

export default MySurfaces;