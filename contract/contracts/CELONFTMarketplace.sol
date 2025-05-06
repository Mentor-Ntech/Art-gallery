// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CELONFTMarketplace
 * @dev Implements a complete NFT marketplace with built-in NFT creation, listing, buying, and royalty distribution
 */
contract CELONFTMarketplace is ERC721URIStorage, Ownable, ReentrancyGuard {
    // Token and listing ID counters
    uint256 private _currentTokenId;
    uint256 private _currentListingId;
    
    // Marketplace fee percentage (in basis points, 100 = 1%)
    uint256 public marketplaceFeePercentage = 250; // 2.5% default fee
    
    // Mapping from token ID to royalty percentage (in basis points)
    mapping(uint256 => uint256) private _tokenRoyaltyPercentage;
    
    // Mapping from token ID to creator address
    mapping(uint256 => address) private _tokenCreator;
    
    // Mapping from token ID to collection name
    mapping(uint256 => string) private _tokenCollection;
    
    // Collection structure
    struct Collection {
        address creator;
        string name;
        string description;
        uint256[] tokenIds;
        bool verified;
    }
    
    // Listing structure
    struct Listing {
        uint256 listingId;
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
        string collectionName;
    }
    
    // Mapping from collection name to collection details
    mapping(string => Collection) private _collections;
    
    // Array to store all collection names
    string[] private _collectionNames;
    
    
    mapping(uint256 => Listing) private _listings;
    
    // Array to keep track of all active listing IDs
    uint256[] private _activeListingIds;
    
    // Mapping for user balances (earnings from sales and royalties)
    mapping(address => uint256) private _userBalances;
    
    // Events
    event TokenMinted(uint256 indexed tokenId, address indexed creator, string tokenURI, string collectionName);
    event ListingCreated(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, uint256 price);
    event ListingCancelled(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller);
    event TokenPurchased(uint256 indexed listingId, uint256 indexed tokenId, address indexed buyer, address seller, uint256 price);
    event RoyaltyPaid(uint256 indexed tokenId, address indexed creator, uint256 amount);
    event MarketplaceFeePaid(uint256 indexed tokenId, uint256 amount);
    event UserWithdrawal(address indexed user, uint256 amount);
    event CollectionCreated(string indexed name, address indexed creator);
    event CollectionVerified(string indexed name, bool verified);
    
    /**
     * @dev Constructor initializes the contract with a name and symbol
     */
    constructor() ERC721("CELO NFT Marketplace", "CELONFT") Ownable(msg.sender) {}
    
    /**
     * @dev Creates a new collection
     * @param name Collection name
     * @param description Collection description
     */
    function createCollection(string memory name, string memory description) external {
        require(bytes(name).length > 0, "Collection name cannot be empty");
        require(_collections[name].creator == address(0), "Collection name already exists");
        
        Collection storage newCollection = _collections[name];
        newCollection.creator = msg.sender;
        newCollection.name = name;
        newCollection.description = description;
        newCollection.verified = false;
        
        // Add to collection names array
        _collectionNames.push(name);
        
        emit CollectionCreated(name, msg.sender);
    }
    
    /**
     * @dev Verifies a collection (only owner)
     * @param name Collection name
     * @param verified Verification status
     */
    function verifyCollection(string memory name, bool verified) external onlyOwner {
        require(_collections[name].creator != address(0), "Collection does not exist");
        _collections[name].verified = verified;
        
        emit CollectionVerified(name, verified);
    }
    
    /**
     * @dev Mints a new NFT
     * @param tokenURI The token URI for metadata
     * @param royaltyPercentage Royalty percentage in basis points (100 = 1%)
     * @param collectionName Name of the collection to add the token to
     * @return The new token ID
     */
    function mintNFT(string memory tokenURI, uint256 royaltyPercentage, string memory collectionName) external returns (uint256) {
        require(royaltyPercentage <= 1000, "Royalty percentage cannot exceed 10%");
        require(_collections[collectionName].creator != address(0), "Collection does not exist");
        require(_collections[collectionName].creator == msg.sender, "Only collection creator can mint to this collection");
        
        // Increment token ID
        _currentTokenId += 1;
        uint256 newTokenId = _currentTokenId;
        
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        // Set royalty and creator info
        _tokenRoyaltyPercentage[newTokenId] = royaltyPercentage;
        _tokenCreator[newTokenId] = msg.sender;
        _tokenCollection[newTokenId] = collectionName;
        
        // Add token to collection
        _collections[collectionName].tokenIds.push(newTokenId);
        
        emit TokenMinted(newTokenId, msg.sender, tokenURI, collectionName);
        
        return newTokenId;
    }
    
    /**
     * @dev Creates a new listing for an NFT
     * @param tokenId The token ID to list
     * @param price The listing price in CELO
     * @return The new listing ID
     */
    function createListing(uint256 tokenId, uint256 price) external returns (uint256) {
        require(ownerOf(tokenId) == msg.sender, "Only token owner can create listing");
        require(price > 0, "Price must be greater than zero");
        
        // Get the collection name for this token
        string memory collectionName = _tokenCollection[tokenId];
        require(bytes(collectionName).length > 0, "Token not associated with a collection");
        
        // Increment listing ID
        _currentListingId += 1;
        uint256 newListingId = _currentListingId;
        
        // Approve the contract to transfer the NFT when sold
        approve(address(this), tokenId);
        
        // Create and store the listing
        Listing storage newListing = _listings[newListingId];
        newListing.listingId = newListingId;
        newListing.tokenId = tokenId;
        newListing.seller = msg.sender;
        newListing.price = price;
        newListing.active = true;
        newListing.collectionName = collectionName;
        
        // Add to active listings
        _activeListingIds.push(newListingId);
        
        emit ListingCreated(newListingId, tokenId, msg.sender, price);
        
        return newListingId;
    }
    
    /**
     * @dev Cancels an existing listing
     * @param listingId The listing ID to cancel
     */
    function cancelListing(uint256 listingId) external {
        Listing storage listing = _listings[listingId];
        
        require(listing.active, "Listing is not active");
        require(listing.seller == msg.sender, "Only seller can cancel listing");
        
        listing.active = false;
        
        // Remove from active listings
        for (uint i = 0; i < _activeListingIds.length; i++) {
            if (_activeListingIds[i] == listingId) {
                _activeListingIds[i] = _activeListingIds[_activeListingIds.length - 1];
                _activeListingIds.pop();
                break;
            }
        }
        
        emit ListingCancelled(listingId, listing.tokenId, msg.sender);
    }
    
    /**
     * @dev Purchases an NFT from a listing
     * @param listingId The listing ID to purchase
     */
    function purchaseNFT(uint256 listingId) external payable nonReentrant {
        Listing storage listing = _listings[listingId];
        
        require(listing.active, "Listing is not active");
        require(msg.value >= listing.price, "Insufficient payment");
        
        uint256 tokenId = listing.tokenId;
        address seller = listing.seller;
        uint256 price = listing.price;
        
        // Mark listing as inactive
        listing.active = false;
        
        // Remove from active listings
        for (uint i = 0; i < _activeListingIds.length; i++) {
            if (_activeListingIds[i] == listingId) {
                _activeListingIds[i] = _activeListingIds[_activeListingIds.length - 1];
                _activeListingIds.pop();
                break;
            }
        }
        
        // Calculate fees and royalties
        uint256 marketplaceFee = (price * marketplaceFeePercentage) / 10000;
        uint256 royaltyAmount = 0;
        
        if (_tokenRoyaltyPercentage[tokenId] > 0) {
            royaltyAmount = (price * _tokenRoyaltyPercentage[tokenId]) / 10000;
        }
        
        uint256 sellerAmount = price - marketplaceFee - royaltyAmount;
        
        // Transfer the NFT to the buyer
        _transfer(seller, msg.sender, tokenId);
        
        _userBalances[seller] += sellerAmount;
        
        // Add royalty to creator's balance
        if (royaltyAmount > 0) {
            address creator = _tokenCreator[tokenId];
            _userBalances[creator] += royaltyAmount;
            emit RoyaltyPaid(tokenId, creator, royaltyAmount);
        }
        
        // Add marketplace fee to contract owner's balance
        _userBalances[owner()] += marketplaceFee;
        emit MarketplaceFeePaid(tokenId, marketplaceFee);
        
        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        emit TokenPurchased(listingId, tokenId, msg.sender, seller, price);
    }
    
    /**
     * @dev Withdraws user's balance
     */
    function withdrawBalance() external nonReentrant {
        uint256 balance = _userBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");
        
        _userBalances[msg.sender] = 0;
        
        payable(msg.sender).transfer(balance);
        
        emit UserWithdrawal(msg.sender, balance);
    }
    
    /**
     * @dev Updates the marketplace fee percentage (only owner)
     * @param newFeePercentage New fee percentage in basis points
     */
    function updateMarketplaceFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "Fee cannot exceed 10%");
        marketplaceFeePercentage = newFeePercentage;
    }
    
    /**
     * @dev Updates royalty percentage for a token (only token creator)
     * @param tokenId Token ID
     * @param newRoyaltyPercentage New royalty percentage in basis points
     */
    function updateRoyaltyPercentage(uint256 tokenId, uint256 newRoyaltyPercentage) external {
        require(_tokenCreator[tokenId] == msg.sender, "Only token creator can update royalty");
        require(newRoyaltyPercentage <= 1000, "Royalty percentage cannot exceed 10%");
        
        _tokenRoyaltyPercentage[tokenId] = newRoyaltyPercentage;
    }
    
    /**
     * @dev Gets all active listing IDs
     * @return Array of active listing IDs
     */
    function getActiveListingIds() external view returns (uint256[] memory) {
        return _activeListingIds;
    }
    
    /**
     * @dev Gets listing details by ID
     * @param listingId Listing ID
     * @return Listing details
     */
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return _listings[listingId];
    }
    
    /**
     * @dev Gets user balance
     * @param user User address
     * @return User balance
     */
    function getUserBalance(address user) external view returns (uint256) {
        return _userBalances[user];
    }
    
    /**
     * @dev Gets token royalty percentage
     * @param tokenId Token ID
     * @return Royalty percentage in basis points
     */
    function getTokenRoyaltyPercentage(uint256 tokenId) external view returns (uint256) {
        return _tokenRoyaltyPercentage[tokenId];
    }
    
    /**
     * @dev Gets token creator
     * @param tokenId Token ID
     * @return Creator address
     */
    function getTokenCreator(uint256 tokenId) external view returns (address) {
        return _tokenCreator[tokenId];
    }
    
    /**
     * @dev Gets collection details
     * @param name Collection name
     * @return Collection details
     */
    function getCollection(string memory name) external view returns (Collection memory) {
        return _collections[name];
    }
    
    /**
     * @dev Gets all collection names
     * @return Array of collection names
     */
    function getCollectionNames() public view returns (string[] memory) {
        return _collectionNames;
    }
    
    /**
     * @dev Gets all tokens in a collection
     * @param collectionName Collection name
     * @return Array of token IDs
     */
    function getCollectionTokens(string memory collectionName) external view returns (uint256[] memory) {
        require(_collections[collectionName].creator != address(0), "Collection does not exist");
        return _collections[collectionName].tokenIds;
    }
    
    /**
     * @dev Gets the collection name for a token
     * @param tokenId Token ID
     * @return Collection name
     */
    function getTokenCollection(uint256 tokenId) external view returns (string memory) {
        return _tokenCollection[tokenId];
    }
    
    /**
     * @dev Gets the current token ID
     * @return Current token ID
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _currentTokenId;
    }
    
    /**
     * @dev Gets the current listing ID
     * @return Current listing ID
     */
    function getCurrentListingId() external view returns (uint256) {
        return _currentListingId;
    }
}