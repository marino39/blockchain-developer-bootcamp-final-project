import React, {useEffect, useReducer, useState} from "react";
import {Table, Thead, Tbody, Tfoot, Th, Tr, Td, Button, Box, useToast, Text} from "@chakra-ui/react";
import {shortAddress} from "../../utils/ethAddressUtils";
import {useWeb3Context} from "web3-react";
import config from "../../config";

import AdvertisementSurfaceAuction from "../../contracts/AdvertisementSurfaceAuction.json"

function stateToString(state) {
    if (state === "0") {
        return "Outbid";
    } else if (state === "1") {
        return "Active";
    } else if (state === "2") {
        return "Finished";
    } else {
        return "Unknown"
    }
}

export default function BidsTable(props) {
    const {items} = props;

    const toast = useToast()

    const context = useWeb3Context();

    const [foceX, forceUpdate] = useReducer((x) => x + 1, 0);

    const advrtAuction = new context.library.eth.Contract(
        AdvertisementSurfaceAuction.abi,
        AdvertisementSurfaceAuction.networks[config.NetworkIdToChainId[context.networkId].toString()].address
    );

    const isCollectDisabled = (to) => {
        return (new Date(to * 1000)) >= new Date();
    }

    const collect = (bidId) => {
        advrtAuction.methods.collectBid(bidId).send({from: context.account})
            .on('transactionHash', function (hash) {
                toast({
                    title: "Transaction sent!",
                    description: "Your collect order has been sent.",
                    status: "info",
                    duration: 10000,
                    isClosable: true,
                });
            }).on('confirmation', function (confirmationNumber, receipt) {
            if (confirmationNumber === 1) {
                toast({
                    title: "Transaction Executed!",
                    description: "Your collect order has been added.",
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
    }

    useEffect(() => {
        setTimeout(() => {
            forceUpdate();
        }, 1000);
    }, [foceX]);

    const refund = (bidId) => {
        advrtAuction.methods.refundBid(bidId).send({from: context.account})
            .on('transactionHash', function (hash) {
                toast({
                    title: "Transaction sent!",
                    description: "Your refund order has been sent.",
                    status: "info",
                    duration: 10000,
                    isClosable: true,
                });
            }).on('confirmation', function (confirmationNumber, receipt) {
            if (confirmationNumber === 1) {
                toast({
                    title: "Transaction Executed!",
                    description: "Your refund order has been added.",
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
    }

    return (
        <Table variant="simple" size="sm" mt={5}>
            <Thead>
                <Tr>
                    <Td>Bidder</Td>
                    <Td>State</Td>
                    <Td>From</Td>
                    <Td>To</Td>
                    <Td>Duration</Td>
                    <Td>Bid</Td>
                    <Td>Total</Td>
                    <Td>Actions</Td>
                </Tr>
            </Thead>
            <Tbody>
                {items.map((item) =>
                    <Tr key={item.bidId}>
                        <Td>{shortAddress(item.bidder)}</Td>
                        <Td>{stateToString(item.state)}</Td>
                        <Td>{(new Date(item.from * 1000)).toISOString()}</Td>
                        <Td>{(new Date(item.to * 1000)).toISOString()}</Td>
                        <Td>{item.duration}</Td>
                        <Td>{item.bid} {item.tokenSymbol}</Td>
                        <Td>{item.total} {item.tokenSymbol}</Td>
                        <Td>
                            <Button size="sm" hidden={!item.isOwner} disabled={isCollectDisabled(item.to)}
                                    onClick={() => {
                                        collect(item.bidId)
                                    }}>
                                Collect
                            </Button>
                            <Button size="sm" hidden={!item.isBidder} disabled={stateToString(item.state) !== "Outbid"}
                                    onClick={() => {
                                        refund(item.bidId)
                                    }}>
                                Refund
                            </Button>
                        </Td>
                    </Tr>
                )}
            </Tbody>
            <Tfoot>
            </Tfoot>
        </Table>
    );
}