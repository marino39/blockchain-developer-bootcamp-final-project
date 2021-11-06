import LogoImage from "../../images/logo.png"
import {Image} from "@chakra-ui/react";

function Logo() {
    return (<Image src={LogoImage} maxW={125}/>)
}

export default Logo;