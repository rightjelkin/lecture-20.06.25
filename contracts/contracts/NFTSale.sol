// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IMyNFT
 * @notice Interface for the MyNFT contract to allow NFTSale to call its functions.
 */
interface IMyNFT {
    /**
     * @notice Transfers a token to another address.
     * @param to The new owner.
     * @param tokenId The token ID to transfer.
     */
    function transfer(address to, uint256 tokenId) external;
}

/**
 * @title NFTSale
 * @author Your Name
 * @notice A contract for the primary sale of MyNFT tokens.
 * This contract sells NFTs it owns at a fixed price. Buyers can choose a specific token ID.
 */
contract NFTSale {
    // State Variables
    IMyNFT private _nft;
    address private _owner;
    
    uint256 public constant NFT_PRICE = 0.005 ether;

    // Events
    event TokenSold(address indexed buyer, uint256 indexed tokenId);

    // Errors
    error NotOwner();
    error IncorrectPayment();
    error WithdrawalFailed();

    /**
     * @notice Initializes the contract with the NFT contract address.
     * @param nftAddress The address of the MyNFT contract.
     */
    constructor(address nftAddress) {
        _owner = msg.sender;
        _nft = IMyNFT(nftAddress);
    }

    // Modifier
    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        if (msg.sender != _owner) {
            revert NotOwner();
        }
        _;
    }

    /**
     * @notice Allows a user to buy a specific NFT by its ID.
     * The function is payable and requires a payment equal to NFT_PRICE.
     * It transfers the specified NFT to the buyer.
     * @param tokenId The ID of the token to purchase.
     */
    function buyToken(uint256 tokenId) public payable {
        if (msg.value != NFT_PRICE) {
            revert IncorrectPayment();
        }

        // The NFTSale contract calls the transfer function on the MyNFT contract.
        // This will only succeed if the NFTSale contract is the owner of the token.
        _nft.transfer(msg.sender, tokenId);

        emit TokenSold(msg.sender, tokenId);
    }

    /**
     * @notice Allows the owner to withdraw the entire contract balance.
     */
    function withdraw() public onlyOwner {
        (bool success, ) = _owner.call{value: address(this).balance}("");
        if (!success) {
            revert WithdrawalFailed();
        }
    }
    
    /**
     * @notice Returns the address of the current owner.
     */
    function getOwner() public view returns (address) {
        return _owner;
    }

    /**
     * @notice Returns the address of the NFT contract.
     */
    function getNFTContractAddress() public view returns (address) {
        return address(_nft);
    }
} 