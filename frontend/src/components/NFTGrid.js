import React from 'react';
import NFTCard from './NFTCard';
import './NFTGrid.css';

const NFTGrid = ({ nfts, loading, onBuyClick, txStatus }) => {
  if (loading) {
    return <div className="loading-text">Loading NFTs...</div>;
  }

  if (nfts.length === 0) {
    return <div className="loading-text">No NFTs found.</div>;
  }

  return (
    <div className="nft-grid">
      {nfts.map((nft) => (
        <NFTCard key={nft.id} nft={nft} onBuyClick={onBuyClick} txStatus={txStatus} />
      ))}
    </div>
  );
};

export default NFTGrid; 