// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

/**
 * @title Factory to create ERC-721, ERC-1155 contracts
 */


import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract ERC1155Template is ERC1155, ERC1155URIStorage, Ownable, ReentrancyGuard {
    using Address for address;
    
    constructor() ERC1155("") {}

    function uri(uint256 tokenId) public view override(ERC1155, ERC1155URIStorage) returns (string memory) {
        return ERC1155URIStorage.uri(tokenId);
    }

    function setURI(uint256 tokenId, string memory _tokenURI) external onlyOwner nonReentrant {
        _setURI(tokenId, _tokenURI);
    }

    function setBaseURI(string memory baseURI) external onlyOwner nonReentrant {
        _setBaseURI(baseURI);
    }

    function mint(
        address to,
        uint256 id,
        uint256 value,
        bytes memory data
    ) external onlyOwner nonReentrant {
        _mint(to, id, value, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory values,
        bytes memory data
    ) external onlyOwner nonReentrant {
        _mintBatch(to, ids, values, data);
    }

    function burn(
        address owner,
        uint256 id,
        uint256 value
    ) external nonReentrant {
        _burn(owner, id, value);
    }

    function burnBatch(
        address owner,
        uint256[] memory ids,
        uint256[] memory values
    ) external nonReentrant {
        _burnBatch(owner, ids, values);
    }
}

contract ERC721Template is ERC721URIStorage, Ownable, ReentrancyGuard { 
    using Address for address;

    string private _baseTokenURI;

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string calldata newBaseTokenURI) external onlyOwner nonReentrant {
        _baseTokenURI = newBaseTokenURI;
    }

    function baseURI() external view returns (string memory) {
        return _baseURI();
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) external onlyOwner nonReentrant {
        _setTokenURI(tokenId, _tokenURI);
    }

    function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    function mint(address to, uint256 tokenId) external onlyOwner nonReentrant {
        _mint(to, tokenId);
    }

     function mintBatch(
        address to,
        uint256[] memory tokenIds
    ) external onlyOwner nonReentrant {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _mint(to, tokenIds[i]);
        }
    }

    function safeMint(address to, uint256 tokenId) external onlyOwner nonReentrant {
        _safeMint(to, tokenId);
    }

    function safeMint(
        address to,
        uint256 tokenId,
        bytes memory _data
    ) external onlyOwner nonReentrant {
        _safeMint(to, tokenId, _data);
    }

    function burn(uint256 tokenId) external nonReentrant {
        _burn(tokenId);
    }

}


contract NFTFactory is Pausable , ReentrancyGuard  {
    using Address for address;

     enum Role {
        UNAUTHORIZED,
        ADMIN
    }

    // maps to the nft contract to the ID 
    mapping(uint256 => address) public nfts;
    uint256 public nftCount;
    // ACL
    mapping(address => Role) private permissions;

    event Created(uint256 indexed count, address owner, address nft, bool is1155);

    constructor() public {
        permissions[msg.sender] = Role.ADMIN;
    }

    function createERC1155() external whenNotPaused nonReentrant {

        nftCount += 1;

        ERC1155Template erc1155Token = new ERC1155Template();
        erc1155Token.transferOwnership(msg.sender);
        
        nfts[nftCount] = address(erc1155Token);

        emit Created(nftCount, msg.sender, address(erc1155Token), true);
    }

    function createERC721(string memory _name, string memory _symbol) external whenNotPaused nonReentrant {

        nftCount += 1;

        ERC721Template erc721Token = new ERC721Template(_name, _symbol);
        erc721Token.transferOwnership(msg.sender);

        nfts[nftCount] = address(erc721Token);
        
        emit Created(nftCount, msg.sender, address(erc721Token), false);
    }

    

    // ADMIN
    // give a specific permission to the given address
    function grant(address _address, Role _role) external onlyAdmin {
        require(_address != msg.sender, "You cannot grant yourself");
        permissions[_address] = _role;
    }

    // remove any permission binded to the given address
    function revoke(address _address) external onlyAdmin {
        require(_address != msg.sender, "You cannot revoke yourself");
        permissions[_address] = Role.UNAUTHORIZED;
    }

    // pause the contract
    function setPaused() external onlyAdmin whenNotPaused {
        _pause();
    }

    // unpause the contract
    function setUnpaused() external onlyAdmin whenPaused {
        _unpause();
    }

    // INTERNAL FUNCTIONS

    modifier onlyAdmin() {
        require(
            permissions[msg.sender] == Role.ADMIN,
            "Caller is not the admin"
        );
        _;
    }

}