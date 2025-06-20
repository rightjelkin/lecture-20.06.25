import { ethers } from "hardhat";

// !!! ВАЖНО !!!
// 1. Сначала запустите скрипт deploy-contracts.ts.
// 2. Замените адреса-плейсхолдеры на адреса, полученные после деплоя.
const MY_NFT_ADDRESS = "YOUR_MY_NFT_CONTRACT_ADDRESS";
const NFT_SALE_ADDRESS = "YOUR_NFT_SALE_CONTRACT_ADDRESS";

/**
 * Массив URI для метаданных NFT, которые вы хотите создать.
 * Каждый URI должен указывать на JSON-файл, соответствующий стандарту метаданных ERC721.
 * Например: "ipfs://bafkre..." или "https://..."
 */
const TOKEN_URIS: string[] = [
  // Пока что массив пуст, как и было запрошено.
  // Примеры для заполнения:
  // "https://gateway.pinata.cloud/ipfs/Qm...",
  // "https://gateway.pinata.cloud/ipfs/Qm...",
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