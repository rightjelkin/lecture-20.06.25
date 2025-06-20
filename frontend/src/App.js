import React, { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import NFTGrid from './components/NFTGrid';

import myNFTAbi from './abi/MyNFT.json';
import nftSaleAbi from './abi/NFTSale.json';
import './App.css';

// --- Конфигурация ---
const SEPOLIA_RPC_URL = process.env.REACT_APP_SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
const MY_NFT_ADDRESS = "0x7F90f7B124710D87Fb7237760F992778c98bBEA8";
const NFT_SALE_ADDRESS = "0xBAf5AA83FfEc70dd50339435354F01bc7C37FFCc";
const SEPOLIA_CHAIN_ID = 11155111;
const TOTAL_NFT_COUNT = 6;
const NFT_PRICE = ethers.parseEther("0.005");
// --------------------

function App() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [txStatus, setTxStatus] = useState({ status: 'idle', message: '' });

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask to use this app.");
        return;
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const network = await provider.getNetwork();
      if (network.chainId !== ethers.toBigInt(SEPOLIA_CHAIN_ID)) {
          try {
              await window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: ethers.toBeHex(SEPOLIA_CHAIN_ID) }],
              });
          } catch (switchError) {
              if (switchError.code === 4902) {
                  alert('Please add the Sepolia network to MetaMask and try again.');
              } else {
                  alert('Failed to switch to the Sepolia network. Please do it manually.');
              }
              return;
          }
      }

      const accounts = await provider.send('eth_requestAccounts', []);
      const userSigner = await provider.getSigner();
      
      setAccount(accounts[0]);
      setSigner(userSigner);

    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  const shortAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const fetchNfts = useCallback(async () => {
    setLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
      const contract = new ethers.Contract(MY_NFT_ADDRESS, myNFTAbi.abi, provider);

      const nftData = [];
      for (let i = 1; i <= TOTAL_NFT_COUNT; i++) {
        try {
          const owner = await contract.ownerOf(i);
          const tokenUri = await contract.tokenURI(i);
          
          nftData.push({
            id: i,
            image: tokenUri,
            owner: owner,
            isForSale: owner.toLowerCase() === NFT_SALE_ADDRESS.toLowerCase(),
          });
        } catch (e) {
          console.warn(`Could not fetch data for token ${i}:`, e);
        }
      }
      setNfts(nftData);
    } catch (error) {
      console.error("Error fetching NFT data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const buyNft = async (tokenId) => {
    if (!signer) {
      alert("Please connect your wallet first and make sure you are on the Sepolia network.");
      return;
    }

    try {
      setTxStatus({ status: 'pending', message: 'Please confirm the transaction in your wallet...' });
      const saleContract = new ethers.Contract(NFT_SALE_ADDRESS, nftSaleAbi.abi, signer);
      
      const tx = await saleContract.buyToken(tokenId, { value: NFT_PRICE });
      setTxStatus({ status: 'mining', message: `Transaction is mining... Hash: ${shortAddress(tx.hash)}` });
      
      await tx.wait();

      setTxStatus({ status: 'success', message: 'Purchase successful! 🎉 Your NFT is on its way.' });
      
      setNfts(prevNfts => prevNfts.map(nft => 
        nft.id === tokenId 
          ? { ...nft, owner: account, isForSale: false } 
          : nft
      ));

      setTimeout(() => setTxStatus({ status: 'idle', message: '' }), 5000);

    } catch (error) {
      console.error("Purchase failed:", error);
      const errorMessage = error.reason || "An error occurred during the transaction.";
      setTxStatus({ status: 'error', message: `Purchase failed: ${errorMessage}` });
      setTimeout(() => setTxStatus({ status: 'idle', message: '' }), 5000);
    }
  };

  useEffect(() => {
    if(window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if(accounts.length > 0) {
          setAccount(accounts[0]);
          const provider = new ethers.BrowserProvider(window.ethereum);
          provider.getSigner().then(setSigner);
        } else {
          setAccount(null);
          setSigner(null);
        }
      });
    }
    fetchNfts();
  }, [fetchNfts]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Bedolagi NFT Marketplace</h1>
        <p>The one and only place to get your Bedolaga</p>
        <div className="wallet-connector">
          {account ? (
            <div className="address-display">
              <span className="address-label">Your address:</span>
              <span className="address-value" title={account}>{shortAddress(account)}</span>
            </div>
          ) : (
            <button onClick={connectWallet} className="connect-wallet-btn">
              Connect Wallet
            </button>
          )}
        </div>
      </header>
      <main>
        {txStatus.status !== 'idle' && (
          <div className={`tx-status-banner ${txStatus.status}`}>
            {txStatus.message}
          </div>
        )}
        <NFTGrid nfts={nfts} loading={loading} onBuyClick={buyNft} txStatus={txStatus} />
      </main>
    </div>
  );
}

export default App;
