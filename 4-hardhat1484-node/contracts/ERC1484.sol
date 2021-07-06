//SPDX-License-Identifier: Unlicense

pragma solidity 0.8.1;

import "hardhat/console.sol";
import "../helpers/IERC484.sol";
import "./AddressSet.sol";


contract ERC1484 is IdentityRegistryInterface {
    using AddressSet for AddressSet.Set;

    bytes32 public msgApproveMe = keccak256(abi.encodePacked("Authorized the creation of an identity."));
    bytes32 public msgApproveOther = keccak256(abi.encodePacked("Authorized the approval of another approved address."));
    bytes32 public msgRemoval = keccak256(abi.encodePacked("Authorized the removal of the approved address."));

    uint private EIN = 0;
    mapping(uint => Identity) private einToIdentity;
    mapping(address => uint) private associatedToEin;
    mapping(address => uint) private recoveryAddressTime;
    mapping(address => address) private newToOld;
    mapping (uint => Recovery) private recoveryLogs;


    struct Recovery {
        uint timestamp;
        bytes32 hashedOldAssociatedAddresses;
    }
    
    struct Identity {
        address recoveryAddress;
        AddressSet.Set associatedAddresses;
        AddressSet.Set providers;
        AddressSet.Set resolvers;
    }

    modifier signatureTimeout(uint timestamp) {
        require((block.timestamp - timestamp) < 30 minutes && block.timestamp > timestamp, "ERC14848: Invalid Timestamp");
        _;
    }

    function canOldRecover(address newAddress) public view returns (bool) {
        return (block.timestamp - recoveryAddressTime[newToOld[newAddress]]) < 14 days;
    }

    function isSigned(address _address, bytes32 messageHash, uint8 v, bytes32 r, bytes32 s)
        public pure override returns (bool) 
    {   
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        return ecrecover(prefixedHash, v, r, s) == _address || ecrecover(messageHash, v, r, s) == _address;
    } 

    function splitSignature(bytes memory sig) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    // Identity View Functions /////////////////////////////////////////////////////////////////////////////////////////
    function identityExists(uint ein) public view override returns (bool) {
        return einToIdentity[ein].recoveryAddress != address(0);
    }
    
    function hasIdentity(address _address) public view override returns (bool) {
        return identityExists(associatedToEin[_address]);
    }

    function getEIN(address _address) public view override returns (uint ein) {
        require(hasIdentity(_address), "ERC1484: Address doesn't have an identity");
        return associatedToEin[_address];
    }
    
    function isAssociatedAddressFor(uint ein, address _address) public view override returns (bool) {
        return associatedToEin[_address] == ein;
    }
    
    function isProviderFor(uint ein, address provider) public view override returns (bool) {
        address[] memory providers = einToIdentity[ein].providers.members;
        for(uint i=0; i<providers.length; i++) {
            if(providers[i] == provider)
                return true;
        }
        return false;
    }

    function isResolverFor(uint ein, address resolver) public view override returns (bool) {
        address[] memory resolvers = einToIdentity[ein].resolvers.members;
        for(uint i=0; i<resolvers.length; i++) {
            if(resolvers[i] == resolver)
                return true;
        }
        return false;
    }
    
    function getIdentity(uint ein) public view override returns (
        address recoveryAddress,
        address[] memory associatedAddresses, 
        address[] memory providers, 
        address[] memory resolvers
        ) 
    {   
        require(identityExists(ein), "ERC1484: No identity with this EIN exists");
        Identity storage i = einToIdentity[ein];
        return (i.recoveryAddress, i.associatedAddresses.members, i.providers.members, i.resolvers.members);
    }

    // Identity Management Functions ///////////////////////////////////////////////////////////////////////////////////
    function createIdentity(address recoveryAddress, address[] calldata providers, address[] calldata resolvers)
        public override returns (uint ein) 
    {
        return _createIdentity(recoveryAddress, msg.sender, providers, resolvers, false);
    }
    function createIdentityDelegated(
        address recoveryAddress, address associatedAddress, address[] calldata providers, address[] calldata resolvers,
        uint8 v, bytes32 r, bytes32 s, uint timestamp
    ) 
        public override signatureTimeout(timestamp) returns (uint ein)
    {
        require(isSigned(associatedAddress, msgApproveMe, v, r, s), "ERC1484: Address has not given you rights to be associated to an identity.");        
        return _createIdentity(recoveryAddress, associatedAddress, providers, resolvers, true);
    }

    function _createIdentity(address recoveryAddress, address associatedAddress, address[] calldata providers, address[] calldata resolvers, bool delegated) 
        private returns (uint) 
    {
        EIN++;
        Identity storage newIdentity = einToIdentity[EIN];
        newIdentity.recoveryAddress = recoveryAddress;
        _addAssociatedAddress(associatedAddress, EIN);
        _addProviders(EIN, providers, delegated);
        _addResolvers(EIN, resolvers);
        emit IdentityCreated(msg.sender, EIN, recoveryAddress, associatedAddress, providers, resolvers, delegated);
        return EIN;
    }

    function addAssociatedAddress(
        address approvingAddress, address addressToAdd, uint8 v, bytes32 r, bytes32 s, uint timestamp) 
        public override signatureTimeout(timestamp)
    {
        bool approvingAddressSender = msg.sender == approvingAddress;
        bool addressToAddSender = msg.sender == addressToAdd; 
        require(approvingAddressSender || addressToAddSender, "ERC1484: Caller must be the one approving or the one being approved");
        if(approvingAddressSender) {
            require(isSigned(addressToAdd, msgApproveMe, v, r, s), "ERC1484: Address has not given you rights to be associated to an identity.");
        }
        else {
            require(isSigned(approvingAddress, msgApproveOther, v, r, s), "ERC1484: Associated address has not given you rights to be add another associated address.");
        }

        uint ein = getEIN(approvingAddress);
        _addAssociatedAddress(addressToAdd, ein);
        emit AssociatedAddressAdded(msg.sender, ein, approvingAddress, addressToAdd);
    }

    function addAssociatedAddressDelegated(
        address approvingAddress, address addressToAdd,
        uint8[2] calldata v, bytes32[2] calldata r, bytes32[2] calldata s, uint[2] calldata timestamp
        ) 
        public override signatureTimeout(timestamp[0]) signatureTimeout(timestamp[1])
    {   
        require(isSigned(approvingAddress, msgApproveOther, v[0], r[0], s[0]), "ERC1484: Associated address has not given you rights to be add another associated address.");
        require(isSigned(addressToAdd, msgApproveMe, v[1], r[1], s[1]), "ERC1484: Address has not given you rights to be associated to an identity.");
        uint ein = getEIN(approvingAddress);

        _addAssociatedAddress(addressToAdd, ein);
        emit AssociatedAddressAdded(msg.sender, ein, approvingAddress, addressToAdd);
    }

    function _addAssociatedAddress(address _address, uint ein) public {
        require(!hasIdentity(_address), "This address already has an identity");
        einToIdentity[ein].associatedAddresses.insert(_address);
        associatedToEin[_address] = ein;
    }

    function removeAssociatedAddress() public override {
        _removeAssociatedAddress(msg.sender);
    }

    function removeAssociatedAddressDelegated(address addressToRemove, uint8 v, bytes32 r, bytes32 s, uint timestamp)
        public override signatureTimeout(timestamp)
    {
        require(isSigned(addressToRemove, msgRemoval, v, r, s), "ERC1484: Address has not given you rights to remove it from being associated to an identity.");
        _removeAssociatedAddress(addressToRemove);
    }

    function _removeAssociatedAddress(address addressToRemove) private {
        uint ein = getEIN(addressToRemove);
        einToIdentity[ein].associatedAddresses.remove(addressToRemove);
        delete associatedToEin[addressToRemove];
        emit AssociatedAddressRemoved(msg.sender, ein, addressToRemove);
    }
 
    function addProviders(address[] calldata providers) public override {
        _addProviders(getEIN(msg.sender), providers, false);
    }

    function addProvidersFor(uint ein, address[] calldata providers) public override {
        require(isProviderFor(ein, msg.sender), "ERC1484: Only a provider of this identity can add providers.");
        _addProviders(ein, providers, true);
    }

    function _addProviders(uint ein, address[] calldata providers, bool delegated) private {
        for(uint i=0; i<providers.length; i++) {
            einToIdentity[ein].providers.insert(providers[i]);
            emit ProviderAdded(msg.sender, ein, providers[i], delegated);
        }
    }

    function removeProviders(address[] calldata providers) public override {
        _removeProviders(getEIN(msg.sender), providers, false);
    }

    function removeProvidersFor(uint ein, address[] calldata providers) public override {
        require(isProviderFor(ein, msg.sender), "ERC1484: Only a provider of this identity can remove providers.");
        _removeProviders(ein, providers, true);
    }

    function _removeProviders(uint ein, address[] calldata providers, bool delegated) private {
        for(uint i=0; i<providers.length; i++) {
            einToIdentity[ein].providers.remove(providers[i]);
            emit ProviderRemoved(msg.sender, ein, providers[i], delegated);
        }
    }

    function addResolvers(address[] calldata resolvers) public override {
        _addResolvers(getEIN(msg.sender), resolvers);
    }

    function addResolversFor(uint ein, address[] calldata resolvers) public override {
        require(isResolverFor(ein, msg.sender), "ERC1484: Only a resolver of this identity can add resolvers.");
        _addResolvers(ein, resolvers);
    }

    function _addResolvers(uint ein, address[] calldata resolvers) private {
        for(uint i=0; i<resolvers.length; i++) {
            einToIdentity[ein].resolvers.insert(resolvers[i]);
            emit ResolverAdded(msg.sender, ein, resolvers[i]);
        }
    }
    
    function removeResolvers(address[] calldata resolvers) public override {
        _removeResolvers(getEIN(msg.sender), resolvers);
    }

    function removeResolversFor(uint ein, address[] calldata resolvers) public override {
        require(isResolverFor(ein, msg.sender), "ERC1484: Only a resolver of this identity can remove resolvers.");
        _removeResolvers(ein, resolvers);
    }

    function _removeResolvers(uint ein, address[] calldata resolvers) private {
        for(uint i=0; i<resolvers.length; i++) {
            einToIdentity[ein].resolvers.remove(resolvers[i]);
            emit ResolverRemoved(msg.sender,ein, resolvers[i]);
        }
    }

    // Recovery Management Functions ///////////////////////////////////////////////////////////////////////////////////
    function triggerRecoveryAddressChange(address newRecoveryAddress) public override {
        _triggerRecoveryAddressChange(getEIN(msg.sender), newRecoveryAddress);
        

    }
    function triggerRecoveryAddressChangeFor(uint ein, address newRecoveryAddress) public override {
        require(isProviderFor(ein, msg.sender), "ERC1484: Only provider");
        _triggerRecoveryAddressChange(ein, newRecoveryAddress);
    }

    function _triggerRecoveryAddressChange(uint ein, address newRecoveryAddress) private {
        Identity storage i = einToIdentity[ein];
        address currentOld = newToOld[i.recoveryAddress];
        if(currentOld != address(0))
            require(!canOldRecover(i.recoveryAddress), "ERC1484: Cannot change recovery address 2 times in <14 days");
        recoveryAddressTime[i.recoveryAddress] = block.timestamp;
        newToOld[newRecoveryAddress] = i.recoveryAddress;
        i.recoveryAddress = newRecoveryAddress;
        emit RecoveryAddressChangeTriggered(msg.sender, ein, newToOld[newRecoveryAddress], newRecoveryAddress);
    }

    function triggerRecovery(uint ein, address newAssociatedAddress, uint8 v, bytes32 r, bytes32 s, uint timestamp)
        public override signatureTimeout(timestamp)
    {
        require(isSigned(newAssociatedAddress, msgApproveMe, v, r, s), "ERC1484: Address has not given you rights to be associated to an identity.");

        Identity storage iden = einToIdentity[ein];
        if(msg.sender != iden.recoveryAddress) {
            require(msg.sender == newToOld[iden.recoveryAddress] && canOldRecover(iden.recoveryAddress), "ERC1484: Don't have rights to  trigger recovery.");
        }

        recoveryLogs[ein] = Recovery(block.timestamp, keccak256(abi.encodePacked(iden.associatedAddresses.members)));
        emit RecoveryTriggered(msg.sender, ein, iden.associatedAddresses.members, newAssociatedAddress);

        for (uint i=0; i< iden.associatedAddresses.length(); i++) {
            delete associatedToEin[iden.associatedAddresses.members[i]];
        }
        delete iden.associatedAddresses;
        delete iden.providers;
        iden.recoveryAddress = msg.sender;
        _addAssociatedAddress(newAssociatedAddress, ein);

    
    }

    function triggerDestruction(
        uint ein, address[] calldata firstChunk, address[] calldata lastChunk, bool resetResolvers
    ) public override 
    {
        require((block.timestamp - recoveryLogs[ein].timestamp) < 14 days, "No recent recovery");
        address [1] memory middleChunk = [msg.sender];
        require(
            keccak256(
                abi.encodePacked(firstChunk, middleChunk, lastChunk)
            ) == recoveryLogs[ein].hashedOldAssociatedAddresses,
            "Cannot destroy an EIN from an address that was not recently removed from said EIN via recovery."
        );

        Identity storage iden = einToIdentity[ein];

        emit IdentityDestroyed(msg.sender, ein, iden.recoveryAddress, resetResolvers);
        
        for (uint i=0; i< iden.associatedAddresses.length(); i++) {
            delete associatedToEin[iden.associatedAddresses.members[i]];
        }
        delete iden.associatedAddresses;
        delete iden.providers;
        if(resetResolvers) delete iden.resolvers;
        delete iden.recoveryAddress;
    }
    
}
