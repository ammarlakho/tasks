//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.1;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "hardhat/console.sol";

contract MerkleVerifier {
    
    function verify(bytes32[] memory proof, bytes32 root, bytes memory _leaf) public view returns(bool) {
        bytes32 leaf = keccak256(abi.encodePacked(_leaf));
        bytes32 computedHash = leaf;
        console.log("hi");
        
        for(uint i=0; i<proof.length; i++) {
            bytes32 proofElement = proof[i];
            if(computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            }
            else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }
        return computedHash == root;
    }

    // function verify(bytes32[] memory proof, bytes32 root) public view returns (bool) {
    //     bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
    //     bytes32 computedHash = leaf;
    //     console.log("Bytes2");
    //     console.logBytes32(leaf);
        
    //     for(uint i=0; i<proof.length; i++) {
    //         bytes32 proofElement = proof[i];
    //         if(computedHash <= proofElement) {
    //             computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
    //         }
    //         else {
    //             computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
    //         }
    //     }
    //     return computedHash == root;
    // }
    
    function getComputed(bytes32[] memory proof) public view returns (bytes32) {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        bytes32 computedHash = leaf;
        for(uint i=0; i<proof.length; i++) {
            bytes32 proofElement = proof[i];
            if(computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            }
            else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }
        return computedHash;
    }

    function getRoot(bytes32 root) public pure returns (bytes32) {
        return root;
    }
}