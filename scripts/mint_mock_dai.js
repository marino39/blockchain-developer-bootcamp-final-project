const MockDai = artifacts.require("MockDai");

module.exports = async function (callback) {
    let dai = await MockDai.deployed();
    let symbol = await dai.symbol();
    let decimals = await dai.decimals();
    console.log("MockDai(" + symbol + ") Contract Address: ", dai.address);

    const multiplier = new web3.utils.BN(10).pow(decimals)
    let mintTokenNumber = (new web3.utils.BN("100000")).mul(multiplier)

    let accounts = await web3.eth.getAccounts();
    await dai.mint(accounts[0], mintTokenNumber);
    await dai.mint(accounts[1], mintTokenNumber);
    await dai.mint(accounts[2], mintTokenNumber);

    let balance1 = await dai.balanceOf(accounts[0]);
    let balance2 = await dai.balanceOf(accounts[1]);
    let balance3 = await dai.balanceOf(accounts[2]);

    console.log("Minted:");
    console.log(accounts[0], ":", balance1.toString());
    console.log(accounts[1], ":", balance2.toString());
    console.log(accounts[2], ":", balance3.toString());

    callback();
}