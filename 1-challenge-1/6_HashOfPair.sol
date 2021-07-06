// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.1;

contract HashOfPair {
    
    function getSameHash(address a, address b) public pure returns (bytes32) {
        bytes20 bytesA = bytes20(a);
        bytes20 bytesB = bytes20(b);
        bytes20 result = bytesA | bytesB;
        
        return keccak256(abi.encodePacked(result));
    }
    
}
