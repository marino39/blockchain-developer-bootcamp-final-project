import {Center, Text} from "@chakra-ui/react";
import React from "react";

export default function InfoPage(props) {
    const {message} = props

    return (
        <Center w="full" h="100vh" alignContent="center" verticalAlign="center">
            <Text fontSize="xl" fontWeight="bold">{message}</Text>
        </Center>
    )
}