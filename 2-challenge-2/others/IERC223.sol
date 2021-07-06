// SPDX-License-Identifier: MIT

pragma solidity 0.8.1;


/**
 * @dev Interface of the ERC777Token standard as defined in the EIP.
 *
 * This contract uses the
 * [ERC1820 registry standard](https://eips.ethereum.org/EIPS/eip-1820) to let
 * token holders and recipients react to token movements by using setting implementers
 * for the associated interfaces in said registry. See `IERC1820Registry` and
 * `ERC1820Implementer`.
 */

abstract contract IERC223 {
    /**
     * @dev Returns the total supply of the token.
     */
    uint internal _totalSupply;
    
    /**
     * @dev Returns the balance of the `who` address.
     */
    function balanceOf(address who) public view virtual returns (uint);
        
    /**
     * @dev Transfers `value` tokens from `msg.sender` to `to` address
     * and returns `true` on success.
     */
    function transfer(address to, uint value) public virtual returns (bool);
        
    /**
     * @dev Transfers `value` tokens from `msg.sender` to `to` address with `data` parameter
     * and returns `true` on success.
     */
    function transfer(address to, uint value, bytes memory data) public virtual returns (bool);
     
     /**
     * @dev Event that is fired on successful transfer.
     */
    event Transfer(address indexed from, address indexed to, uint value, bytes data);
}