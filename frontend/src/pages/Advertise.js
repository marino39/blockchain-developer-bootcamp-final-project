import LandingLayout from "../components/layouts/LandingLayout";
import SurfaceTable from "../components/ui/SurfaceTable"

import {Button, Flex, Text} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import config from "../config";
import {useWeb3Context} from "web3-react";

import AdvertisementSurface from "../contracts/AdvertisementSurface.json"
import {getJsonFromIPFS} from "../utils/ipfsUtils";


function Advertise(props) {
    const context = useWeb3Context();

    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize,] = useState(10);
    const [totalSize, setTotalSize] = useState(0)

    const [initialized, setInitialized] = useState(false);

    const [advrtSurface,] = useState(new context.library.eth.Contract(
        AdvertisementSurface.abi,
        AdvertisementSurface.networks[config.NetworkIdToChainId[context.networkId].toString()].address
    ));

    useEffect(() => {
        async function fetchData() {
            const total = await advrtSurface.methods.totalSupply().call();
            setTotalSize(total);
        }

        fetchData();

    }, [initialized, advrtSurface]);

    useEffect(() => {
        async function fetchData() {
            const total = await advrtSurface.methods.totalSupply().call()

            let tokens = [];
            for (let i = (page - 1) * pageSize; i < Math.min(page * pageSize, totalSize); i++) {
                let tokenId = await advrtSurface.methods.tokenByIndex(i).call();
                let tokenURI = await advrtSurface.methods.tokenURI(tokenId).call();
                let tokenMetadata = await getJsonFromIPFS(tokenURI.substr(7));

                tokens.push({
                    tokenId: tokenId,
                    name: tokenMetadata.properties.name,
                    location: tokenMetadata.properties.location,
                    description: tokenMetadata.properties.description
                });
            }

            setItems(tokens);
            setTotalSize(total);
        }

        fetchData();

    }, [advrtSurface, totalSize, page, pageSize]);

    if (!initialized) {
        setInitialized(true);
    }

    return (
        <LandingLayout>
            <Flex w={'full'} pl={10} pr={10}>
                <Text fontSize="xl" fontWeight="semibold">
                    Advertise
                </Text>
            </Flex>
            <SurfaceTable items={items}/>
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

export default Advertise;