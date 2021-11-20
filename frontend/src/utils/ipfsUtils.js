import config from "../config";

export async function getJsonFromIPFS(cid) {
    let resp = await fetch(config.IPFSGatewayURL + cid)
    if (!resp.ok) {
        return null
    }

    return (await resp.json());
}

export async function getJsonFromUrl(url) {
    let resp = await fetch(url)
    if (!resp.ok) {
        return null
    }

    return (await resp.json());
}