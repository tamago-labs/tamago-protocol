//SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract NFT is ERC721 {
    using Address for address;

    uint256 constant public totalSupply = 127;

    uint256 tokenCount;

    constructor(address _firstOwner) ERC721("VINTAGE TV", "VINTAGE") {
        for (uint256 i = 0; i < totalSupply; i++) {
            _mint(_firstOwner, i+1);
        }
    }

    function _baseURI() internal override pure returns (string memory) {
        return "ipfs://bafybeih7qz547xmcy3fkzhbihdeiigbs7dvpafiqu2u3ita5v57pxysgm4/";
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

}
