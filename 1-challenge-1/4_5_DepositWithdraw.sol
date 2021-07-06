// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SendWithdraw is Ownable {
    
    uint last = 0;
    
    address depositAddress = 0xeADa9810c2EE1710A32D5FD828649F5279f8823E;
    mapping(address => uint) addressToBalance;
    
    modifier validTx(uint amount) {
        require(addressToBalance[msg.sender] > amount, "Insufficient balance");
        _;
    }
    
     modifier haveWaited() {
        require(last == 0 || block.timestamp > last + 1 minutes, "Need to wait 1 minute between withdrawals.");
        _;
    }
    
    function depositEth() public payable {
        (bool sent, ) = depositAddress.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
        addressToBalance[msg.sender] += msg.value;
        
    }
    
    function withdrawEth(uint amount) public payable onlyOwner validTx(amount) haveWaited {
        (bool sent, ) = msg.sender.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
        addressToBalance[msg.sender] -= amount;
    }
    
}