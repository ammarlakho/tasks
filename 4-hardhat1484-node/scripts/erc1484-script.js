const hre = require("hardhat");

async function main() {

  await hre.run('compile');

  const ERC1484 = await ethers.getContractFactory("ERC1484");
  const instance = await ERC1484.deploy();

  await instance.deployed();
  console.log("ERC1484 deployed to:", instance.address);
  // let functions = Object.keys(instance.functions);
  // console.log(typeof functions[0]);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
