
export function shortAddress(address) {
    return address.substr(0, 6) + "..." + address.substr(address.length - 4, 4);
}