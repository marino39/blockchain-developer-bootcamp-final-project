import LandingLayout from "../components/layouts/LandingLayout";
import CardList from "../components/ui/Cards";
import {Button, Flex, Spacer, Text} from "@chakra-ui/react";
import {BiPlus} from "react-icons/all";

function MySurfaces(props) {
    const items = [
        {
            isNew: true,
            imageURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F34%2F86%2F6d%2F34866d3ad6c701dc0cfb1c5cffa4c3b4.jpg&f=1&nofb=1",
            name: "The New York Digital Billboard",
            location: "Times Square, New York, Manhattan, New York, United States of America",
            tokenSymbol: "DAI",
            minPrice: 10,
        },
        {
            isNew: true,
            imageURL: "https://o.aolcdn.com/images/dims?quality=85&image_uri=https:%2F%2Fs.aolcdn.com%2Fhss%2Fstorage%2Fmidas%2F7fd9af0fa2e664a83a5f425d17fb57b4%2F205804456%2Fpiccadillylights.jpg&client=amp-blogside-v2&signature=1e3e05935efd274642f0f8fa188814ca1c90e801",
            name: "Piccadilly Circus' billboard #1",
            location: "Piccadilly Circus, London, United Kingdom",
            tokenSymbol: "DAI",
            minPrice: 10,
        },

        {
            isNew: true,
            imageURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F34%2F86%2F6d%2F34866d3ad6c701dc0cfb1c5cffa4c3b4.jpg&f=1&nofb=1",
            name: "The New York Digital Billboard",
            location: "Times Square, New York, Manhattan, New York, United States of America",
            tokenSymbol: "DAI",
            minPrice: 10,
        },
        {
            isNew: true,
            imageURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F34%2F86%2F6d%2F34866d3ad6c701dc0cfb1c5cffa4c3b4.jpg&f=1&nofb=1",
            name: "The New York Digital Billboard",
            location: "Times Square, New York, Manhattan, New York, United States of America",
            tokenSymbol: "DAI",
            minPrice: 10,
        },
        {
            isNew: true,
            imageURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F34%2F86%2F6d%2F34866d3ad6c701dc0cfb1c5cffa4c3b4.jpg&f=1&nofb=1",
            name: "The New York Digital Billboard",
            location: "Times Square, New York, Manhattan, New York, United States of America",
            tokenSymbol: "DAI",
            minPrice: 10,
        },
        {
            isNew: true,
            imageURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F34%2F86%2F6d%2F34866d3ad6c701dc0cfb1c5cffa4c3b4.jpg&f=1&nofb=1",
            name: "The New York Digital Billboard",
            location: "Times Square, New York, Manhattan, New York, United States of America",
            tokenSymbol: "DAI",
            minPrice: 10,
        },
    ]

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