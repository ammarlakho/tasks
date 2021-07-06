const v3FactoryAddr = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const v3OracleAddr = "0xA60211964b9Cd47ac55794961b58cf123D184c38";

const aquaAddr = "0xF7a63a49FEf8015eB45a0D4e60d1bd8EAeE14cDD";
const aqua2 = "0x7A530230278E7701e49a2f7C8F44e4177e990A09";
const aqua3 = "0x1f84b8846b78f653fb20ee3fd135edc7f64ec440"
const LC = "0xB7c300E353462fa5834DC1AbDA11f47258a13A2A";
const wethAddr = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
const weenusAddr = "0xaFF4481D10270F50f203E0763e2597776068CBc5";

const wethWeenus = "0xC867D391E22040078Fb9614412Af46303256bf2C";
const wethAqua = "0xa6179340c29037BEE885D61019363481aB739430";


const { ethers } = require("ethers");
// const getRevertReason = require('eth-revert-reason');
// const PersonFactory = require("../artifacts/contracts/PersonFactory.sol/PersonFactory.json");

let price = ethers.utils.parseUnits("10", "gwei");
async function main() {
    console.log("hi");
    [provider1, provider2, provider3] = await hre.ethers.getSigners();
    console.log("hi2");
    console.log(provider1.address);
    
    let instance = await new ethers.Contract(v3OracleAddr, v3OracleABI, provider1);
    console.log(instance.functions);
    // let pAddr = await instance.getPool(wethAddr, aquaAddr, 3000);
    // console.log(pAddr);
    console.log(await instance.AQUA())
    let tx = await instance.fetchAquaPrice({gasPrice: price, gasLimit: 8000000});
    tx.wait();
    console.log("tx: ", tx.hash);
    return
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


const v3FactoryABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint24","name":"fee","type":"uint24"},{"indexed":true,"internalType":"int24","name":"tickSpacing","type":"int24"}],"name":"FeeAmountEnabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":true,"internalType":"uint24","name":"fee","type":"uint24"},{"indexed":false,"internalType":"int24","name":"tickSpacing","type":"int24"},{"indexed":false,"internalType":"address","name":"pool","type":"address"}],"name":"PoolCreated","type":"event"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"}],"name":"createPool","outputs":[{"internalType":"address","name":"pool","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"int24","name":"tickSpacing","type":"int24"}],"name":"enableFeeAmount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint24","name":"","type":"uint24"}],"name":"feeAmountTickSpacing","outputs":[{"internalType":"int24","name":"","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint24","name":"","type":"uint24"}],"name":"getPool","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"parameters","outputs":[{"internalType":"address","name":"factory","type":"address"},{"internalType":"address","name":"token0","type":"address"},{"internalType":"address","name":"token1","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"int24","name":"tickSpacing","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"setOwner","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const v3OracleABI = [{"inputs":[{"internalType":"address","name":"uniswapFactory","type":"address"},{"internalType":"address","name":"weth","type":"address"},{"internalType":"address","name":"aqua","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"","type":"uint256"}],"name":"Price","type":"event"},{"inputs":[],"name":"AQUA","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"V3_FACTORY","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint24","name":"fees","type":"uint24"}],"name":"assetToEth","outputs":[{"internalType":"uint256","name":"ethAmountOut","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint24","name":"fees","type":"uint24"}],"name":"ethToAsset","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"fetch","outputs":[{"internalType":"uint256","name":"price","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fetchAquaPrice","outputs":[{"internalType":"uint256","name":"price","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint24","name":"_poolFee","type":"uint24"},{"internalType":"uint256","name":"_amountIn","type":"uint256"}],"name":"getPrice","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"view","type":"function"}]