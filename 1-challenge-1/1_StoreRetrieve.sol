// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.1;


import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract StoreRetrieve is Ownable {
    
    using SafeMath for uint256;
    
    struct Details {
        string name;
        uint8 age;
    }
    
    mapping(address => Details) addressToDetails;
    
    
    // 1
    function myData() public view returns (string memory, uint8) {
        Details memory personData = addressToDetails[msg.sender];
        return (personData.name, personData.age);

    }
    
    function retrieveData(address _addr) public view returns (string memory, uint8) {
        Details memory personData = addressToDetails[_addr];
        return (personData.name, personData.age);

    }
    
    function store(string memory _name, uint8 _age) public {
        Details memory newPerson = Details(_name, _age);
        addressToDetails[msg.sender] = newPerson;
    }
    
}