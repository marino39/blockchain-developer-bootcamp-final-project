import React from "react"
import { Link } from "react-router-dom"
import { Box, Flex, Text, Button, Stack, PseudoBox } from "@chakra-ui/react"
import {BiX, BiMenu} from "react-icons/bi";
import Logo from "../ui/Logo"

const MenuItems = props => {
    const { children, isLast, to = "/", ...rest } = props
    return (
        <Text
            mb={{ base: isLast ? 0 : 8, sm: 0 }}
            mr={{ base: 0, sm: isLast ? 0 : 8 }}
            display="block"
            {...rest}
        >
            <Link to={to}>{children}</Link>
        </Text>
    )
}

const Header = props => {
    const [show, setShow] = React.useState(false)
    const toggleMenu = () => setShow(!show)

    return (
        <Flex
            as="nav"
            align="center"
            justify="space-between"
            wrap="wrap"
            w="100%"
            p={8}
            bg={["primary.500", "primary.500", "transparent", "transparent"]}
            color={["white", "white", "primary.700", "primary.700"]}
            {...props}
        >
            <Flex align="center">
                <Logo
                    w="100px"
                    color={["white", "white", "primary.500", "primary.500"]}
                />
            </Flex>

            <Box display={{ base: "block", md: "none" }} onClick={toggleMenu}>
                {show ? <BiX/> : <BiMenu/>}
            </Box>

            <Box
                display={{ base: show ? "block" : "none", md: "block" }}
                flexBasis={{ base: "100%", md: "auto" }}
            >
                <Flex
                    align={["center", "center", "center", "center"]}
                    justify={["center", "space-between", "flex-end", "flex-end"]}
                    direction={["column", "row", "row", "row"]}
                    pt={[4, 4, 0, 0]}
                >
                    <MenuItems to="/mySurfaces">My Surfaces</MenuItems>
                    <MenuItems to="/advertise">Advertise</MenuItems>
                    <MenuItems to="#" isLast>
                        <Button
                            size="sm"
                            rounded="md"
                            color={["primary.500", "primary.500", "white", "white"]}
                            bg={["blue.700", "blue.700", "primary.500", "primary.500"]}
                            _hover={{
                                bg: [
                                    "primary.100",
                                    "primary.100",
                                    "primary.600",
                                    "primary.600",
                                ],
                            }}
                        >
                            Connect Wallet
                        </Button>
                    </MenuItems>
                </Flex>
            </Box>
        </Flex>
    )
}

export default Header