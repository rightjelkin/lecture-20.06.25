import { ethers } from "hardhat";

// !!! ВАЖНО !!!
// 1. Сначала запустите скрипт deploy-contracts.ts.
// 2. Замените адреса-плейсхолдеры на адреса, полученные после деплоя.
const MY_NFT_ADDRESS = "0x7F90f7B124710D87Fb7237760F992778c98bBEA8";
const NFT_SALE_ADDRESS = "0xBAf5AA83FfEc70dd50339435354F01bc7C37FFCc";

/**
 * Массив URI для метаданных NFT, которые вы хотите создать.
 * Каждый URI должен указывать на JSON-файл, соответствующий стандарту метаданных ERC721.
 * Например: "ipfs://bafkre..." или "https://..."
 * Здесь просто ссылки на картинки в этом же репо :)
 */
const TOKEN_URIS: string[] = [
  "https://raw.githubusercontent.com/rightjelkin/lecture-20.06.25/c33b6e9e99906407131feabe21c9538719f06e70/contracts/nft-images/1.png",
  "https://raw.githubusercontent.com/rightjelkin/lecture-20.06.25/c33b6e9e99906407131feabe21c9538719f06e70/contracts/nft-images/2.png",
  "https://raw.githubusercontent.com/rightjelkin/lecture-20.06.25/c33b6e9e99906407131feabe21c9538719f06e70/contracts/nft-images/3.png",
  "https://raw.githubusercontent.com/rightjelkin/lecture-20.06.25/c33b6e9e99906407131feabe21c9538719f06e70/contracts/nft-images/4.png",
  "https://raw.githubusercontent.com/rightjelkin/lecture-20.06.25/c33b6e9e99906407131feabe21c9538719f06e70/contracts/nft-images/5.png",
  "https://raw.githubusercontent.com/rightjelkin/lecture-20.06.25/c33b6e9e99906407131feabe21c9538719f06e70/contracts/nft-images/6.png"
];

async function main() {
  if (MY_NFT_ADDRESS.startsWith("YOUR_") || NFT_SALE_ADDRESS.startsWith("YOUR_")) {
    console.error("Пожалуйста, замените адреса контрактов в скрипте mint-nfts.ts");
    process.exit(1);
  }

  if (TOKEN_URIS.length === 0) {
    console.log("Массив TOKEN_URIS пуст. Создавать нечего. Скрипт завершает работу.");
    return;
  }

  console.log(`Подключаемся к контракту MyNFT по адресу: ${MY_NFT_ADDRESS}`);
  const myNFT = await ethers.getContractAt("MyNFT", MY_NFT_ADDRESS);

  console.log(`Начинаем минтинг ${TOKEN_URIS.length} NFT на адрес контракта NFTSale: ${NFT_SALE_ADDRESS}`);

  for (let i = 0; i < TOKEN_URIS.length; i++) {
    const uri = TOKEN_URIS[i];
    const tokenId = i + 1;
    console.log(`Минтим токен #${tokenId} с URI: ${uri}`);

    try {
        const tx = await myNFT.mint(NFT_SALE_ADDRESS, uri);
        await tx.wait(); // Ожидаем подтверждения транзакции
        console.log(`- Успешно создан NFT с tokenId: ${tokenId} на адрес ${NFT_SALE_ADDRESS}`);
    } catch (e) {
        console.error(`- Ошибка при создании токена #${tokenId}:`, e);
        break; // Прерываем цикл в случае ошибки
    }
  }

  console.log("\nПроцесс минтинга завершен!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 