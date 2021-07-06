//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.1;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/dev/ChainlinkClient.sol";

contract ChainLinkInteract is ChainlinkClient{
    using Chainlink for Chainlink.Request;
    uint256 public result;
    
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    constructor() {
    }

    function getPrice(address _oracle) public view returns (int) {
        AggregatorV3Interface priceOracle = AggregatorV3Interface(_oracle);
        (, int price, , , ) = priceOracle.latestRoundData();
        return price;
    }

    function requestSomething(
        address _oracle, 
        bytes32 _jobId, 
        uint _fee, 
        string memory url, 
        string memory path) 
        public returns(bytes32) 
    {
        init(_oracle, _jobId, _fee);
        
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        request.add("get", "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD");
        // request.add("get", url);
        request.add("path", "RAW.ETH.USD.VOLUME24HOUR");
        // request.add("path", path);

        // Multiply the result by 1000000000000000000 to remove decimals
        // int timesAmount = 10**18;
        // request.addInt("times", timesAmount);
        // Sends the request
        return sendChainlinkRequestTo(oracle, request, fee);
    }

    function init(address _oracle, bytes32 _jobId, uint _fee) private {
        setPublicChainlinkToken();
        oracle = _oracle;
        jobId = _jobId;
        fee = _fee;
    }

    function fulfill(bytes32 _requestId, uint256 _result) public recordChainlinkFulfillment(_requestId) {
        result = _result;
    }
}