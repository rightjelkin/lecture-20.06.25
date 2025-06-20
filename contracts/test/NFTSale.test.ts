import { expect } from "chai";
import { ethers } from "hardhat";
import { MyNFT, NFTSale } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("NFTSale", function () {
    let myNFT: MyNFT;
    let nftSale: NFTSale;
    let owner: HardhatEthersSigner;
    let buyer: HardhatEthersSigner;
    let anotherUser: HardhatEthersSigner;

    const nftPrice = ethers.parseEther("0.005");

    beforeEach(async function () {
        [owner, buyer, anotherUser] = await ethers.getSigners();

        // Deploy MyNFT
        const MyNFTFactory = await ethers.getContractFactory("MyNFT");
        myNFT = await MyNFTFactory.deploy("My Test NFT", "MTN");

        // Deploy NFTSale
        const NFTSaleFactory = await ethers.getContractFactory("NFTSale");
        nftSale = await NFTSaleFactory.deploy(await myNFT.getAddress());

        // Mint some NFTs to the NFTSale contract
        // The NFTSale contract will be the owner of these tokens
        await myNFT.mint(await nftSale.getAddress(), "token1.json"); // tokenId 1
        await myNFT.mint(await nftSale.getAddress(), "token2.json"); // tokenId 2
    });

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await nftSale.getOwner()).to.equal(owner.address);
        });

        it("Should set the correct NFT contract address", async function () {
            expect(await nftSale.getNFTContractAddress()).to.equal(await myNFT.getAddress());
        });

        it("Should have the correct NFT price", async function () {
            expect(await nftSale.NFT_PRICE()).to.equal(nftPrice);
        });
    });

    describe("Buying a Token", function () {
        it("Should allow a user to buy a token with the correct payment", async function () {
            const tokenId = 1;
            
            await expect(nftSale.connect(buyer).buyToken(tokenId, { value: nftPrice }))
                .to.emit(nftSale, "TokenSold")
                .withArgs(buyer.address, tokenId);

            // Verify the new owner of the NFT
            expect(await myNFT.ownerOf(tokenId)).to.equal(buyer.address);

            // Verify the balance of the NFTSale contract
            expect(await ethers.provider.getBalance(await nftSale.getAddress())).to.equal(nftPrice);
        });

        it("Should revert if payment is incorrect", async function () {
            const tokenId = 1;
            const wrongPrice = ethers.parseEther("0.001");
            await expect(
                nftSale.connect(buyer).buyToken(tokenId, { value: wrongPrice })
            ).to.be.revertedWithCustomError(nftSale, "IncorrectPayment");
        });

        it("Should revert if trying to buy a token not owned by the sale contract", async function () {
            // Mint a token to another user, not the sale contract
            await myNFT.mint(anotherUser.address, "token3.json"); // tokenId 3
            const tokenId = 3;

            // This will fail inside MyNFT.transfer with NotTokenOwner
            // We check for that specific error from the MyNFT contract
            await expect(
                nftSale.connect(buyer).buyToken(tokenId, { value: nftPrice })
            ).to.be.revertedWithCustomError(myNFT, "NotTokenOwner");
        });

        it("Should revert if trying to buy a token that does not exist", async function () {
            const nonExistentTokenId = 999;
             // This will fail inside MyNFT.ownerOf with TokenNotFound
            await expect(
                nftSale.connect(buyer).buyToken(nonExistentTokenId, { value: nftPrice })
            ).to.be.revertedWithCustomError(myNFT, "TokenNotFound");
        });
    });

    describe("Withdrawal", function () {
        const tokenId = 1;

        beforeEach(async function() {
            // A buyer purchases a token, so the contract has funds
            await nftSale.connect(buyer).buyToken(tokenId, { value: nftPrice });
        });

        it("Should allow the owner to withdraw funds", async function () {
            const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
            const tx = await nftSale.connect(owner).withdraw();
            const receipt = await tx.wait();
            const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

            const finalOwnerBalance = await ethers.provider.getBalance(owner.address);

            expect(await ethers.provider.getBalance(await nftSale.getAddress())).to.equal(0);
            expect(finalOwnerBalance).to.equal(initialOwnerBalance + nftPrice - gasUsed);
        });

        it("Should not allow a non-owner to withdraw funds", async function () {
            await expect(
                nftSale.connect(buyer).withdraw()
            ).to.be.revertedWithCustomError(nftSale, "NotOwner");
        });
    });
}); 