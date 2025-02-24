// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RoyaltyManager is Ownable {
    uint256 public royaltyPercentage = 10; // 10% royalty

    constructor(address initialOwner) Ownable(initialOwner) {
        // The deployer (or specified address) becomes the owner
    }

    function setRoyaltyPercentage(uint256 _percentage) external onlyOwner {
        require(_percentage <= 100, "Percentage must be between 0 and 100");
        royaltyPercentage = _percentage;
    }

    function calculateRoyalty(uint256 amount) public view returns (uint256) {
        return (amount * royaltyPercentage) / 100;
    }
}
