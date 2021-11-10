import {Box, Button, Flex, Image, SimpleGrid, useColorModeValue} from "@chakra-ui/react";
import {useState} from "react";


function Card(props) {
    const {item} = props
    return (
        <Box bg={useColorModeValue('white', 'gray.800')}
             borderWidth="1px"
             rounded="lg"
             shadow="lg"
             position="relative">

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
        </Box>)
}

export default function CardList(props) {
    const {items, pageSize} = props;
    const [page, setPage] = useState(1);

    let pSize = 6;
    if (pageSize !== undefined && pageSize !== 0) {
        pSize = pageSize;
    }

    let pageItems = [];
    for (let i = pSize * (page - 1); i < pSize * page; i++) {
        if (i >= items.length) {
            break;
        }

        pageItems.push(items[i]);
    }

    return (<Box w="full">
        <SimpleGrid minChildWidth={300} spacing={8} m={10}>
            {pageItems.map((item) =>
                <Card key={item.tokenId} item={item}/>
            )}
        </SimpleGrid>
        <Flex w="full" alignItems="center" justifyContent="center" mb={10}>
            {page - 1 > 0 && (<Button m={1} onClick={() => {
                setPage(page - 1);
            }}>{page - 1}</Button>)}
            <Button m={1}>{page}</Button>
            {items.length > page * pSize && (<Button m={1} onClick={() => {
                setPage(page + 1);
            }}>{page + 1}</Button>)}
        </Flex>
    </Box>)
}