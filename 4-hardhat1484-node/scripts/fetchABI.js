var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider());
const axios = require('axios').default;
const api_key = "7WRQ3FD3TZ6W61VG7D2PP1XFMBUC265YB1";
const addressWithABI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const addressWithoutABI = "0xF9bA0955b0509AC6138908cCc50d5Bd296E48D7D";



let contractABI, contractABIParsed = "";
console.log("hi");
function fetchABI(contractAddress, api_key) {
    let url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${api_key}`; 
    axios.get(url)
    .then(function(response) {
        let notVerified = "Contract source code not verified"
        contractABI = response.data.result;
        // console.log(response.data.result)
        if(notVerified.localeCompare(contractABI) != 0) {
            contractABIParsed = JSON.parse(response.data.result);
        }
    })     
    .catch(function(error) {
        console.log(error);
    })
    .then(function() {
        console.log(contractABI);
        console.log(contractABIParsed);
    })
}

fetchABI(addressWithABI, api_key);
