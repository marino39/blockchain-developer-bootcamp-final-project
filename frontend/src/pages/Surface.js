import {Box} from "@chakra-ui/react";
import {useParams} from "react-router-dom";
import LandingLayout from "../components/layouts/LandingLayout";

export default function Surface(props) {
    const {id} = useParams();
    return (
        <LandingLayout>
            <Box>Surface #{id}</Box>
        </LandingLayout>
    )
}