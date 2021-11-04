import React from "react"
import { Flex } from "@chakra-ui/react"
import Header from "../sections/Header"
import Footer from "../sections/Footer" // will add this in the part 2

export default function LandingLayout(props) {
    return (
        <Flex
            direction="column"
            align="center"
            maxW={{ xl: "1200px" }}
            m="0 auto"
            {...props}
        >
            <Header />
            {props.children}
            <Footer />
        </Flex>
    )
}