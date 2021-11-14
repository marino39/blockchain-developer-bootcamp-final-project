import React from "react";
import {Table, Thead, Tbody, Tfoot, Th, Tr, Td, Button} from "@chakra-ui/react";
import {Link} from "react-router-dom";

export default function SurfaceTable(props) {
    const {items} = props;

    return (
        <Table variant="simple" mt={5}>
            <Thead>
                <Tr>
                    <Td>Id</Td>
                    <Td>Name</Td>
                    <Td>Description</Td>
                    <Td>Location</Td>
                    <Td>Actions</Td>
                </Tr>
            </Thead>
            <Tbody>
                {items.map((item) =>
                    <Tr>
                        <Td>{item.tokenId}</Td>
                        <Td>{item.name}</Td>
                        <Td>{item.description}</Td>
                        <Td>{item.location}</Td>
                        <Td>
                            <Link to={"/surface/" + item.tokenId}>
                                <Button>Select</Button>
                            </Link>
                        </Td>
                    </Tr>
                )}
            </Tbody>
            <Tfoot>
            </Tfoot>
        </Table>
    );
}