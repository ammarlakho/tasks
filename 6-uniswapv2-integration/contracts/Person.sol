//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.1;


contract Person {
    
    event NameChange(address indexed contractAddress, string newName);
    
    address public factoryAddress;
    address public myAddress;
    string private myName;
    
     modifier onlyFactory() {
        require(msg.sender == factoryAddress, "Person: onlyFactory");
        _;
    }
    
    modifier onlyOwner(address caller) {
        require(myAddress == caller, "Person: onlyFactory");
        _;
    }
    
     constructor(address owner, string memory _name) {
        factoryAddress = msg.sender;
        myAddress = owner;
        myName = _name;
        emit NameChange(address(this), _name);
    }
    
    function getMyName() public view returns (string memory) {
        return myName;
    }
    
    function changeName(address caller, string memory newName) public onlyFactory onlyOwner(caller) {
        myName = newName;
        emit NameChange(address(this), newName);
    }
    
    function getOwner() public view returns (address) {
        return myAddress;
    }
}