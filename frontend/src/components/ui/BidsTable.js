import React from "react";
import {Table, Thead, Tbody, Tfoot, Th, Tr, Td, Button, Box} from "@chakra-ui/react";
import {shortAddress} from "../../utils/ethAddressUtils";

export default function BidsTable(props) {
    const {items} = props;

    return (
        <Table variant="simple" size="sm" mt={5}>
            <Thead>
                <Tr>
                    <Td>Bidder</Td>
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
                        <Td>{(new Date(item.from * 1000)).toISOString()}</Td>
                        <Td>{(new Date(item.to * 1000)).toISOString()}</Td>
                        <Td>{item.duration}</Td>
                        <Td>{item.bid}</Td>
                        <Td>{item.total}</Td>
                        <Td>
                            <Button hidden={!item.isOwner}>Collect</Button>
                            <Button hidden={!item.isBidder}>Refund</Button>
                        </Td>
                    </Tr>
                )}
            </Tbody>
            <Tfoot>
            </Tfoot>
        </Table>
    );
}