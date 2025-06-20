// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MyNFT
 * @author Your Name
 * @notice A simplified, educational implementation of an ERC721-like NFT contract.
 * This contract is for demonstration purposes and is written from scratch
 * without relying on external libraries like OpenZeppelin.
 */
contract MyNFT {
    // State Variables

    // Token Details
    string public name;
    string public symbol;

    // Ownership and Balances
    address private _owner;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;

    // Token Metadata
    mapping(uint256 => string) private _tokenURIs;
    uint256 private _tokenIdCounter;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    // Errors
    error NotOwner();
    error NotTokenOwner(address spender, address owner, uint256 tokenId);
    error InvalidRecipient();
    error TokenNotFound(uint256 tokenId);


    /**
     * @notice Sets the contract deployer as the owner and initializes token details.
     * @param _name The name of the token collection.
     * @param _symbol The symbol of the token collection.
     */
    constructor(string memory _name, string memory _symbol) {
        _owner = msg.sender;
        name = _name;
        symbol = _symbol;
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

    // View Functions

    /**
     * @notice Gets the balance of the specified address.
     * @param owner The address to query the balance of.
     * @return The number of tokens owned by the `owner`.
     */
    function balanceOf(address owner) public view returns (uint256) {
        return _balances[owner];
    }

    /**
     * @notice Gets the owner of the specified token ID.
     * @param tokenId The token ID to find the owner of.
     * @return The owner's address.
     */
    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        if (owner == address(0)) {
            revert TokenNotFound(tokenId);
        }
        return owner;
    }

    /**
     * @notice Gets the Uniform Resource Identifier (URI) for a token ID.
     * @param tokenId The token ID to query the URI for.
     * @return The URI string.
     */
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        if (!_exists(tokenId)) {
            revert TokenNotFound(tokenId);
        }
        return _tokenURIs[tokenId];
    }
    
    /**
     * @notice Returns the address of the current owner.
     */
    function getOwner() public view returns (address) {
        return _owner;
    }

    // Public Functions

    /**
     * @notice Mints a new token and assigns it to an address.
     * @dev Can only be called by the contract owner.
     * @param to The address to mint the new token to.
     * @param uri The URI for the new token's metadata.
     */
    function mint(address to, string memory uri) public onlyOwner {
        if (to == address(0)) {
            revert InvalidRecipient();
        }
        
        uint256 newTokenId = ++_tokenIdCounter;
        _owners[newTokenId] = to;
        _balances[to] += 1;
        _tokenURIs[newTokenId] = uri;

        emit Transfer(address(0), to, newTokenId);
    }

    /**
     * @notice Transfers a token to another address.
     * @dev The caller must be the owner of the token.
     * @param to The new owner.
     * @param tokenId The token ID to transfer.
     */
    function transfer(address to, uint256 tokenId) public {
        address from = msg.sender;
        address tokenOwner = ownerOf(tokenId); // Also checks if the token exists

        if (tokenOwner != from) {
            revert NotTokenOwner(from, tokenOwner, tokenId);
        }

        if (to == address(0)) {
            revert InvalidRecipient();
        }

        // Update balances
        _balances[from] -= 1;
        _balances[to] += 1;
        
        // Transfer ownership
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    // Internal Functions

    /**
     * @dev Internal function to check if a token ID has been minted.
     * @param tokenId The token ID to check.
     * @return True if the token exists, false otherwise.
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }
} 