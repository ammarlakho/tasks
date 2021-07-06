// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ToDoApp is Ownable{
    
    uint counter;
    mapping(address => ToDo[]) public userToList;
    
    struct ToDo {
        uint id;
        string title;
        string importance;
        string status;
    }
    
    // 2
    function incrementCounter() private {
        counter++;
    }
    
    function getCounter() public view returns (uint) {
        return counter;
    }
    
    
    // 3 
    function addToMyList(string memory _title, string memory _importance) public onlyOwner {
        uint id = getCounter();
        incrementCounter();
        userToList[msg.sender].push(ToDo(id, _title, _importance, "incomplete"));
    }
    
    function updateTaskStatus(uint _id, string memory _status) public onlyOwner {
        userToList[msg.sender][_id].status = _status;
    }
    
    function updateTaskImportance(uint _id, string memory _imp) public onlyOwner {
       userToList[msg.sender][_id].importance = _imp;
    }
    
    function getList() public view returns (ToDo[] memory) {
        return userToList[msg.sender];
    }
}
