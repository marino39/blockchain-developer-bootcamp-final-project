import {useWeb3Context} from "web3-react";
import {
    Alert, AlertIcon, AlertTitle,
    Box,
    Button, FormControl, FormLabel, Input, InputGroup, InputRightAddon,
    Modal, ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
    useToast
} from "@chakra-ui/react";
import React, {useState} from "react";
import {BiPlus} from "react-icons/all";
import {Form, Formik} from "formik";
import {getJsonFromIPFS} from "../../utils/ipfsUtils";

import AdvertisementSurface from "../../contracts/AdvertisementSurface.json"
import ERC20 from "../../contracts/ERC20.json"
import config from "../../config";
import BigNumber from "bignumber.js";

export default function RegisterSurfaceModal(props) {
    const toast = useToast()

    const context = useWeb3Context();

    const {isOpen, onOpen, onClose} = useDisclosure()

    const initialRef = React.useRef()
    const finalRef = React.useRef()

    let [erc20Symbol, setERC20Symbol] = useState("?")

    function onOpenWrapped() {
        setERC20Symbol("?");
        onOpen();
    }

    return (
        <Box>
            <Button onClick={onOpenWrapped}>
                <BiPlus size={20}/>&nbsp; Register Surface
            </Button>
            <Modal
                initialFocusRef={initialRef}
                finalFocusRef={finalRef}
                isOpen={isOpen}
                onClose={onClose}
            >
                <ModalOverlay/>
                <Formik
                    initialValues={{metadata: '', erc20: '', minBid: ''}}
                    validate={async values => {
                        const errors = {};
                        if (!values.metadata) {
                            errors.metadata = 'Required';
                        } else if (await getJsonFromIPFS(values.metadata) === null) {
                            errors.metadata = 'Invalid IPFS CID';
                        }

                        if (!values.erc20) {
                            errors.erc20 = 'Required';
                        } else if (!context.library.utils.isAddress(values.erc20)) {
                            errors.erc20 = 'Invalid Ethereum address';
                        } else if (await context.library.eth.getCode(values.erc20) === "0x") {
                            errors.erc20 = 'Not contract address';
                        } else {
                            let erc20 = new context.library.eth.Contract(ERC20.abi, values.erc20);
                            let tokenSymbol = await erc20.methods.symbol().call();
                            if (!tokenSymbol) {
                                errors.erc20 = 'Not ERC20 contract';
                            }
                            setERC20Symbol(tokenSymbol);
                        }

                        if (!values.minBid) {
                            errors.minBid = 'Required';
                        } else if (!/(^\d+.\d+)|(^\d+)$/i.test(values.minBid)) {
                            errors.minBid = 'Must be a positive number';
                        }
                        return errors;
                    }}
                    onSubmit={async (values, {setSubmitting}) => {
                        setSubmitting(true);

                        const advSurface = new context.library.eth.Contract(
                            AdvertisementSurface.abi,
                            AdvertisementSurface.networks[config.NetworkIdToChainId[context.networkId].toString()].address
                        );
                        let erc20 = new context.library.eth.Contract(ERC20.abi, values.erc20);
                        let tokenDecimals = await erc20.methods.decimals().call();

                        const minBid = (new BigNumber(values.minBid)).multipliedBy(
                            (new BigNumber("10")).pow(new BigNumber(tokenDecimals))
                        ).toString();

                        await advSurface.methods.registerAdvertisementSurface(
                            values.metadata, {erc20: values.erc20, minBid: minBid}
                        ).send({from: context.account});

                        toast({
                            title: "Transaction submitted!",
                            description: "Your transaction has been submitted. Your surface will appear in the list once" +
                                " confirmed",
                            status: "success",
                            duration: 10000,
                            isClosable: true,
                        });

                        onClose();
                    }}
                >
                    {({
                          values,
                          errors,
                          touched,
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          isSubmitting,
                          /* and other goodies */
                      }) => (
                        <Form>
                            <ModalContent>
                                <ModalHeader>Register Surface</ModalHeader>
                                <ModalCloseButton/>
                                <ModalBody pb={6}>
                                    <FormControl>
                                        <FormLabel>Metadata</FormLabel>
                                        <Input ref={initialRef} name="metadata" value={values.metadata}
                                               placeholder="IPFS CID" onChange={handleChange} onBlur={handleBlur}
                                               isInvalid={errors.metadata && touched.metadata}
                                        />
                                        <Alert status="error"
                                               hidden={!touched.metadata || (touched.metadata && !errors.metadata)}
                                               mt={2}>
                                            <AlertIcon/>
                                            <AlertTitle mr={2}>{errors.metadata}</AlertTitle>
                                        </Alert>
                                    </FormControl>

                                    <FormControl mt={4}>
                                        <FormLabel>Payment Token Address</FormLabel>
                                        <Input name="erc20" value={values.erc20} placeholder="ERC20 Token Address"
                                               onChange={handleChange} onBlur={handleBlur}
                                               isInvalid={errors.erc20 && touched.erc20}
                                        />
                                        <Alert status="error"
                                               hidden={!touched.erc20 || (touched.erc20 && !errors.erc20)} mt={2}>
                                            <AlertIcon/>
                                            <AlertTitle mr={2}>{errors.erc20}</AlertTitle>
                                        </Alert>
                                    </FormControl>

                                    <FormControl mt={4}>
                                        <FormLabel>Minimum Bid</FormLabel>
                                        <InputGroup>
                                            <Input name="minBid" value={values.minBid} placeholder="Minimum Bid"
                                                   onChange={handleChange} onBlur={handleBlur}
                                                   isInvalid={errors.minBid && touched.minBid}
                                            />
                                            <InputRightAddon children={erc20Symbol}/>
                                        </InputGroup>
                                        <Alert status="error"
                                               hidden={!touched.minBid || (touched.minBid && !errors.minBid)} mt={2}>
                                            <AlertIcon/>
                                            <AlertTitle mr={2}>{errors.minBid}</AlertTitle>
                                        </Alert>
                                    </FormControl>
                                </ModalBody>

                                <ModalFooter>
                                    <Button colorScheme="blue" mr={3} type="submit" disabled={isSubmitting}>
                                        Register
                                    </Button>
                                    <Button onClick={onClose}>Cancel</Button>
                                </ModalFooter>
                            </ModalContent>
                        </Form>)}
                </Formik>
            </Modal>
        </Box>
    );
}