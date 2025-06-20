import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts...");

  // 1. Deploy MyNFT contract
  const myNFT = await ethers.deployContract("MyNFT", ["Bedolagi", "BDLG"]);
  await myNFT.waitForDeployment();
  const myNFTAddress = await myNFT.getAddress();

  console.log(`MyNFT contract deployed to: ${myNFTAddress}`);

  // 2. Deploy NFTSale contract
  const nftSale = await ethers.deployContract("NFTSale", [myNFTAddress]);
  await nftSale.waitForDeployment();
  const nftSaleAddress = await nftSale.getAddress();

  console.log(`NFTSale contract deployed to: ${nftSaleAddress}`);
  console.log("\nDeployment complete!");
  console.log("----------------------------------------------------");
  console.log("MyNFT address:", myNFTAddress);
  console.log("NFTSale address:", nftSaleAddress);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 