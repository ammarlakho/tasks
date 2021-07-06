// SPDX-License-Identifier: MIT

pragma solidity 0.8.1;

library Helper {
    function isContract(address _addr) public view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(_addr)
        }
        return (size > 0);
    }    
}
