import config from "../config";

export async function getJsonFromIPFS(cid) {
    let resp = await fetch(config.IPFSGatewayURL + cid)
    if (!resp.ok) {
        return null
    }

    return (await resp.json());
}