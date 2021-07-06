const express = require('express');
const morgan = require('morgan');
const artifacts = require("./artifacts/contracts/ERC1484.sol/ERC1484.json");

const Web3 = require('web3');

const PORT = 8546;
const routes = require('./routes');
let deployedRopstenAddress = "0xDdf959794cD70F0D800A9c4008D9d8fc51a9A69A";
let deployedHardhatAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";


const app = express()
// app.use(express.json())
app.use(morgan('tiny'))

// configure the app to use bodyParser()
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

let web3;
if(typeof web3 !== "undefined")  {
    web3 = new Web3(web3.currentProvider);
}
else {
    // web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/1b4fbf039df942c899b730cfa18023b6'));
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}

let accounts, instance;
async function init() {
    instance = new web3.eth.Contract(artifacts["abi"], deployedHardhatAddress);
    accounts = await web3.eth.getAccounts();
    web3.eth.handleRevert = true;
    routes(app, instance, accounts);
}   

init();
// load routes
// console.log(accounts.length);

app.listen(PORT, ()=>{console.log(`Server is running on http://localhost:${PORT}`)});
