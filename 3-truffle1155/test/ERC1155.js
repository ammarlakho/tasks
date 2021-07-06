const truffleAssert = require('truffle-assertions');
const {expectRevert, send} = require('@openzeppelin/test-helpers');
const ERC1155 = artifacts.require("ERC1155");

contract("ERC1155", (accounts) => {
    let [alice, bob, charlie] = accounts;
    let ids = [1, 2];
    let amounts = [6, 9];
    let instance; 
    beforeEach(async () => {
        instance = await ERC1155.new();
        await instance.mint(alice, ids[0], amounts[0], {from: alice});
        await instance.mint(alice, 3, amounts[0], {from: alice});
        await instance.mint(alice, 4, amounts[0], {from: alice});
        await instance.mint(bob, ids[1], amounts[1], {from: bob});
    });
    it("should update balance after minting.", async () => {
        console.log(alice.address);
        let id = 4;
        let amount = 5;
        let initialBalance = await instance.balanceOf(alice, id, {from: alice});
        let tx = await instance.mint(alice, id, amount, {from: alice});
        let bool;
        truffleAssert.eventEmitted(tx, 'TransferSingle', (event) => {
            return true;
        });

        let finalBalance = await instance.balanceOf(alice, id, {from: alice});
        let change = finalBalance - initialBalance;
        assert.equal(change, amount); 
    })
    it("should not allow to set approval for someone else's tokens for yourself. ", async () => {
        await truffleAssert.reverts(instance.setApprovalForAll(bob, true, {from:bob}), "Operator cannot set approval for all!");
    })
    it("should allow to set approval for your tokens to someone else. ", async () => {
        await instance.setApprovalForAll(bob, true, {from:alice});
        let ans = await instance.isApprovedForAll(alice, bob);
        assert.equal(ans, true);
    })
    it("should allow to set approval for your tokens to someone else. ", async () => {
        await instance.setApprovalForAll(bob, true, {from:alice});
        let ans = await instance.isApprovedForAll(alice, bob);
        assert.equal(ans, true);
    })
    it("should allow transfer for tokens you own.", async () => {
        let id = 1;
        let amount = 3;
        let recipient = bob;
        let sender = alice;

        let initialBalance = await instance.balanceOf(recipient, id, {from: recipient});
        await instance.safeTransferFrom(sender, recipient, id, amount, "0x", {from: sender});
        let finalBalance = await instance.balanceOf(recipient, id, {from: recipient});
        let change = finalBalance - initialBalance;
        assert.equal(change, amount);
    })
    it("should allow transfer for tokens you operate.", async () => {
        let id = 1;
        let amount = 3;
        let operator = bob;
        let owner = alice;
        let recipient = charlie;

        await instance.setApprovalForAll(bob, true, {from: owner});
        let initialBalance = await instance.balanceOf(recipient, id, {from: recipient});
        await instance.safeTransferFrom(owner, recipient, id, amount, "0x", {from:operator});
        let finalBalance = await instance.balanceOf(recipient, id, {from: recipient});
        let change = finalBalance - initialBalance;
        assert.equal(change, amount);
    })
    it("should not allow transfer for tokens you don't own or operate.", async () => {
        let id = 1;
        let amount = 3;
        let owner = alice;
        let invalidSender = bob;
        let recipient = charlie;

        await truffleAssert.reverts(instance.safeTransferFrom(owner, recipient, id, amount, "0x", {from: invalidSender}), "Dont have permission to send this token.");
    })
    it("should not allow batch transfer if ids.length != amounts.length.", async () => {
        let id = 1;
        let amounts = [1, 1, 1, 1];
        let ids = [1, 3, 4];
        let sender = alice;
        let recipient = charlie;

        await truffleAssert.reverts(instance.safeBatchTransferFrom(sender, recipient, ids, amounts, "0x", {from: sender}), " Lengths of ids array != length of accounts array!");
    })
    it("should allow batch transfer for tokens you own (with correct array lengths)", async () => {
        let id = 1;
        let amounts = [1, 1, 1];
        let ids = [1, 3, 4];
        let sender = alice;
        let recipient = charlie;
        let bool = true;

        let initialBalances = [];
        for(let i=0; i<ids.length; i++) {
            initialBalances.push(await instance.balanceOf(recipient, ids[i], {from: recipient}));
        }

        await instance.safeBatchTransferFrom(sender, recipient, ids, amounts, "0x", {from: sender});
        let finalBalances = []
        for(let i=0; i<ids.length; i++) {
            finalBalances.push(await instance.balanceOf(recipient, ids[i], {from: recipient}));
        }

        for(let i=0; i<initialBalances.length; i++) {
            
            if(finalBalances[i] - initialBalances[i] != amounts[i])
                bool = false;
                break;
        }
        assert.equal(bool, true);
    })


})

// try {
//     //try to create the second zombie
//     await contractInstance.createRandomZombie(zombieNames[1], {from: alice});
//     assert(true);
//   }
//   catch (err) {
//     return;
//   }
// assert(false, "The contract did not throw.");