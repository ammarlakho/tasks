var ERC1155 = artifacts.require("./ERC1155.sol");
module.exports = function(deployer) {
  deployer.deploy(ERC1155);
};
