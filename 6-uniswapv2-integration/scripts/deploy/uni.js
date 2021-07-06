// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

// import { ContractFactory, Contract, Wallet } from "ethers";
const UniswapInteract = require("../../artifacts/contracts/UniswapInteract.sol/UniswapInteract.json");


async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log("Account address", deployer.address);
  const factory = new ethers.ContractFactory(UniswapInteract.abi, UniswapInteract.bytecode, deployer);
  let instance = await factory.deploy("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", 
                                      {gasPrice: ethers.utils.parseUnits("10", "gwei")});
  await instance.deployed();
  // instance.wait();
  console.log(instance.functions);
  console.log("Deployed To: ", instance.address);
}


// async function main() {

//   await hre.run('compile');

//   const UniswapInteract = await ethers.getContractFactory("UniswapInteract");
// //    console.log(UniswapInteract);

// //   let a = "0x4179bc5D284d30e6d0298FCaB7f6Eb9924275afe";
//   const instance = await UniswapInteract.deploy();
//   await instance.deployed();

//   console.log("UniswapInteract deployed to:", instance.address);
// }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
