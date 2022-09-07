// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

/**
 * @title Factory to create ERC-721, ERC-1155 contracts
 */

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
// import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract ERC721TG is ERC721URIStorage, Ownable, ReentrancyGuard { 
    using Address for address;

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        
    }

    /// @notice check whether the token ID is exists
    /// @param tokenId the ID to be checked
    function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    /// @notice mint the token
    /// @param to the recipient address
    /// @param tokenId the ID to be minted
    /// @param _tokenURI the URI of the token ID above
    function mint(address to, uint256 tokenId, string memory _tokenURI) external onlyOwner nonReentrant {
        _mint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
    }

    /// @notice mint the tokens in batch
    /// @param to the recipient address
    /// @param tokenIds the ID in array will be minted
    /// @param tokenURIs the URI in array
    function mintBatch(
        address to,
        uint256[] memory tokenIds,
        string[] memory tokenURIs
    ) external onlyOwner nonReentrant {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _mint(to, tokenIds[i]);
            _setTokenURI(tokenIds[i], tokenURIs[i]);
        }
    }

    /// @notice burn the token
    /// @param tokenId ID of the token to be burned
    function burn(uint256 tokenId) external nonReentrant {
        _burn(tokenId);
    }

}

// contract ERC1155Template is ERC1155, ERC1155URIStorage, Ownable, ReentrancyGuard {
//     using Address for address;
    
//     constructor() ERC1155("") {}

//     function uri(uint256 tokenId) public view override(ERC1155, ERC1155URIStorage) returns (string memory) {
//         return ERC1155URIStorage.uri(tokenId);
//     }

//     function setURI(uint256 tokenId, string memory _tokenURI) external onlyOwner nonReentrant {
//         _setURI(tokenId, _tokenURI);
//     }

//     function setBaseURI(string memory baseURI) external onlyOwner nonReentrant {
//         _setBaseURI(baseURI);
//     }

//     function mint(
//         address to,
//         uint256 id,
//         uint256 value,
//         bytes memory data
//     ) external onlyOwner nonReentrant {
//         _mint(to, id, value, data);
//     }

//     function mintBatch(
//         address to,
//         uint256[] memory ids,
//         uint256[] memory values,
//         bytes memory data
//     ) external onlyOwner nonReentrant {
//         _mintBatch(to, ids, values, data);
//     }

//     function burn(
//         address owner,
//         uint256 id,
//         uint256 value
//     ) external nonReentrant {
//         _burn(owner, id, value);
//     }

//     function burnBatch(
//         address owner,
//         uint256[] memory ids,
//         uint256[] memory values
//     ) external nonReentrant {
//         _burnBatch(owner, ids, values);
//     }
// }

contract NFTFactory is Pausable, ReentrancyGuard  {
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

    event Created(address owner, address nft);

    constructor() public {
        permissions[msg.sender] = Role.ADMIN;
    }

    // function createERC1155() external whenNotPaused nonReentrant {

    //     nftCount += 1;

    //     ERC1155Template erc1155Token = new ERC1155Template();
    //     erc1155Token.transferOwnership(msg.sender);
        
    //     nfts[nftCount] = address(erc1155Token);

    //     emit Created(nftCount, msg.sender, address(erc1155Token), true);
    // }

    /// @notice create the collection
    /// @param _name name of the ERC-721 to be deployed
    /// @param _symbol symbol of the ERC-721 to be deployed
    function create(string memory _name, string memory _symbol) external whenNotPaused nonReentrant {

        nftCount += 1;

        ERC721TG erc721Token = new ERC721TG(_name, _symbol);
        erc721Token.transferOwnership(msg.sender);

        nfts[nftCount] = address(erc721Token);
        
        emit Created(msg.sender, address(erc721Token));
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