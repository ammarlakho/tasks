const { expect } = require("chai");
const { MerkleTree } = require('../scripts/merkle.js');

const { keccak256, bufferToHex, toBuffer } = require('ethereumjs-util');

describe("MerkleVerifier", function() {
    let instance;
    let accounts;
    beforeEach(async () => {
        accounts = await ethers.getSigners();
        MerkleVerifier = await ethers.getContractFactory("MerkleVerifier");
        instance = await MerkleVerifier.deploy();
        await instance.deployed();
      });
    describe("Basic", () => {
        it("should return true if correct", async () => {
            const elements = [accounts[0].address, accounts[1].address, accounts[2].address, accounts[3].address];
            const leaf = elements[3];
            const merkleTree = new MerkleTree(elements);
            const root = merkleTree.getHexRoot();
            const proof = merkleTree.getHexProof(leaf);

            let ans = await instance.verify(proof, root, leaf);
            console.log(`Verify: ${ans}`);
            expect(ans).to.equal(true);
        });

        it("should return false if incorrect", async() => {
            const elements = [accounts[0].address, accounts[1].address, accounts[2].address, accounts[3].address];
            const merkleTree = new MerkleTree(elements);
            const actualLeaf = elements[0];
            const root = merkleTree.getHexRoot();
            const proof = merkleTree.getHexProof(actualLeaf);
            const wrongLeaf = accounts[5].address        

            let ans = await instance.verify(proof, root, wrongLeaf);
            console.log(`Verify: ${ans}`);
            expect(ans).to.equal(false);
        })
    });
});
