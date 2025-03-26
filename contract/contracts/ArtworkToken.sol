// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract ArtworkToken is ERC721URIStorage {

    uint256 private _tokenIds;

    constructor() ERC721("Fractional Art", "FART") {}

    function mint(address artist, string memory tokenURI) external returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _safeMint(artist, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        return newTokenId;
    }
}

