// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

// import { ContractFactory, Contract, Wallet } from "ethers";
const ChainLinkInteract = require("../../artifacts/contracts/ChainLinkInteract.sol/ChainLinkInteract.json");
const dai_eth = "0x74825DbC8BF76CC4e9494d0ecB210f676Efa001D"

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log("Account address", deployer.address);
  const factory = new ethers.ContractFactory(ChainLinkInteract.abi, ChainLinkInteract.bytecode, deployer);
  let instance = await factory.deploy({gasPrice: ethers.utils.parseUnits("10", "gwei"), gasLimit: 500000});
  await instance.deployed();
  console.log("Deployed To: ", instance.address);
  let functions = instance.functions;
//   console.log(instance);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
