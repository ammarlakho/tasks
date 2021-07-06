const { ethers } = require("ethers");
const urql = require('urql');
require('isomorphic-unfetch');

const APIURL = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2";
const factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

let instance, provider;
const price = ethers.utils.parseUnits("10", "gwei");
async function init() {
    instance = await new ethers.Contract(factoryAddress, factory_abi, provider);
}


async function main() {
    console.log('hiii');
    let allPairs = []
    const tokensQuery = `
      query {
        pairs(orderBy:totalSupply, 
    		orderDirection: desc, 
  			first: 2) {
          id
          token0 {
              id
              symbol
          }
          token1 {
              id
              symbol
          }
          totalSupply
        }
      }
    `

    const client = urql.createClient({
      url: APIURL
    });

    const pairs = (await client.query(tokensQuery).toPromise()).data.pairs;
    for (let i=0; i<pairs.length; i++) {
        pairs[i]["token0Addr"] = pairs[i].token0.id;
        pairs[i]["token0Sym"] = pairs[i].token0.symbol;
        pairs[i]["token1Addr"] = pairs[i].token1.id;
        pairs[i]["token1Sym"] = pairs[i].token1.symbol;
        delete pairs[i].token0;
        delete pairs[i].token1;
        // console.log(pairs[i]);
    }
    console.log(pairs);

}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


const factory_abi = [{"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":false,"internalType":"address","name":"pair","type":"address"},{"indexed":false,"internalType":"uint256","name":"","type":"uint256"}],"name":"PairCreated","type":"event"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allPairs","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"allPairsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"}],"name":"createPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeTo","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeToSetter","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeTo","type":"address"}],"name":"setFeeTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"name":"setFeeToSetter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
