const { expect } = require("chai");
const { ethers } = require("hardhat");

// const { deployContract, MockProvider } = require("ethereum-waffle");

describe("ERC1484", () => {
  let instance;
  let existingI;
  let existingA;
  let existingP, existingR;
  let existingP_address = [];
  let existingR_address = [];
  beforeEach(async () => {
    [addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9, addr10] = await ethers.getSigners();
    existingA = addr1;
    existingP = [addr2, addr3];
    existingR = [addr4, addr5];
    existingP_address = [addr2.address, addr3.address];
    existingR_address = [addr4.address, addr5.address];

    const ERC1484 = await hre.ethers.getContractFactory("ERC1484");
    instance = await ERC1484.deploy();

    await instance.connect(existingA).createIdentity(addr10.address, existingP_address, existingR_address);
    existingI = await instance.getEIN(existingA.address);
  });
  
  describe("Basic", () => {
    it("should return false if identity does not exist", async () => {
      expect(await instance.identityExists(2)).to.equal(false);
    });

    it("should return false if address doesn't have any identity", async function() {
      expect(await instance.hasIdentity(addr2.address)).to.equal(false);
    });
  });

  describe("Creating Identites", () => {
    it("should allow creation of identity for yourself", async () => {
      let providers = [addr9.address, addr10.address];
      let resolvers = [addr7.address, addr8.address];
      let recoveryAddress = addr5.address;
      let creator = addr6;
      await instance.connect(creator).createIdentity(recoveryAddress, providers, resolvers);

      let EIN = await instance.getEIN(creator.address);
      expect(await instance.identityExists(EIN)).to.equal(true);
      let identity = await instance.getIdentity(EIN);
      expect(await identity.recoveryAddress).to.equal(recoveryAddress);
      expect(await instance.isAssociatedAddressFor(EIN, creator.address)).to.equal(true);
      for(let i=0; i<providers.length; i++) {
        expect(await instance.isProviderFor(EIN, providers[i])).to.equal(true);
      }
      for(let i=0; i<resolvers.length; i++) {
        expect(await instance.isResolverFor(EIN, resolvers[i])).to.equal(true);
      }
    })

    it("should allow creation of identity for any address that has given you the required signature", async () => {
      let providers = [addr9.address];
      let resolvers = [addr7.address, addr8.address];
      let recoveryAddress = addr5.address;
      let msgSender = addr6;
      let associated = addr10;
      let msgHash = ethers.utils.arrayify(ethers.utils.id("Authorized the creation of an identity."));
      let sig = await associated.signMessage(msgHash);
      [r, s, v] = await instance.splitSignature(sig);
      let timestamp = Math.floor(Date.now() / 1000);

      await instance.connect(msgSender).createIdentityDelegated(recoveryAddress, associated.address, providers, resolvers, v, r, s, timestamp);

      let EIN = await instance.getEIN(associated.address);
      expect(await instance.identityExists(EIN)).to.equal(true);
      let identity = await instance.getIdentity(EIN);
      expect(await identity.recoveryAddress).to.equal(recoveryAddress);
      expect(await instance.isAssociatedAddressFor(EIN, associated.address)).to.equal(true);
      for(let i=0; i<providers.length; i++) {
        expect(await instance.isProviderFor(EIN, providers[i])).to.equal(true);
      }
      for(let i=0; i<resolvers.length; i++) {
        expect(await instance.isResolverFor(EIN, resolvers[i])).to.equal(true);
      }
    })

    it("should NOT allow creation of identity for any address that hasn't given you the required signature", async () => {
      let providers = [addr9.address];
      let resolvers = [addr7.address, addr8.address];
      let recoveryAddress = addr5.address;
      let msgSender = addr6;
      let associated = addr10;
      let msgHash = ethers.utils.arrayify(ethers.utils.id("Wrong sig"));
      let sig = await associated.signMessage(msgHash);
      [r, s, v] = await instance.splitSignature(sig);
      let timestamp = Math.floor(Date.now() / 1000);

      await expect(
        instance.connect(msgSender).createIdentityDelegated(recoveryAddress, associated.address, 
        providers, resolvers, v, r, s, timestamp)).
        to.be.revertedWith("ERC1484: Address has not given you rights to be associated to an identity.");
    })

  });

  describe("Adding/removing associated addresses", () => {
    it("should allow an associated address to add another one, having required sig from the address to be added", async () => {
      let addressToAdd = addr6;
      let msgHash = ethers.utils.arrayify(ethers.utils.id("Authorized the creation of an identity."));
      let sig = await addressToAdd.signMessage(msgHash);
      [r, s, v] = await instance.splitSignature(sig);
      let timestamp = Math.floor(Date.now() / 1000);

      expect(await instance.isAssociatedAddressFor(existingI, addressToAdd.address)).to.equal(false);
      await instance.connect(existingA).addAssociatedAddress(existingA.address, addressToAdd.address, v, r, s, timestamp)
      expect(await instance.isAssociatedAddressFor(existingI, addressToAdd.address)).to.equal(true);
    })

    it("should NOT allow an associated address to add another one, not having required sig from the address to be added", async () => {
      let addressToAdd = addr6;
      let msgHash = ethers.utils.arrayify(ethers.utils.id("AAAAA"));
      let sig = await addressToAdd.signMessage(msgHash);
      [r, s, v] = await instance.splitSignature(sig);
      let timestamp = Math.floor(Date.now() / 1000);

      await expect(instance.connect(existingA).addAssociatedAddress(existingA.address, addressToAdd.address, v, r, s, timestamp))
            .to.be.revertedWith("ERC1484: Address has not given you rights to be associated to an identity.");
    })

    it("should allow any address to add an associated address to an existing identity, having required sigs from existing associated address and the address to be added", async () => {
      let addressToAdd = addr6;
      let msgHashOther = ethers.utils.arrayify(ethers.utils.id("Authorized the approval of another approved address."));
      let sigOther = await existingA.signMessage(msgHashOther);
      [r0, s0, v0] = await instance.splitSignature(sigOther);
      let msgHashMe = ethers.utils.arrayify(ethers.utils.id("Authorized the creation of an identity."));
      let sigMe = await addressToAdd.signMessage(msgHashMe);
      [r1, s1, v1] = await instance.splitSignature(sigMe);
      let timestamp = Math.floor(Date.now() / 1000);

      expect(await instance.isAssociatedAddressFor(existingI, addressToAdd.address)).to.equal(false);
      await instance.connect(existingA).addAssociatedAddressDelegated(
        existingA.address, addressToAdd.address, [v0, v1], [r0, r1], [s0, s1], [timestamp, timestamp]) 
      expect(await instance.isAssociatedAddressFor(existingI, addressToAdd.address)).to.equal(true);
    })

    it("should NOT allow any address to add an associated address to an existing identity, not having required sig from existing associated address", async () => {
      let addressToAdd = addr6;
      let msgHashOther = ethers.utils.arrayify(ethers.utils.id("A"));
      let sigOther = await existingA.signMessage(msgHashOther);
      [r0, s0, v0] = await instance.splitSignature(sigOther);
      let msgHashMe = ethers.utils.arrayify(ethers.utils.id("Authorized the creation of an identity."));
      let sigMe = await addressToAdd.signMessage(msgHashMe);
      [r1, s1, v1] = await instance.splitSignature(sigMe);
      let timestamp = Math.floor(Date.now() / 1000);
      // "ERC1484: Address has not given you rights to be associated to an identity."

      await expect(instance.connect(existingA).addAssociatedAddressDelegated(
        existingA.address, addressToAdd.address, [v0, v1], [r0, r1], [s0, s1], [timestamp, timestamp]))
        .to.be.revertedWith("ERC1484: Associated address has not given you rights to be add another associated address.") 
    })

    it("should NOT allow any address to add an associated address to an existing identity, not having required sig from the address to be added.", async () => {
      let addressToAdd = addr6;
      let msgHashOther = ethers.utils.arrayify(ethers.utils.id("Authorized the approval of another approved address."));
      let sigOther = await existingA.signMessage(msgHashOther);
      [r0, s0, v0] = await instance.splitSignature(sigOther);
      let msgHashMe = ethers.utils.arrayify(ethers.utils.id("A."));
      let sigMe = await addressToAdd.signMessage(msgHashMe);
      [r1, s1, v1] = await instance.splitSignature(sigMe);
      let timestamp = Math.floor(Date.now() / 1000);
      

      await expect(instance.connect(existingA).addAssociatedAddressDelegated(
        existingA.address, addressToAdd.address, [v0, v1], [r0, r1], [s0, s1], [timestamp, timestamp]))
        .to.be.revertedWith("ERC1484: Address has not given you rights to be associated to an identity.");
    })

    it("should allow removing an associated address that has an identity", async () => {
      let addressToRemove = addr1;
      await instance.connect(addressToRemove).removeAssociatedAddress();
      expect(await instance.isAssociatedAddressFor(existingI, addressToRemove.address)).to.equal(false);
    })

    it("should NOT allow removing an address that isn't associated to an identity", async () => {
      let addressToRemove = addr2;
      await expect(instance.connect(addressToRemove).removeAssociatedAddress()).to.be.revertedWith("ERC1484: Address doesn't have an identity");
    })

    it("should allow removing an associated address, having a signature from it", async () => {
      let addressToRemove = addr1;
      let msgHash = ethers.utils.arrayify(ethers.utils.id("Authorized the removal of the approved address."));
      let sig = await addr1.signMessage(msgHash);
      [r, s, v] = await instance.splitSignature(sig);
      let timestamp = Math.floor(Date.now() / 1000)

      await instance.connect(addr10).removeAssociatedAddressDelegated(addressToRemove.address, v, r, s, timestamp);
      expect(await instance.isAssociatedAddressFor(existingI, addressToRemove.address)).to.equal(false);
    })

    it("should NOT allow removing an associated address, having a signature from it", async () => {
      let addressToRemove = addr1;
      let msgHash = ethers.utils.arrayify(ethers.utils.id("Au."));
      let sig = await addressToRemove.signMessage(msgHash);
      [r, s, v] = await instance.splitSignature(sig);
      let timestamp = Math.floor(Date.now() / 1000);

      await expect(instance.connect(addr10).removeAssociatedAddressDelegated(addressToRemove.address, v, r, s, timestamp))
            .to.be.revertedWith("ERC1484: Address has not given you rights to remove it from being associated to an identity.");
    })
  });
  
  describe("Adding/Removing providers and resolvers", () => {
    it("should allow adding providers for your identity", async () => {
      let providers = [addr6.address, addr7.address];
      await instance.connect(existingA).addProviders(providers);
      expect(await instance.isProviderFor(existingI, providers[0])).to.equal(true);
      expect(await instance.isProviderFor(existingI, providers[1])).to.equal(true);
    })

    it("should allow adding providers for an identity you are a provider for", async () => {
      let providers = [addr6.address, addr7.address];
      await instance.connect(existingP[0]).addProvidersFor(existingI, providers);
      expect(await instance.isProviderFor(existingI, providers[0])).to.equal(true);
      expect(await instance.isProviderFor(existingI, providers[1])).to.equal(true);
    })

    it("should NOT allow adding providers for an identity you are neither provider/associated for", async () => {
      let providers = [addr6.address, addr7.address];
      await expect(instance.connect(addr10).addProvidersFor(existingI, providers)).to.be.revertedWith("ERC1484: Only a provider of this identity can add providers.");
    })

    it("should allow removing providers for your identity", async () => {
      await instance.connect(existingA).removeProviders(existingP_address);
      for(let i=0; i<existingP_address.length; i++) {
        expect(await instance.isProviderFor(existingI, existingP_address[i])).to.equal(false);
      }
    })

    it("should allow removing providers for an identity you are a provider for", async () => {
      await instance.connect(existingP[1]).removeProvidersFor(existingI, existingP_address);
      for(let i=0; i<existingP_address.length; i++) {
        expect(await instance.isProviderFor(existingI, existingP_address[i])).to.equal(false);
      }
    })

    it("should NOT allow removing providers for an identity you are neither provider/associated for", async () => {
      await expect(instance.connect(addr10).removeProvidersFor(existingI, existingP_address)).to.be.revertedWith("ERC1484: Only a provider of this identity can remove providers.")
    })


    it("should allow adding resolvers for your identity", async () => {
      let resolvers = [addr8.address, addr9.address];
      await instance.connect(existingA).addResolvers(resolvers);
      expect(await instance.isResolverFor(existingI, resolvers[0])).to.equal(true);
      expect(await instance.isResolverFor(existingI, resolvers[1])).to.equal(true);
    })

    it("should allow adding resolvers for an identity you are a resolver for", async () => {
      let resolvers = [addr6.address, addr7.address];
      await instance.connect(existingR[0]).addResolversFor(existingI, resolvers);
      expect(await instance.isResolverFor(existingI, resolvers[0])).to.equal(true);
      expect(await instance.isResolverFor(existingI, resolvers[1])).to.equal(true);
    })

    it("should NOT allow adding resolvers for an identity you are neither resolver/associated for", async () => {
      let resolvers = [addr6.address, addr7.address];
      await expect(instance.connect(addr10).addResolversFor(existingI, resolvers)).to.be.revertedWith("ERC1484: Only a resolver of this identity can add resolvers.");
    })

    it("should allow removing resolvers for your identity", async () => {
      await instance.connect(existingA).removeResolvers(existingR_address);
      for(let i=0; i<existingR_address.length; i++) {
        expect(await instance.isResolverFor(existingI, existingR_address[i])).to.equal(false);
      }
    })

    it("should allow removing resolvers for an identity you are a resolver for", async () => {
      await instance.connect(existingR[1]).removeResolversFor(existingI, existingR_address);
      for(let i=0; i<existingR_address.length; i++) {
        expect(await instance.isResolverFor(existingI, existingR_address[i])).to.equal(false);
      }
    })

    it("should NOT allow removing resolvers for an identity you are neither resolver/associated for", async () => {
      await expect(instance.connect(addr10).removeResolversFor(existingI, existingR_address)).to.be.revertedWith("ERC1484: Only a resolver of this identity can remove resolvers.")
    })

  });

  describe("RecoveryAddresss Changes", () => {
    it("should allow changing recovery address for your identity", async () => {
      let newAddress = addr9.address
      let [recoveryAddress] = await instance.getIdentity(existingI);
      expect(recoveryAddress).to.not.equal(newAddress);
      await instance.connect(existingA).triggerRecoveryAddressChange(newAddress);
      [recoveryAddress] = await instance.getIdentity(existingI);
      expect(recoveryAddress).to.equal(newAddress);
    })
    
    it("should NOT allow changing recovery address twice in <14 days", async () => {
      await instance.connect(existingA).triggerRecoveryAddressChange(addr9.address);
      await expect(instance.connect(existingA).triggerRecoveryAddressChange(addr8.address)).
            to.be.revertedWith("ERC1484: Cannot change recovery address 2 times in <14 days");
    })

    it("should allow changing recovery address for an identity you are a provider for", async () => {
      let newAddress = addr9.address
      let [recoveryAddress] = await instance.getIdentity(existingI);
      expect(recoveryAddress).to.not.equal(newAddress);
      await instance.connect(existingP[0]).triggerRecoveryAddressChangeFor(existingI, newAddress);
      [recoveryAddress] = await instance.getIdentity(existingI);
      expect(recoveryAddress).to.equal(newAddress);
    })
  });

  describe("Triggering Recovery", () => {
    it("should allow to trigger recovery with current recovery address", async () => {
      let associated = addr6;
      let msgHash = ethers.utils.arrayify(ethers.utils.id("Authorized the creation of an identity."));
      let sig = await associated.signMessage(msgHash);
      [r, s, v] = await instance.splitSignature(sig);
      let timestamp = Math.floor(Date.now() / 1000);
      let [recoveryAddress, associatedAddresses, providers, resolvers] = await instance.getIdentity(existingI); 

      await instance.connect(addr10).triggerRecovery(existingI, associated.address, v, r, s, timestamp);
      
      for(let i=0; i<associatedAddresses.length; i++) {
        expect(await instance.isAssociatedAddressFor(existingI, associatedAddresses[i])).to.equal(false);
      }
      for(let i=0; i<providers.length; i++) {
        expect(await instance.isProviderFor(existingI, providers[i])).to.equal(false);
      }
      expect(await instance.isAssociatedAddressFor(existingI, associated.address)).to.equal(true);
    })

    it("should allow to trigger recovery with old recovery address", async () => {
      await instance.connect(existingP[0]).triggerRecoveryAddressChangeFor(existingI, addr9.address);

      let associated = addr6;
      let msgHash = ethers.utils.arrayify(ethers.utils.id("Authorized the creation of an identity."));
      let sig = await associated.signMessage(msgHash);
      [r, s, v] = await instance.splitSignature(sig);
      let timestamp = Math.floor(Date.now() / 1000);
      let [recoveryAddress, associatedAddresses, providers, resolvers] = await instance.getIdentity(existingI); 

      await instance.connect(addr10).triggerRecovery(existingI, associated.address, v, r, s, timestamp);
      
      for(let i=0; i<associatedAddresses.length; i++) {
        expect(await instance.isAssociatedAddressFor(existingI, associatedAddresses[i])).to.equal(false);
      }
      for(let i=0; i<providers.length; i++) {
        expect(await instance.isProviderFor(existingI, providers[i])).to.equal(false);
      }
      expect(await instance.isAssociatedAddressFor(existingI, associated.address)).to.equal(true);
    })
  });

  describe("Triggering Destruction", () => {
    it("should allow to trigger destruction with old associated address", async () => {
      let associated = addr6;
      let msgHash = ethers.utils.arrayify(ethers.utils.id("Authorized the creation of an identity."));
      let sig = await associated.signMessage(msgHash);
      [r, s, v] = await instance.splitSignature(sig);
      let timestamp = Math.floor(Date.now() / 1000);
      
      await instance.connect(addr10).triggerRecovery(existingI, associated.address, v, r, s, timestamp);
      expect(await instance.identityExists(existingI)).to.equal(true);
      await instance.connect(existingA).triggerDestruction(existingI, [], [], true);
      expect(await instance.identityExists(existingI)).to.equal(false);


    })

  })


});


// const ERC1484 = await hre.ethers.getContractFactory("ERC1484", { libraries: { AddressSet: "0x5FbDB2315678afecb367f032d93F642f64180aa3" }});