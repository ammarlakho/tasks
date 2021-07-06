
// const contractAddress0 = "0xE207Dc6E0DBFc16f007fd2A7fd30bE65D8E802Bf";
const contractAddress = "0x295781b126D4E042B18E1388f199D3dA6f451344";

const { ethers } = require("ethers");
const getRevertReason = require('eth-revert-reason');
const PersonFactory = require("../artifacts/contracts/PersonFactory.sol/PersonFactory.json");

let price = ethers.utils.parseUnits("10", "gwei");
async function main() {
    [provider1, provider2, provider3] = await hre.ethers.getSigners();
    console.log(provider1.address)
    console.log(provider2.address);
    let instance = await new ethers.Contract(contractAddress, PersonFactory.abi, provider1);
    // let tx = await instance.connect(provider2).changeMyName("Second Change", {gasPrice: price});
    let tx = await instance.connect(provider3).createPerson("HELLOOOO", {gasPrice: price});
    tx.wait();
    console.log(tx);
    console.log("done");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
