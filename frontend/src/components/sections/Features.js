import {
    Stack,
    Container,
    Box,
    Flex,
    Text,
    Heading,
    SimpleGrid, Image,
} from '@chakra-ui/react';

import FeaturedImage from "../../images/featured.png"

export default function StatsGridWithImage() {
    return (
        <Box bg={'gray.800'} w={'100%'} position={'relative'}>
            <Image
                h={'300px'}
                w={'full'}
                rounded={10}
                src={ FeaturedImage }
                objectFit={'cover'}
            />
            <Container maxW={'7xl'} zIndex={10} position={'relative'}>
                <Stack direction={{ base: 'column', lg: 'row' }}>
                    <Stack
                        flex={1}
                        color={'gray.400'}
                        justify={{ lg: 'center' }}
                        py={{ base: 4, md: 10, xl: 10 }}>
                        <Box mb={{ base: 8, md: 15 }}>
                            <Text
                                fontFamily={'heading'}
                                fontWeight={700}
                                textTransform={'uppercase'}
                                mb={3}
                                fontSize={'xl'}
                                color={'gray.500'}>
                                Technology
                            </Text>
                            <Heading
                                color={'white'}
                                mb={5}
                                fontSize={{ base: '3xl', md: '5xl' }}>
                                21st century advertisement
                            </Heading>
                            <Text fontSize={'xl'} color={'gray.400'}>
                                The AdvertisementMarket™ technology allows you to tokenize your advertisement infrastructure,
                                auction advertisement surfaces, optimise your advertisement assets to receive the most profit.
                                The blockchain technology allows you to collect payments immediately after advertisement contract
                                has been fulfilled, monitor your assets and their profitability.
                            </Text>
                        </Box>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                            {stats.map((stat) => (
                                <Box key={stat.title}>
                                    <Text
                                        fontFamily={'heading'}
                                        fontSize={'3xl'}
                                        color={'white'}
                                        mb={3}>
                                        {stat.title}
                                    </Text>
                                    <Text fontSize={'xl'} color={'gray.400'}>
                                        {stat.content}
                                    </Text>
                                </Box>
                            ))}
                        </SimpleGrid>
                    </Stack>

                </Stack>
            </Container>
        </Box>
    );
}

const StatsText = ({ children }) => (
    <Text as={'span'} fontWeight={700} color={'white'}>
        {children}
    </Text>
);

const stats = [
    {
        title: '10+',
        content: (
            <>
                <StatsText>Tokenization</StatsText> for your advertisement infrastructure
            </>
        ),
    },
    {
        title: '24/7',
        content: (
            <>
                <StatsText>Live Analytics</StatsText> of your assets bids, schedules and profitability
            </>
        ),
    },
    {
        title: '300%',
        content: (
            <>
                <StatsText>Improvement</StatsText> in asset utilization
            </>
        ),
    },
    {
        title: '250M+',
        content: (
            <>
                <StatsText>Advertisement Assets</StatsText> currently connected and monitored by the
                AdvertisementMarket™ software
            </>
        ),
    },
];