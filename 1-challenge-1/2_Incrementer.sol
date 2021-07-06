// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Incrementer is Ownable{
    
    uint counter;
    
    function incrementCounter() private {
        counter++;
    }
    
    function getCounter() public view returns (uint) {
        return counter;
    }

}