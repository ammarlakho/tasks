// SPDX-License-Identifier: MIT

pragma solidity 0.8.1;

import "openzeppelin-solidity/contracts/token/ERC1155/IERC1155.sol";
import "openzeppelin-solidity/contracts/utils/introspection/IERC165.sol";
import "openzeppelin-solidity/contracts/token/ERC1155/IERC1155Receiver.sol";


contract ERC1155 is IERC1155 {
    
    bytes4 constant private ERC1155_ERC165 = 0xd9b67a26; 
    
    mapping(address => mapping(uint => uint)) private userTokenBalances;
    mapping(address => mapping(address => bool)) private ownerOperator;
    
    function mint(address to, uint tokenId, uint amount) public {
        require(to != address(0), "Token721: mint to the zero address");

        userTokenBalances[to][tokenId] += amount;
        emit TransferSingle(msg.sender, address(0), to, tokenId, amount);
    }

    function balanceOf(address account, uint256 id) external view override returns (uint256) {
        return userTokenBalances[account][id];
    }

    function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) external view override returns (uint256[] memory) {
        require(accounts.length == ids.length, "Lengths of ids array != length of accounts array!");
        
        uint[] memory balances;
        for(uint i=0; i<ids.length; i++) {
            balances[i] = userTokenBalances[accounts[i]][ids[i]];
        }
        return balances;
    }

    function setApprovalForAll(address operator, bool approved) external override {
        require(msg.sender != operator, "Operator cannot set approval for all!");
        ownerOperator[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address account, address operator) external view override returns (bool) {
        return ownerOperator[account][operator];
    }

    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) public override {
        isSingleImplemented(from, to, id, amount, data);
        _transfer(from, to, id, amount);
        emit TransferSingle(msg.sender, from, to, id, amount);
    }


    function safeBatchTransferFrom(address from, address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data) public override {
        isBatchImplemented(from, to, ids, amounts, data);
        require(ids.length == amounts.length, "Lengths of ids array != length of accounts array!");
        for(uint i=0; i<ids.length; i++) {
            _transfer(from, to, ids[i], amounts[i]);
        }
        emit TransferBatch(msg.sender, from, to, ids, amounts);
    }
    
    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        if(interfaceId == ERC1155_ERC165) {
            return true;
        }
        return false;
    }
    
    function _transfer(address from, address to, uint256 id, uint256 amount) private {
        require(to != address(0), "Cannot send a token to address(0)");
        require(validSender(from), "Dont have permission to send this token.");
        require(userTokenBalances[from][id] >= amount, "Insufficient balance for this token id");
        
        userTokenBalances[from][id] -= amount;
        userTokenBalances[to][id] += amount;
    }
    
    function validSender(address _owner) private view returns (bool) {
        return msg.sender == _owner || ownerOperator[_owner][msg.sender];
    }
    
    function isSingleImplemented(address _from, address _to, uint _id, uint _amount, bytes calldata _data) private {
        if (isContract(_to)) {
            IERC1155Receiver receiver = IERC1155Receiver(_to);
            receiver.onERC1155Received(msg.sender,_from, _id, _amount, _data);
        }
    
    }
    
    function isBatchImplemented(address _from, address _to, uint[] calldata _ids, uint[] calldata _amounts, bytes calldata _data) private {
        if (isContract(_to)) {
            IERC1155Receiver receiver = IERC1155Receiver(_to);
            receiver.onERC1155BatchReceived(msg.sender,_from, _ids, _amounts, _data);
        }
    
    }
    
    function isContract(address _addr) private view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(_addr)
        }
        return (size > 0);
    }   

    
} 