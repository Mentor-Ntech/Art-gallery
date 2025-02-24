// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ArtworkToken.sol";
import "./FractionToken.sol";
import "./Marketplace.sol";
import "./RoyaltyManager.sol";

contract FractionalArtGallery is Ownable {
    ArtworkToken public artworkToken;
    Marketplace public marketplace;
    RoyaltyManager public royaltyManager;

    constructor(address initialOwner) Ownable(initialOwner) {  
        artworkToken = new ArtworkToken();
        royaltyManager = new RoyaltyManager(initialOwner);  // ✅ Pass initialOwner here
        marketplace = new Marketplace(address(artworkToken), address(royaltyManager));
    }

    function createArtwork(
        string memory tokenURI, 
        uint256 totalFractions, 
        uint256 pricePerFraction
    ) external returns (uint256) 
    {
        uint256 tokenId = artworkToken.mint(msg.sender, tokenURI);
        FractionToken newFractionToken = new FractionToken(totalFractions);
        marketplace.listArtwork(tokenId, address(newFractionToken), totalFractions, pricePerFraction);
        return tokenId;
    }
}
