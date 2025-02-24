// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./RoyaltyManager.sol";

contract Marketplace is ReentrancyGuard {
    IERC721 public artworkToken;
    RoyaltyManager public royaltyManager;

    struct Listing {
        address fractionToken;
        uint256 totalFractions;
        uint256 availableFractions;
        uint256 pricePerFraction;
    }

    mapping(uint256 => Listing) public listings;

    event ArtworkListed(uint256 tokenId, address fractionToken, uint256 totalFractions, uint256 pricePerFraction);
    event FractionsPurchased(uint256 tokenId, address buyer, uint256 amount);

    constructor(address _artworkToken, address _royaltyManager) {
        artworkToken = IERC721(_artworkToken);
        royaltyManager = RoyaltyManager(_royaltyManager);
    }

    function listArtwork(uint256 tokenId, address fractionToken, uint256 totalFractions, uint256 pricePerFraction) external {
        require(artworkToken.ownerOf(tokenId) == msg.sender, "Not the owner");
        listings[tokenId] = Listing(fractionToken, totalFractions, totalFractions, pricePerFraction);
        emit ArtworkListed(tokenId, fractionToken, totalFractions, pricePerFraction);
    }

    function purchaseFractions(uint256 tokenId, uint256 amount) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.availableFractions >= amount, "Not enough fractions available");
        require(msg.value >= listing.pricePerFraction * amount, "Insufficient payment");

        listing.availableFractions -= amount;
        
        IERC20(listing.fractionToken).transfer(msg.sender, amount);

        address artist = artworkToken.ownerOf(tokenId);
        uint256 royaltyAmount = royaltyManager.calculateRoyalty(msg.value);
        payable(artist).transfer(royaltyAmount);

        payable(artworkToken.ownerOf(tokenId)).transfer(msg.value - royaltyAmount);

        emit FractionsPurchased(tokenId, msg.sender, amount);
    }
}

