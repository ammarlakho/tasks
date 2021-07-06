const RI_BRIDGE="0xD26d6BE21956c64dC2688702B739D015068b6637"
const RI_HANDLER="0x3E34BC49DA0eCC245AF03373b1661f4Cf23cD251"
const RI_TOKEN="0xaFF4481D10270F50f203E0763e2597776068CBc5"
const RO_BRIDGE="0x3cf5D4e3433f392D0F30ba60E5cddE047d93498a"
const RO_HANDLER="0xD26d6BE21956c64dC2688702B739D015068b6637"
const RO_TOKEN="0x3E34BC49DA0eCC245AF03373b1661f4Cf23cD251"
const BSC_BRIDGE="0x3cf5D4e3433f392D0F30ba60E5cddE047d93498a"
const BSC_HANDLER="0xD26d6BE21956c64dC2688702B739D015068b6637"
const BSC_TOKEN="0x091a33cb4E3034c4932F7656E6BC0b7D6cef888d"
const RESOURCE_ID="0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00"
const Bridge = require("../Bridge.json");

const { ethers } = require("ethers");


const toHex = (covertThis, padding) => {
  return ethers.utils.hexZeroPad(ethers.utils.hexlify(covertThis), padding);
};

let price = ethers.utils.parseUnits("10", "gwei");
async function main() {
  [provider1, provider2, provider3] = await hre.ethers.getSigners();
  console.log(provider1.address)
  let instance = await new ethers.Contract(RI_BRIDGE, Bridge.abi, provider1);

  let depositNonce = 1; //instance._depositCounts(2) // 2 is dest chainID. should be called on src chain.
  let amount = ethers.utils.parseUnits("1", 18);
  let depositData = '0x' + toHex(amount, 32).substr(2) + toHex(20, 32).substr(2) + provider1.address.substr(2);
  let dataHash = ethers.utils.keccak256(BSC_HANDLER + depositData.substr(2));
  console.log(dataHash);
  console.log(RESOURCE_ID)
  let tx;
  // tx = (await instance.connect(provider1).voteProposal(0, depositNonce, RESOURCE_ID, dataHash)).wait();
  // tx = (await instance.connect(provider2).voteProposal(0, depositNonce, RESOURCE_ID, dataHash)).wait();
  tx = await instance.connect(provider1).executeProposal(0, depositNonce, depositData, RESOURCE_ID, {gasLimit: 100000});
  // console.log(tx.hash);
  // tx.wait();
  // console.log("tx: " + tx.hash);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


const abi_721 = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"_approved","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"_operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_operator","type":"address"},{"internalType":"bool","name":"_approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"},{"internalType":"address","name":"_owner","type":"address"}],"name":"validSender","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}];
