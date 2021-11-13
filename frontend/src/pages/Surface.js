import {Badge, Box, Button, Flex, Image, Spacer, Text, useColorModeValue} from "@chakra-ui/react";
import {useParams} from "react-router-dom";
import LandingLayout from "../components/layouts/LandingLayout";
import React, {useEffect, useState} from "react";
import {useWeb3Context} from "web3-react";

import BigNumber from "bignumber.js";

import config from "../config";
import {getJsonFromIPFS} from "../utils/ipfsUtils";

import AdvertisementSurface from "../contracts/AdvertisementSurface.json"
import ERC20 from "../contracts/ERC20.json"


export default function Surface(props) {
    const {id} = useParams();
    const context = useWeb3Context();
    const [initialized, setInitialized] = useState(false);
    const [tokenInfo, setTokenInfo] = useState({});


    const advrtSurface = new context.library.eth.Contract(
        AdvertisementSurface.abi,
        AdvertisementSurface.networks[config.NetworkIdToChainId[context.networkId].toString()].address
    );

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
                minBid: minBid,
                isOwner: owner === context.account
            });
        }

        fetchData();
    }, [initialized]);

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
                </Box>
            </Flex>
            <Flex w={'full'} pl={10} pr={10} mt={5} mb={5}>
                <Text fontSize="xl" fontWeight="semibold">
                    Active Bids:
                </Text>
                <Spacer/>
                <Box>
                    <Button>New Bid</Button>
                </Box>
            </Flex>
        </LandingLayout>
    )
}