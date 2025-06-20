import React from 'react';
import './NFTCard.css';

const NFTCard = ({ nft, onBuyClick, txStatus }) => {
  const shortAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const isBuying = txStatus.status === 'pending' || txStatus.status === 'mining';

  return (
    <div className="nft-card">
      <img src={nft.image} alt={`NFT ${nft.id}`} className="nft-image" />
      <div className="nft-info">
        <h3 className="nft-title">Bedolaga #{nft.id}</h3>
        {nft.isForSale ? (
          <button 
            onClick={() => onBuyClick(nft.id)} 
            className="buy-button"
            disabled={isBuying}
          >
            {isBuying ? 'Processing...' : 'Buy'}
          </button>
        ) : (
          <div className="owner-info">
            <span className="owner-label">Owner:</span>
            <span className="owner-address" title={nft.owner}>{shortAddress(nft.owner)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTCard; 