//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.1;

import "./Person.sol";
contract PersonFactory {

    event NewPerson(address indexed personAddress);
    
    mapping(address => address) personDirectory;
    mapping(address => bool) exists;
    
    function createPerson(string memory _name) public {
        require(personDirectory[msg.sender] == address(0), "PersonFactory: You already exist!");
        personDirectory[msg.sender] = address(new Person(msg.sender, _name));
        exists[msg.sender] = true;
        emit NewPerson(personDirectory[msg.sender]); 
    }
    
    function getNameOf(address person) public view returns(string memory) {
        require(personDirectory[person] != address(0), "PersonFactory: Person does not exist!");
        return Person(personDirectory[person]).getMyName();
    }
    
    function getMyName() public view returns (string memory) {
        return getNameOf(msg.sender);
    }
    
    
    function changeMyName(string memory newName) public {
        require(exists[msg.sender], "PersonFactory: Person does not exist!");
        require(personDirectory[msg.sender] != address(0), "PersonFactory: Person does not exist!");
        Person(personDirectory[msg.sender]).changeName(msg.sender, newName);
    }
    
}