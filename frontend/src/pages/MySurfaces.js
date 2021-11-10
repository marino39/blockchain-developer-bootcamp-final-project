import LandingLayout from "../components/layouts/LandingLayout";
import CardList from "../components/ui/Cards";
import {Button, Flex, Spacer, Text} from "@chakra-ui/react";
import {BiPlus} from "react-icons/all";
import {useWeb3Context} from "web3-react";

import AdvertisementSurface from "../contracts/AdvertisementSurface.json"
import {useEffect, useState} from "react";

function MySurfaces(props) {
    const context = useWeb3Context();
    const [items, setItems] = useState([]);
    const [balance, setBalance] = useState(0);

    const advrtSurface = new context.library.eth.Contract(
        AdvertisementSurface.abi,
        AdvertisementSurface.networks["5777"].address
    );

    useEffect(async () => {
        let advertisementSurfacesList = []
        for (let i = 0; i < balance; i++) {
            let tokenId = await advrtSurface.methods.tokenOfOwnerByIndex(context.account, i).call();
            let tokenURI = await advrtSurface.methods.tokenURI(tokenId).call();

            let ipfsGatewayURL = 'https://ipfs.io/ipfs/' + tokenURI.substr(7);

            let response = await fetch(ipfsGatewayURL);
            let data = await response.json();

            advertisementSurfacesList.push({tokenId: tokenId, tokenURI: tokenURI, data: data})
        }

        let newItems = []
        for (let i = 0; i < advertisementSurfacesList.length; i++) {
            let advSurf = advertisementSurfacesList[i];
            newItems.push({
                tokenId: advSurf.tokenId,
                name: advSurf.data.properties.name,
                imageURL: advSurf.data.properties.image,
                tokenSymbol: "DAI",
                minPrice: 10,
            });
        }

        setItems(newItems);
    }, [balance])

    advrtSurface.methods.balanceOf(context.account).call().then(
        (newBalance) => {
            if (balance !== newBalance) {
                setBalance(newBalance);
            }
        }
    );

    return (
        <LandingLayout>
            <Flex w={'full'} pl={10} pr={10}>
                <Text fontSize="xl" fontWeight="semibold">
                    My Surfaces
                </Text>
                <Spacer/>
                <Button>
                    <BiPlus size={20}/>&nbsp; Register Surface
                </Button>
            </Flex>
            <CardList items={items}/>
        </LandingLayout>
    );
}

export default MySurfaces;