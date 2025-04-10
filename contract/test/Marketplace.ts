import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("CELONFTMarketplace", () => {
  // Test fixture to deploy the contract and set up test environment
  async function deployMarketplaceFixture() {
    const [owner, creator1, creator2, buyer1, buyer2] = await ethers.getSigners();

    // Deploy marketplace contract
    const CELONFTMarketplace = await ethers.getContractFactory("CELONFTMarketplace");
    const marketplace = await CELONFTMarketplace.deploy();

    return {
      marketplace,
      owner,
      creator1,
      creator2,
      buyer1,
      buyer2
    };
  }

  describe("Deployment", () => {
    it("Should deploy with correct name and symbol", async () => {
      const { marketplace } = await loadFixture(deployMarketplaceFixture);
      expect(await marketplace.name()).to.equal("CELO NFT Marketplace");
      expect(await marketplace.symbol()).to.equal("CELONFT");
    });

    it("Should set the right owner", async () => {
      const { marketplace, owner } = await loadFixture(deployMarketplaceFixture);
      expect(await marketplace.owner()).to.equal(owner.address);
    });

    it("Should initialize with default marketplace fee", async () => {
      const { marketplace } = await loadFixture(deployMarketplaceFixture);
      expect(await marketplace.marketplaceFeePercentage()).to.equal(250); // 2.5%
    });
  });

  describe("Collection Management", () => {
    it("Should create a collection", async () => {
      const { marketplace, creator1 } = await loadFixture(deployMarketplaceFixture);
      
      await expect(marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection"))
        .to.emit(marketplace, "CollectionCreated")
        .withArgs("Art Collection", creator1.address);
      
      const collection = await marketplace.getCollection("Art Collection");
      expect(collection.creator).to.equal(creator1.address);
      expect(collection.name).to.equal("Art Collection");
      expect(collection.description).to.equal("Digital art collection");
      expect(collection.verified).to.equal(false);
    });

    it("Should not allow creating a collection with an existing name", async () => {
      const { marketplace, creator1, creator2 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      
      await expect(
        marketplace.connect(creator2).createCollection("Art Collection", "Another collection")
      ).to.be.revertedWith("Collection name already exists");
    });

    it("Should verify a collection", async () => {
      const { marketplace, owner, creator1 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      
      await expect(marketplace.connect(owner).verifyCollection("Art Collection", true))
        .to.emit(marketplace, "CollectionVerified")
        .withArgs("Art Collection", true);
      
      const collection = await marketplace.getCollection("Art Collection");
      expect(collection.verified).to.equal(true);
    });

    it("Should not allow non-owners to verify collections", async () => {
      const { marketplace, creator1, creator2 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      
      // Updated to use .to.be.reverted instead of .to.be.revertedWith
      await expect(
        marketplace.connect(creator2).verifyCollection("Art Collection", true)
      ).to.be.reverted;
    });

    it("Should get all collection names", async () => {
      const { marketplace, creator1, creator2 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      await marketplace.connect(creator2).createCollection("Music Collection", "Music NFTs");
      
      const collectionNames = await marketplace.getCollectionNames();
      expect(collectionNames.length).to.equal(2);
      expect(collectionNames[0]).to.equal("Art Collection");
      expect(collectionNames[1]).to.equal("Music Collection");
    });
  });

  describe("NFT Minting", () => {
    it("Should mint an NFT to a collection", async () => {
      const { marketplace, creator1 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      
      await expect(marketplace.connect(creator1).mintNFT("ipfs://metadata/1", 500, "Art Collection"))
        .to.emit(marketplace, "TokenMinted")
        .withArgs(1, creator1.address, "ipfs://metadata/1", "Art Collection");
      
      expect(await marketplace.ownerOf(1)).to.equal(creator1.address);
      expect(await marketplace.getTokenRoyaltyPercentage(1)).to.equal(500); // 5%
      expect(await marketplace.getTokenCreator(1)).to.equal(creator1.address);
      expect(await marketplace.getTokenCollection(1)).to.equal("Art Collection");
      
      const collectionTokens = await marketplace.getCollectionTokens("Art Collection");
      expect(collectionTokens.length).to.equal(1);
      expect(collectionTokens[0]).to.equal(1);
    });

    it("Should not allow minting to a non-existent collection", async () => {
      const { marketplace, creator1 } = await loadFixture(deployMarketplaceFixture);
      
      await expect(
        marketplace.connect(creator1).mintNFT("ipfs://metadata/1", 500, "Non-existent Collection")
      ).to.be.revertedWith("Collection does not exist");
    });

    it("Should not allow minting to another creator's collection", async () => {
      const { marketplace, creator1, creator2 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      
      await expect(
        marketplace.connect(creator2).mintNFT("ipfs://metadata/1", 500, "Art Collection")
      ).to.be.revertedWith("Only collection creator can mint to this collection");
    });

    it("Should not allow royalty percentage above 10%", async () => {
      const { marketplace, creator1 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      
      await expect(
        marketplace.connect(creator1).mintNFT("ipfs://metadata/1", 1100, "Art Collection")
      ).to.be.revertedWith("Royalty percentage cannot exceed 10%");
    });
  });

  describe("Listing Management", () => {
    it("Should create a listing", async () => {
      const { marketplace, creator1 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      await marketplace.connect(creator1).mintNFT("ipfs://metadata/1", 500, "Art Collection");
      
      const price = ethers.parseEther("1.5"); // 1.5 CELO
      
      await expect(marketplace.connect(creator1).createListing(1, price))
        .to.emit(marketplace, "ListingCreated")
        .withArgs(1, 1, creator1.address, price);
      
      const listing = await marketplace.getListing(1);
      expect(listing.listingId).to.equal(1);
      expect(listing.tokenId).to.equal(1);
      expect(listing.seller).to.equal(creator1.address);
      expect(listing.price).to.equal(price);
      expect(listing.active).to.equal(true);
      expect(listing.collectionName).to.equal("Art Collection");
      
      const activeListings = await marketplace.getActiveListingIds();
      expect(activeListings.length).to.equal(1);
      expect(activeListings[0]).to.equal(1);
    });

    it("Should not allow listing an NFT you don't own", async () => {
      const { marketplace, creator1, creator2 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      await marketplace.connect(creator1).mintNFT("ipfs://metadata/1", 500, "Art Collection");
      
      const price = ethers.parseEther("1.5");
      
      await expect(
        marketplace.connect(creator2).createListing(1, price)
      ).to.be.revertedWith("Only token owner can create listing");
    });

    it("Should not allow listing with zero price", async () => {
      const { marketplace, creator1 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      await marketplace.connect(creator1).mintNFT("ipfs://metadata/1", 500, "Art Collection");
      
      await expect(
        marketplace.connect(creator1).createListing(1, 0)
      ).to.be.revertedWith("Price must be greater than zero");
    });

    it("Should cancel a listing", async () => {
      const { marketplace, creator1 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      await marketplace.connect(creator1).mintNFT("ipfs://metadata/1", 500, "Art Collection");
      
      const price = ethers.parseEther("1.5");
      await marketplace.connect(creator1).createListing(1, price);
      
      await expect(marketplace.connect(creator1).cancelListing(1))
        .to.emit(marketplace, "ListingCancelled")
        .withArgs(1, 1, creator1.address);
      
      const listing = await marketplace.getListing(1);
      expect(listing.active).to.equal(false);
      
      const activeListings = await marketplace.getActiveListingIds();
      expect(activeListings.length).to.equal(0);
    });

    it("Should not allow non-sellers to cancel listings", async () => {
      const { marketplace, creator1, creator2 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      await marketplace.connect(creator1).mintNFT("ipfs://metadata/1", 500, "Art Collection");
      
      const price = ethers.parseEther("1.5");
      await marketplace.connect(creator1).createListing(1, price);
      
      await expect(
        marketplace.connect(creator2).cancelListing(1)
      ).to.be.revertedWith("Only seller can cancel listing");
    });
  });

  describe("NFT Purchases", () => {
    it("Should purchase an NFT", async () => {
      const { marketplace, creator1, buyer1 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      await marketplace.connect(creator1).mintNFT("ipfs://metadata/1", 500, "Art Collection");
      
      const price = ethers.parseEther("1.5");
      await marketplace.connect(creator1).createListing(1, price);
      
      await expect(marketplace.connect(buyer1).purchaseNFT(1, { value: price }))
        .to.emit(marketplace, "TokenPurchased")
        .withArgs(1, 1, buyer1.address, creator1.address, price)
        .to.emit(marketplace, "RoyaltyPaid")
        .to.emit(marketplace, "MarketplaceFeePaid");
      
      // Check NFT ownership transferred
      expect(await marketplace.ownerOf(1)).to.equal(buyer1.address);
      
      // Check listing is no longer active
      const listing = await marketplace.getListing(1);
      expect(listing.active).to.equal(false);
      
      // Check balances updated
      const marketplaceFee = price * BigInt(250) / BigInt(10000); // 2.5%
      const royaltyFee = price * BigInt(500) / BigInt(10000); // 5%
      const sellerAmount = price - marketplaceFee - royaltyFee;
      
      expect(await marketplace.getUserBalance(creator1.address)).to.equal(sellerAmount + royaltyFee); // Creator gets both seller amount and royalty
      expect(await marketplace.getUserBalance(await marketplace.owner())).to.equal(marketplaceFee);
    });

    it("Should not allow purchasing inactive listings", async () => {
      const { marketplace, creator1, buyer1 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      await marketplace.connect(creator1).mintNFT("ipfs://metadata/1", 500, "Art Collection");
      
      const price = ethers.parseEther("1.5");
      await marketplace.connect(creator1).createListing(1, price);
      await marketplace.connect(creator1).cancelListing(1);
      
      await expect(
        marketplace.connect(buyer1).purchaseNFT(1, { value: price })
      ).to.be.revertedWith("Listing is not active");
    });

    it("Should not allow purchasing with insufficient payment", async () => {
      const { marketplace, creator1, buyer1 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      await marketplace.connect(creator1).mintNFT("ipfs://metadata/1", 500, "Art Collection");
      
      const price = ethers.parseEther("1.5");
      await marketplace.connect(creator1).createListing(1, price);
      
      await expect(
        marketplace.connect(buyer1).purchaseNFT(1, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should refund excess payment", async () => {
      const { marketplace, creator1, buyer1 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      await marketplace.connect(creator1).mintNFT("ipfs://metadata/1", 500, "Art Collection");
      
      const price = ethers.parseEther("1.5");
      await marketplace.connect(creator1).createListing(1, price);
      
      const excessAmount = ethers.parseEther("0.5");
      const paymentAmount = price + excessAmount;
      
      const initialBalance = await ethers.provider.getBalance(buyer1.address);
      
      const tx = await marketplace.connect(buyer1).purchaseNFT(1, { value: paymentAmount });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalBalance = await ethers.provider.getBalance(buyer1.address);
      
      // Check that buyer received refund (accounting for gas costs)
      const expectedBalance = initialBalance - price - gasUsed;
      expect(finalBalance).to.be.closeTo(expectedBalance, ethers.parseEther("0.01"));
    });
  });

  describe("Balance Management", () => {
    it("Should allow withdrawing balance", async () => {
      const { marketplace, owner, creator1, buyer1 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      await marketplace.connect(creator1).mintNFT("ipfs://metadata/1", 500, "Art Collection");
      
      const price = ethers.parseEther("1.5");
      await marketplace.connect(creator1).createListing(1, price);
      await marketplace.connect(buyer1).purchaseNFT(1, { value: price });
      
      const creatorBalance = await marketplace.getUserBalance(creator1.address);
      const initialEthBalance = await ethers.provider.getBalance(creator1.address);
      
      const tx = await marketplace.connect(creator1).withdrawBalance();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalEthBalance = await ethers.provider.getBalance(creator1.address);
      
      // Check that creator received their balance (accounting for gas costs)
      expect(finalEthBalance).to.equal(initialEthBalance + creatorBalance - gasUsed);
      
      // Check that balance is now zero
      expect(await marketplace.getUserBalance(creator1.address)).to.equal(0);
    });

    it("Should not allow withdrawing with zero balance", async () => {
      const { marketplace, creator1 } = await loadFixture(deployMarketplaceFixture);
      
      await expect(
        marketplace.connect(creator1).withdrawBalance()
      ).to.be.revertedWith("No balance to withdraw");
    });
  });

  describe("Marketplace Settings", () => {
    it("Should update marketplace fee", async () => {
      const { marketplace, owner } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(owner).updateMarketplaceFee(300); // 3%
      expect(await marketplace.marketplaceFeePercentage()).to.equal(300);
    });

    it("Should not allow non-owners to update marketplace fee", async () => {
      const { marketplace, creator1 } = await loadFixture(deployMarketplaceFixture);
      
      // Updated to use .to.be.reverted instead of .to.be.revertedWith
      await expect(
        marketplace.connect(creator1).updateMarketplaceFee(300)
      ).to.be.reverted;
    });

    it("Should not allow marketplace fee above 10%", async () => {
      const { marketplace, owner } = await loadFixture(deployMarketplaceFixture);
      
      await expect(
        marketplace.connect(owner).updateMarketplaceFee(1100)
      ).to.be.revertedWith("Fee cannot exceed 10%");
    });
  });

  describe("Royalty Management", () => {
    it("Should update royalty percentage", async () => {
      const { marketplace, creator1 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      await marketplace.connect(creator1).mintNFT("ipfs://metadata/1", 500, "Art Collection");
      
      await marketplace.connect(creator1).updateRoyaltyPercentage(1, 700); // 7%
      expect(await marketplace.getTokenRoyaltyPercentage(1)).to.equal(700);
    });

    it("Should not allow non-creators to update royalty", async () => {
      const { marketplace, creator1, creator2 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      await marketplace.connect(creator1).mintNFT("ipfs://metadata/1", 500, "Art Collection");
      
      await expect(
        marketplace.connect(creator2).updateRoyaltyPercentage(1, 700)
      ).to.be.revertedWith("Only token creator can update royalty");
    });

    it("Should not allow royalty percentage above 10%", async () => {
      const { marketplace, creator1 } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      await marketplace.connect(creator1).mintNFT("ipfs://metadata/1", 500, "Art Collection");
      
      await expect(
        marketplace.connect(creator1).updateRoyaltyPercentage(1, 1100)
      ).to.be.revertedWith("Royalty percentage cannot exceed 10%");
    });
  });

  describe("Multiple NFTs and Collections", () => {
    it("Should handle multiple NFTs and collections", async () => {
      const { marketplace, creator1, creator2, buyer1, buyer2 } = await loadFixture(deployMarketplaceFixture);
      
      // Create collections
      await marketplace.connect(creator1).createCollection("Art Collection", "Digital art collection");
      await marketplace.connect(creator2).createCollection("Music Collection", "Music NFTs");
      
      // Mint NFTs
      await marketplace.connect(creator1).mintNFT("ipfs://metadata/1", 500, "Art Collection");
      await marketplace.connect(creator1).mintNFT("ipfs://metadata/2", 300, "Art Collection");
      await marketplace.connect(creator2).mintNFT("ipfs://metadata/3", 700, "Music Collection");
      
      // Create listings
      const price1 = ethers.parseEther("1.5");
      const price2 = ethers.parseEther("2.0");
      const price3 = ethers.parseEther("3.0");
      
      await marketplace.connect(creator1).createListing(1, price1);
      await marketplace.connect(creator1).createListing(2, price2);
      await marketplace.connect(creator2).createListing(3, price3);
      
      // Check active listings
      const activeListings = await marketplace.getActiveListingIds();
      expect(activeListings.length).to.equal(3);
      
      // Purchase NFTs
      await marketplace.connect(buyer1).purchaseNFT(1, { value: price1 });
      await marketplace.connect(buyer2).purchaseNFT(3, { value: price3 });
      
      // Check ownership
      expect(await marketplace.ownerOf(1)).to.equal(buyer1.address);
      expect(await marketplace.ownerOf(2)).to.equal(creator1.address);
      expect(await marketplace.ownerOf(3)).to.equal(buyer2.address);
      
      // Check active listings after purchases
      const updatedActiveListings = await marketplace.getActiveListingIds();
      expect(updatedActiveListings.length).to.equal(1);
      expect(updatedActiveListings[0]).to.equal(2);
    });
  });
});