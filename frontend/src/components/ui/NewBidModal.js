import {useWeb3Context} from "web3-react";
import {
    Alert, AlertIcon, AlertTitle,
    Box,
    Button, FormControl, FormLabel, Input, InputGroup, InputRightAddon, InputRightElement,
    Modal, ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
    useToast
} from "@chakra-ui/react";
import React, {useCallback, useEffect, useState} from "react";
import {BiPlus} from "react-icons/all";
import {Form, Formik} from "formik";

import AdvertisementSurfaceAuction from "../../contracts/AdvertisementSurfaceAuction.json"
import ERC20 from "../../contracts/ERC20.json"
import config from "../../config";
import BigNumber from "bignumber.js";

export default function NewBidModal(props) {
    const {tokenId, tokenInfo} = props;

    const toast = useToast()

    const initialRef = React.useRef()
    const finalRef = React.useRef()

    const context = useWeb3Context();

    const {isOpen, onOpen, onClose} = useDisclosure()

    const [initialized, setInitialized] = useState(false);
    const [approvedAmount, setApprovedAmount] = useState("0");
    const [isApproving, setIsApproving] = useState(false);

    const erc20 = new context.library.eth.Contract(ERC20.abi, tokenInfo.paymentTokenAddress);

    const advrtAuction = new context.library.eth.Contract(
        AdvertisementSurfaceAuction.abi,
        AdvertisementSurfaceAuction.networks[config.NetworkIdToChainId[context.networkId].toString()].address
    );

    const requiresApproval = (amount, bid, duration) => {
        let ret = (new BigNumber(amount)).isLessThan((new BigNumber(bid)).multipliedBy(new BigNumber(duration)));
        return ret
    }

    const approve = () => {
        setIsApproving(true);
        erc20.methods.approve(
            AdvertisementSurfaceAuction.networks[config.NetworkIdToChainId[context.networkId].toString()].address,
            "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        ).send({from: context.account})
            .on('transactionHash', function (hash) {
                toast({
                    title: "Approve sent!",
                    status: "info",
                    duration: 10000,
                    isClosable: true,
                });
            }).on('confirmation', function (confirmationNumber, receipt) {
            if (confirmationNumber === 1) {
                toast({
                    title: "Approve executed!",
                    status: "success",
                    duration: 10000,
                    isClosable: true,
                });
            }
        }).on('error', function (error, receipt) {
            toast({
                title: "Approve error!",
                description: error.message,
                status: "error",
                duration: 10000,
                isClosable: true,
            });
        });
    }

    useEffect(() => {
        if (tokenInfo.paymentToken === undefined) {
            return;
        }

        async function fetchData() {
            const amount = await erc20.methods.allowance(
                context.account,
                AdvertisementSurfaceAuction.networks[config.NetworkIdToChainId[context.networkId].toString()].address
            ).call()

            setApprovedAmount(
                (new BigNumber(amount)).div((new BigNumber("10"))
                    .pow(tokenInfo.paymentTokenDecimals)).toString()
            );

            setInitialized(true);
        }

        let approveSubscription = erc20.events.Approval({filter: {owner: context.account}}, function (error, event) {
            setIsApproving(false);
            setApprovedAmount((new BigNumber(event.returnValues.value)).div((new BigNumber("10"))
                .pow(tokenInfo.paymentTokenDecimals)).toString());
        });

        fetchData();

        return () => {
            approveSubscription.unsubscribe();
        }
    }, [initialized, tokenInfo]);

    if (!initialized) {
        setInitialized(true);
    }

    return (
        <Box>
            <Button onClick={onOpen}>
                <BiPlus size={20}/>&nbsp; New Bid
            </Button>
            <Modal
                initialFocusRef={initialRef}
                finalFocusRef={finalRef}
                isOpen={isOpen}
                onClose={onClose}
            >
                <ModalOverlay/>
                <Formik
                    initialValues={{
                        erc721: '',
                        advTokenId: '',
                        bid: tokenInfo.minBid,
                        startTime: (new Date()).toISOString(),
                        duration: '60'
                    }}
                    validate={async values => {
                        const errors = {};
                        if (!values.erc721) {
                            errors.erc721 = 'Required';
                        } else if (!context.library.utils.isAddress(values.erc721)) {
                            errors.erc721 = 'Invalid Ethereum address';
                        } else if (await context.library.eth.getCode(values.erc721) === "0x") {
                            errors.erc721 = 'Not contract address';
                        }

                        if (!values.advTokenId) {
                            errors.advTokenId = 'Required';
                        } else if (!/(^\d+)$/i.test(values.advTokenId)) {
                            errors.advTokenId = 'Must be a positive number';
                        } else {
                            if (values.erc721) {

                            }
                        }

                        if (!values.bid) {
                            errors.bid = 'Required';
                        } else if (!/(^\d+.\d+)|(^\d+)$/i.test(values.bid)) {
                            errors.bid = 'Must be a positive number';
                        } else if (values.bid < tokenInfo.minBid) {
                            errors.bid = 'Must be a greater than minimal bid';
                        }

                        if (!values.startTime) {
                            errors.startTime = 'Required';
                        } else if (!Date.parse(values.startTime)) {
                            errors.startTime = 'Please use format: 2021-11-14T18:20:00.111Z';
                        }

                        if (!values.duration) {
                            errors.duration = 'Required';
                        } else if (!/(^\d+.\d+)|(^\d+)$/i.test(values.duration)) {
                            errors.duration = 'Must be a positive number';
                        }

                        return errors;
                    }}
                    onSubmit={async (values, {setSubmitting}) => {
                        setSubmitting(true);

                        const bid = (new BigNumber(values.bid)).multipliedBy(
                            (new BigNumber("10")).pow(new BigNumber(tokenInfo.paymentTokenDecimals))
                        ).toString();

                        advrtAuction.methods.newBid(
                            {
                                bidder: context.account,
                                surTokenId: tokenId,
                                advERC721: values.erc721,
                                advTokenId: values.advTokenId,
                                bid: bid,
                                startTime: Math.floor(Date.parse(values.startTime) / 1000).toString(),
                                duration: values.duration,
                                state: 1,
                            }
                        ).send({from: context.account}).on('transactionHash', function (hash) {
                            toast({
                                title: "Transaction sent!",
                                description: "Your bid has been sent.",
                                status: "info",
                                duration: 10000,
                                isClosable: true,
                            });
                        }).on('confirmation', function (confirmationNumber, receipt) {
                            if (confirmationNumber === 1) {
                                toast({
                                    title: "Transaction Executed!",
                                    description: "Your bid has been added.",
                                    status: "success",
                                    duration: 10000,
                                    isClosable: true,
                                });
                            }
                        }).on('error', function (error, receipt) {
                            toast({
                                title: "Transaction error!",
                                description: error.message,
                                status: "error",
                                duration: 10000,
                                isClosable: true,
                            });
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
                                        <FormLabel>NFT Contract Address: </FormLabel>
                                        <Input ref={initialRef} name="erc721" value={values.erc721}
                                               placeholder="NFT contract address" onChange={handleChange}
                                               onBlur={handleBlur}
                                               isInvalid={errors.erc721 && touched.erc721}
                                        />
                                        <Alert status="error"
                                               hidden={!touched.erc721 || (touched.erc721 && !errors.erc721)}
                                               mt={2}>
                                            <AlertIcon/>
                                            <AlertTitle mr={2}>{errors.erc721}</AlertTitle>
                                        </Alert>
                                    </FormControl>

                                    <FormControl mt={4}>
                                        <FormLabel>Payment Token Address</FormLabel>
                                        <Input name="advTokenId" value={values.advTokenId}
                                               placeholder="Advertisement token Id"
                                               onChange={handleChange} onBlur={handleBlur}
                                               isInvalid={errors.advTokenId && touched.advTokenId}
                                        />
                                        <Alert status="error"
                                               hidden={!touched.advTokenId || (touched.advTokenId && !errors.advTokenId)}
                                               mt={2}>
                                            <AlertIcon/>
                                            <AlertTitle mr={2}>{errors.advTokenId}</AlertTitle>
                                        </Alert>
                                    </FormControl>

                                    <FormControl mt={4}>
                                        <FormLabel>Bid</FormLabel>
                                        <InputGroup>
                                            <Input name="bid" value={values.bid} placeholder="Your bid"
                                                   onChange={handleChange} onBlur={handleBlur}
                                                   isInvalid={errors.bid && touched.bid}
                                            />
                                            {requiresApproval(approvedAmount, values.bid, values.duration) ?
                                                <InputRightElement width="auto">
                                                    <Button colorScheme="blue" disabled={isApproving}
                                                            onClick={approve}>
                                                        {"Approve " + tokenInfo.paymentToken}
                                                    </Button>
                                                </InputRightElement> :
                                                <InputRightAddon children={tokenInfo.paymentToken}/>
                                            }

                                        </InputGroup>
                                        <Alert status="error"
                                               hidden={!touched.bid || (touched.bid && !errors.bid)} mt={2}>
                                            <AlertIcon/>
                                            <AlertTitle mr={2}>{errors.bid}</AlertTitle>
                                        </Alert>
                                    </FormControl>

                                    <FormControl mt={4}>
                                        <FormLabel>Start time: </FormLabel>
                                        <Input ref={initialRef} name="startTime" value={values.startTime}
                                               placeholder="The start of the advertisement" onChange={handleChange}
                                               onBlur={handleBlur}
                                               isInvalid={errors.startTime && touched.startTime}
                                        />
                                        <Alert status="error"
                                               hidden={!touched.startTime || (touched.startTime && !errors.startTime)}
                                               mt={2}>
                                            <AlertIcon/>
                                            <AlertTitle mr={2}>{errors.startTime}</AlertTitle>
                                        </Alert>
                                    </FormControl>

                                    <FormControl mt={4}>
                                        <FormLabel>Duration(s): </FormLabel>
                                        <Input ref={initialRef} name="duration" value={values.duration}
                                               placeholder="The duration of the advertisement in seconds"
                                               onChange={handleChange} onBlur={handleBlur}
                                               isInvalid={errors.duration && touched.duration}
                                        />
                                        <Alert status="error"
                                               hidden={!touched.duration || (touched.duration && !errors.duration)}
                                               mt={2}>
                                            <AlertIcon/>
                                            <AlertTitle mr={2}>{errors.duration}</AlertTitle>
                                        </Alert>
                                    </FormControl>
                                </ModalBody>

                                <ModalFooter>
                                    <Button colorScheme="blue" mr={3} type="submit"
                                            disabled={isSubmitting || requiresApproval(approvedAmount, values.bid, values.duration)}>
                                        Bid
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