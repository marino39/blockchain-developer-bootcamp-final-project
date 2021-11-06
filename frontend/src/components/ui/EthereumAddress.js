import {useWeb3Context} from "web3-react";
import {shortAddress} from "../../utils/ethAddressUtils";
import {Box} from "@chakra-ui/react";

export default function EthereumAddress() {
    const context = useWeb3Context();

    return (<Box>
        {shortAddress(context.account)}
    </Box>)
}