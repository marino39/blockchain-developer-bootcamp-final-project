import LandingLayout from "../components/layouts/LandingLayout";
import CardList from "../components/ui/Cards";
import {Button, Flex, Spacer, Text} from "@chakra-ui/react";
import {BiPlus} from "react-icons/all";
import {useWeb3Context} from "web3-react";

import {getJsonFromIPFS} from "../utils/ipfsUtils"

import AdvertisementSurface from "../contracts/AdvertisementSurface.json"
import ERC20 from "../contracts/ERC20.json"

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
            let tokenPayment = await advrtSurface.methods.getPaymentInfo(tokenId).call();

            let erc20 = new context.library.eth.Contract(ERC20.abi, tokenPayment.erc20);
            let tokenSymbol = await erc20.methods.symbol().call();
            let tokenDecimals = await erc20.methods.decimals().call();

            let minBid = tokenPayment.minBid / (10 ** tokenDecimals);

            let metadata = await getJsonFromIPFS(tokenURI.substr(7));
            advertisementSurfacesList.push({
                tokenId: tokenId,
                tokenURI: tokenURI,
                metadata: metadata,
                tokenSymbol: tokenSymbol,
                minBid: minBid
            });
        }

        let newItems = [];
        for (let i = 0; i < advertisementSurfacesList.length; i++) {
            let advSurf = advertisementSurfacesList[i];
            console.log(advSurf);
            newItems.push({
                tokenId: advSurf.tokenId,
                name: advSurf.metadata.properties.name,
                imageURL: advSurf.metadata.properties.image,
                tokenSymbol: advSurf.tokenSymbol,
                minBid: advSurf.minBid,
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