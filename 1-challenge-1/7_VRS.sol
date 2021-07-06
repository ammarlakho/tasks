// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.1;

contract VerifySignature {

    function getMessageHash(address _to, uint _amount, string memory _message, uint _nonce) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_to, _amount, _message, _nonce));
    }

    
    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
        /*
        Signature is produced by signing a keccak256 hash with the following format:
        "\x19Ethereum Signed Message\n" + len(msg) + msg
        */
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    function verify(address _signer, address _to, uint _amount, string memory _message, uint _nonce, bytes memory signature) public pure returns (bool) {
        bytes32 messageHash = getMessageHash(_to, _amount, _message, _nonce);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        return recoverSigner(ethSignedMessageHash, signature) == _signer;
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }
    
}

/* 
How to Run on Remix IDE

1. Run ethereum.enable() on remix console.

2. Run getMessageHash(address _to, uint _amount, string memory _message, uint _nonce). S
    Save the value of  the returned hash by doing hash = "value" on remix console.

3. On remix console run the following commands to sign(metamask prompt should come up): 
    account = "your address".
    ethereum.request({ method: "personal_sign", params: [account, hash]}).then(console.log)
    Store the value of the returned signature.
    
4. Run verify verify(address _signer, address _to, uint _amount, string memory _message, uint _nonce, bytes memory signature). Should return true or false.


*/ 
