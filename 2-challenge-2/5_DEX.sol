// SPDX-License-Identifier: MIT


pragma solidity 0.8.1;

import "./2_ERC721Token.sol";
import "./1_ERC20Token.sol";

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";



contract EasySwap is IERC721Receiver {
    
    enum statusChoices { OPEN, CLOSED, CANCELLED }
    enum priceChoices { ONLY721, ONLY20, BOTH }
    
    Token20 T20;
    Token721 T721;
    
    struct TradeToken {
        address seller;
        uint tokenId;
        uint[] acceptable721Trades;
        uint priceInERC20;
        statusChoices status;
        priceChoices pChoice;
    }
    
    address private contractAddress;
    
    mapping(address => uint) private userTokens;
    
    TradeToken[] private trades;
    
    
    constructor(address address20, address address721) {
        contractAddress = address(this);
        T20 = Token20(address20);
        T721 = Token721(address721);
    }
    
    
    function mint721(address to, uint tokenId) public {
        T721.mint(to, tokenId);
    }
    
    function mint20(address to, uint tokenId) public {
        T20.mint(to, tokenId);
    }
    
    
    function sell(uint tokenId, uint[] memory acceptable721Trades, uint priceInERC20, priceChoices choice) public  {
        require(T721.ownerOf(tokenId) == msg.sender, "EasySwap: Cannot sell a token you dont own!");
        T721.safeTransferFrom(msg.sender, contractAddress, tokenId);
        
        TradeToken memory newTrade = TradeToken(msg.sender, tokenId, acceptable721Trades, priceInERC20, statusChoices.OPEN, choice);
        trades.push(newTrade);
    }
    
    
    function buy(uint index, uint erc20, uint erc721token) public {
        TradeToken memory trade = trades[index];
        require(trade.status == statusChoices.OPEN, "Trade is not open for this token.");
        require(T721.ownerOf(erc721token) == msg.sender, "Cannot trade with a token you dont own!");
        
        checkpriceCondtions(trade, erc721token, erc20);
        
        if(trade.pChoice != priceChoices.ONLY721) {
            T20.transferFrom(msg.sender, trade.seller, erc20);
        }
        if(trade.pChoice != priceChoices.ONLY20) {
            T721.safeTransferFrom(msg.sender, trade.seller, erc721token);
        }
        
        T721.safeTransferFrom(contractAddress, msg.sender, trade.tokenId);
        trades[index].status = statusChoices.CLOSED;
        
    }
    
    function cancelTrade(uint index) public {
        require(msg.sender == trades[index].seller, "EasySwap: Cannot cancel a trade you did not create");
        trades[index].status = statusChoices.CANCELLED;
        T721.safeTransferFrom(contractAddress, trades[index].seller, trades[index].tokenId);
    }

    
    function getAllTrades() public view returns (TradeToken[] memory) {
        return trades;
    }
    
    function getTrade(uint id) public view returns (TradeToken memory) {
        require(id < trades.length, "EasySwap: Trade with that id doesn't exist!");
        return trades[id];
    }
    
    function getTradeStatus(uint id) public view returns (statusChoices) {
        require(id < trades.length, "EasySwap: Trade with that id doesn't exist!");
        return trades[id].status;   
    }
    
    function isValid721Trade(uint buyerToken, uint[] memory acceptable) private pure returns (bool) {
        for(uint i=0; i<acceptable.length; i++) {
            if(acceptable[i] == buyerToken) {
                return true;   
            }
        }
        return false;
    }
    
    function checkpriceCondtions(TradeToken memory trade, uint erc721token, uint erc20) private view {
        if(trade.pChoice != priceChoices.ONLY721) {
            require(erc20 == trade.priceInERC20, "EasySwap: Seller wants more erc20 tokens.");
            require(T20.balanceOf(msg.sender) >= trade.priceInERC20, "EasySwap: Insufficient erc20 balance!");
        }
        if(trade.pChoice != priceChoices.ONLY20) {
            require(T721.ownerOf(erc721token) == msg.sender, "EasySwap: Cannot trade with a token you dont own!");
            require(isValid721Trade(erc721token, trade.acceptable721Trades), "EasySwap: Seller does not want this 721 token.");             
        }
    }
    
    function myAddress() public view returns (address) {
        return msg.sender;
    }
    
    function getOpen() public pure returns (statusChoices) {
        return statusChoices.OPEN;
    }
    
    function getClose() public pure returns (statusChoices) {
        return statusChoices.CLOSED;
    }
    
    function only20() public pure returns (priceChoices) {
        return priceChoices.ONLY20;
    }
    
    function only720() public pure returns (priceChoices) {
        return priceChoices.ONLY721;
    }
    
    function getContractAddress() public view returns (address) {
        return contractAddress;
    }
    
    function getAddressThis() public  view returns (address)  {
        return address(this);
    }
    
    function getMsgSender() public  view returns (address)  {
        return msg.sender;
    }
    
    function balanceOf721(address _owner) public view returns (uint256) {
        return T721.balanceOf(_owner);
    }
    
    function balanceOf20(address _owner) public view returns (uint256) {
        return T20.balanceOf(_owner);
    }

    function ownerOf721(uint256 _tokenId) public view returns (address) {
        return T721.ownerOf(_tokenId);
    }
    
    function validSender721(uint _tokenId, address _owner) public view returns (bool) {
        return T721.validSender(_tokenId, _owner);
    }
    
     function onERC721Received( address _operator, address _from, uint256 _tokenId, bytes calldata _data) public pure override returns(bytes4) {
         _operator;
         _from;
        _tokenId;
        _data;
    return 0x150b7a02;
  }
    
    
}