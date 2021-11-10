import config from "../config";

export async function getJsonFromIPFS(cid) {
    return (await (await fetch(config.IPFSGatewayURL + cid)).json());
}