import React from "react"
import {Link} from "react-router-dom"
import {
    Box,
    Flex,
    Text,
    Button,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, HStack
} from "@chakra-ui/react"
import {BiX, BiMenu, BiUser} from "react-icons/bi";
import Logo from "../ui/Logo"
import {useWeb3Context} from "web3-react";
import EthereumAddress from "../ui/EthereumAddress";

const MenuItems = props => {
    const { children, isLast, to = "/", ...rest } = props;
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

const WalletStateMenuItem = props => {
    const context = useWeb3Context();
    const { isOpen, onOpen, onClose } = useDisclosure();

    function activate() {
        context.setConnector('MetaMask');
    }

    const WalletSelection = (<MenuItems to="#" isLast>
        <Button
            onClick={onOpen}
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

        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Select Wallet Provider</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Button onClick={activate}>
                        MetaMask
                    </Button>
                </ModalBody>
                <ModalFooter/>
            </ModalContent>
        </Modal>
    </MenuItems>)

    if (!context.active && !context.error) {
        return WalletSelection
    } else if (context.error) {
        return WalletSelection
    } else {
        return (<Box>
            <HStack >
                <BiUser/>
                <EthereumAddress/>
            </HStack>
        </Box>)
    }
}

const Header = props => {
    const context = useWeb3Context();

    const [show, setShow] = React.useState(false)
    const toggleMenu = () => setShow(!show)

    let menuItems = [];
    if (context.active === true) {
        menuItems.push(<MenuItems to="/mySurfaces">My Surfaces</MenuItems>);
        menuItems.push(<MenuItems to="/myBids">My Bids</MenuItems>);
        menuItems.push(<MenuItems to="/advertise">Advertise</MenuItems>);
    }
    menuItems.push(<WalletStateMenuItem/>)

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
                <Link to={'/'}>
                  <Logo
                      w="100px"
                      color={["white", "white", "primary.500", "primary.500"]}
                  />
                </Link>
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
                    {menuItems}
                </Flex>
            </Box>
        </Flex>
    )
}

export default Header