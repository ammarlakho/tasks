// const contractAddress0 = "0x83e2fbAEd244B9Ce239cB7762e844A6Be3c1B7Df";
const contractAddress = "0x2ceea2c19bf8456993a3203c13498e6f66d3911e";

const { ethers } = require("ethers");
const getRevertReason = require('eth-revert-reason');
const ChainLinkInteract = require("../artifacts/contracts/ChainLinkInteract.sol/ChainLinkInteract.json");
const dai_eth = "0x74825DbC8BF76CC4e9494d0ecB210f676Efa001D"
const btc_eth = "0x2431452A0010a43878bF198e170F6319Af6d27F4";
const node_op_rinkeby = "0x7AFe1118Ea78C1eae84ca8feE5C65Bc76CcF879e";

let price = ethers.utils.parseUnits("10", "gwei");
async function main() {
    [provider1] = await hre.ethers.getSigners();
    console.log(provider1.address);
    let instance = await new ethers.Contract(contractAddress, ChainLinkInteract.abi, provider1);
    let price = await instance.getThePrice(btc_eth);
    price = price / (10**18);
    console.log(price);
    // let tx = await instance.connect(provider3).createPerson("HELLOOOO", {gasPrice: price});
    // tx.wait();
    // console.log(tx);
    // console.log("done");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
