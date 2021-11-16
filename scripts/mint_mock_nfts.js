const MockNFT = artifacts.require("MockNFT");

module.exports = async function (callback) {
    let nft = await MockNFT.deployed();
    let symbol = await nft.symbol();
    console.log("MockNFT(" + symbol + ") Contract Address: ", nft.address);

    let accounts = await web3.eth.getAccounts();
    await nft.mint(accounts[0], "QmcYD2z5vWW9cymyarCPSgd2GJ5VnzbJkzMJpSAWH3mjtg");
    await nft.mint(accounts[0], "QmXhx957X3gdSDmHkC3KhTQ6B3FRksr39MQyk4Suwn4tRC");
    await nft.mint(accounts[0], "QmPqsXpRQj25uLNzRdimUWDFvnb7Q6UeT3P7bmAmHogM2i");

    let balance1 = await nft.balanceOf(accounts[0]);

    console.log("Minted:");
    console.log(accounts[0], ":", balance1.toString());

    callback();
}