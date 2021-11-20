import React from "react"
import {Box} from "@chakra-ui/react"
import {useWeb3Context} from "web3-react";
import InfoPage from "../pages/InfoPage";
import LandingLayout from "../components/layouts/LandingLayout";

function errorToMessage(error) {
    if (error !== undefined && error !== null && error.toString().startsWith("Error: Unsupported Network")) {
        return "Please change your network to Ropsten."
    } else {
        return "Please connect your Ethereum wallet."
    }
}

export default function IsWalletConnected(props) {
    const context = useWeb3Context();

    return (
        <Box w={"full"}>
            {context.active !== false ?
                props.children
                :
                <LandingLayout>
                    <InfoPage message={errorToMessage(context.error)}/>
                </LandingLayout>}
        </Box>
    )
}