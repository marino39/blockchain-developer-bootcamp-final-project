import {Box, Flex, Image, SimpleGrid, useColorModeValue} from "@chakra-ui/react";
import {Link} from "react-router-dom";


function Card(props) {
    const {item} = props
    return (
        <Box bg={useColorModeValue('white', 'gray.800')}
             borderWidth="1px"
             rounded="lg"
             shadow="lg"
             position="relative">
            <Link to={"/surface/" + item.tokenId}>
                <Image
                    src={item.imageURL}
                    alt={`Picture of ${item.name}`}
                    roundedTop="lg"
                />

                <Box p="6">
                    <Flex mt="1" justifyContent="space-between" alignContent="center">
                        <Box
                            fontSize="2xl"
                            fontWeight="semibold"
                            as="h4"
                            lineHeight="tight"
                            isTruncated>
                            {item.name}
                        </Box>
                    </Flex>

                    <Flex justifyContent="space-between" alignContent="center">
                        <Box fontSize="2xl" color={useColorModeValue('gray.800', 'white')}>
                            <Box as="span" color={'gray.600'} fontSize="md">
                                Min Bid: &nbsp;
                            </Box>
                            <Box as="span" fontSize="sm">
                                {item.minBid.toFixed(2)} {item.tokenSymbol}
                            </Box>
                        </Box>
                    </Flex>
                </Box>
            </Link>
        </Box>)
}

export default function CardList(props) {
    const {items} = props;

    return (<Box w="full">
        <SimpleGrid minChildWidth={300} spacing={8} m={10}>
            {items.map((item) =>
                <Card key={item.tokenId} item={item}/>
            )}
        </SimpleGrid>
    </Box>)
}