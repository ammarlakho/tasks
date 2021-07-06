// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

// import { ContractFactory, Contract, Wallet } from "ethers";
const PersonFactory = require("../../artifacts/contracts/PersonFactory.sol/PersonFactory.json");


async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log("Account address", deployer.address);
  const factory = new ethers.ContractFactory(PersonFactory.abi, PersonFactory.bytecode, deployer);
  let instance = await factory.deploy({gasPrice: ethers.utils.parseUnits("10", "gwei"), gasLimit: 1500000});
  await instance.deployed();
  // instance.wait();
  console.log(instance);
  console.log("Deployed To: ", instance.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
