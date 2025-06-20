import { expect } from "chai";
import { ethers } from "hardhat";
import { MyNFT } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("MyNFT", function () {
    let myNFT: MyNFT;
    let owner: HardhatEthersSigner;
    let addr1: HardhatEthersSigner;
    let addr2: HardhatEthersSigner;
    const tokenName = "MyNFT";
    const tokenSymbol = "MNFT";

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const MyNFTFactory = await ethers.getContractFactory("MyNFT");
        myNFT = await MyNFTFactory.deploy(tokenName, tokenSymbol);
    });

    describe("Deployment", function () {
        it("Should set the right name and symbol", async function () {
            expect(await myNFT.name()).to.equal(tokenName);
            expect(await myNFT.symbol()).to.equal(tokenSymbol);
        });

        it("Should set the right owner", async function () {
            expect(await myNFT.getOwner()).to.equal(owner.address);
        });
    });

    describe("Minting", function () {
        it("Should allow the owner to mint a new token", async function () {
            const tokenURI = "https://example.com/token/1";
            await expect(myNFT.mint(addr1.address, tokenURI))
                .to.emit(myNFT, "Transfer")
                .withArgs(ethers.ZeroAddress, addr1.address, 1);

            expect(await myNFT.ownerOf(1)).to.equal(addr1.address);
            expect(await myNFT.balanceOf(addr1.address)).to.equal(1);
            expect(await myNFT.tokenURI(1)).to.equal(tokenURI);
        });

        it("Should not allow a non-owner to mint", async function () {
            const tokenURI = "https://example.com/token/1";
            await expect(
                myNFT.connect(addr1).mint(addr2.address, tokenURI)
            ).to.be.revertedWithCustomError(myNFT, "NotOwner");
        });

        it("Should not mint to the zero address", async function () {
            const tokenURI = "https://example.com/token/1";
            await expect(
                myNFT.mint(ethers.ZeroAddress, tokenURI)
            ).to.be.revertedWithCustomError(myNFT, "InvalidRecipient");
        });
    });

    describe("Transfers", function () {
        const tokenURI = "https://example.com/token/1";
        const tokenId = 1;

        beforeEach(async function () {
            await myNFT.mint(addr1.address, tokenURI);
        });

        it("Should allow the owner of a token to transfer it", async function () {
            await expect(myNFT.connect(addr1).transfer(addr2.address, tokenId))
                .to.emit(myNFT, "Transfer")
                .withArgs(addr1.address, addr2.address, tokenId);

            expect(await myNFT.ownerOf(tokenId)).to.equal(addr2.address);
            expect(await myNFT.balanceOf(addr1.address)).to.equal(0);
            expect(await myNFT.balanceOf(addr2.address)).to.equal(1);
        });

        it("Should not allow a non-owner to transfer a token", async function () {
            await expect(
                myNFT.connect(addr2).transfer(owner.address, tokenId)
            ).to.be.revertedWithCustomError(myNFT, "NotTokenOwner");
        });

        it("Should not transfer to the zero address", async function () {
            await expect(
                myNFT.connect(addr1).transfer(ethers.ZeroAddress, tokenId)
            ).to.be.revertedWithCustomError(myNFT, "InvalidRecipient");
        });
    });

    describe("View Functions", function () {
        const tokenURI = "https://example.com/token/1";
        const tokenId = 1;

        beforeEach(async function () {
            await myNFT.mint(addr1.address, tokenURI);
        });

        it("balanceOf should return the correct balance", async function () {
            expect(await myNFT.balanceOf(addr1.address)).to.equal(1);
            expect(await myNFT.balanceOf(addr2.address)).to.equal(0);
        });

        it("ownerOf should return the correct owner", async function () {
            expect(await myNFT.ownerOf(tokenId)).to.equal(addr1.address);
        });

        it("tokenURI should return the correct URI", async function () {
            expect(await myNFT.tokenURI(tokenId)).to.equal(tokenURI);
        });

        it("ownerOf should revert for a non-existent token", async function () {
            await expect(myNFT.ownerOf(999)).to.be.revertedWithCustomError(
                myNFT,
                "TokenNotFound"
            ).withArgs(999);
        });

        it("tokenURI should revert for a non-existent token", async function () {
            await expect(myNFT.tokenURI(999)).to.be.revertedWithCustomError(
                myNFT,
                "TokenNotFound"
            ).withArgs(999);
        });
    });
}); 