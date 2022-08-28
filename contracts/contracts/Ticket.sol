// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title Shared ERC-1155 for being WL tickets
 */

contract Ticket is ERC1155, ERC1155URIStorage, Pausable, ReentrancyGuard {
    using Address for address;

    enum Role {
        UNAUTHORIZED,
        ADMIN
    }

    // maps to the owner of each token ID
    mapping(uint256 => address) public tokenOwners;
    uint256 public tokenOwnerCount;
    // maps to lock / unlock states
    mapping(uint256 => bool) public lockable;

    // ACL
    mapping(address => Role) private permissions;

    event Issued(uint256 indexed tokenId, address owner);

    constructor() public ERC1155("") {
        permissions[msg.sender] = Role.ADMIN;
    }

    /// @notice authorise to issue a token
    function issue() external nonReentrant whenNotPaused {
        tokenOwnerCount += 1;
        tokenOwners[tokenOwnerCount] = msg.sender;

        emit Issued(tokenOwnerCount, msg.sender);
    }

    /// @notice mint tokens
    /// @param to recipient to be received
    /// @param id token ID
    /// @param value amount of the token to be minted
    /// @param data aux data
    function mint(
        address to,
        uint256 id,
        uint256 value,
        bytes memory data
    ) external nonReentrant whenNotPaused {
        require(tokenOwners[id] == msg.sender, "Not authorised to mint");
        _mint(to, id, value, data);
    }

    /// @notice mint tokens in batch
    /// @param to recipient to be received
    /// @param ids token ID(s)
    /// @param values amount of the token to be minted(s)
    /// @param data aux data
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory values,
        bytes memory data
    ) external nonReentrant whenNotPaused {
        for (uint256 i = 0; i < ids.length; i++) {
            require(tokenOwners[ids[i]] == msg.sender, "Not authorised to mint");
        }
        _mintBatch(to, ids, values, data);
    }

    /// @notice burn tokens
    /// @param owner owner of the token
    /// @param id token ID
    /// @param value amount of the token to be burned
    function burn(
        address owner,
        uint256 id,
        uint256 value
    ) external nonReentrant {
        _burn(owner, id, value);
    }

    /// @notice burn tokens in batch
    /// @param owner owner of the token
    /// @param ids token IDs
    /// @param values amount of the token to be burned
    function burnBatch(
        address owner,
        uint256[] memory ids,
        uint256[] memory values
    ) external nonReentrant {
        _burnBatch(owner, ids, values);
    }

    /// @notice return the token URI
    /// @param tokenId token ID
    function uri(uint256 tokenId)
        public
        view
        virtual
        override(ERC1155, ERC1155URIStorage)
        returns (string memory)
    {
        return ERC1155URIStorage.uri(tokenId);
    }

    /// @notice set the URI
    /// @param tokenId token ID 
    /// @param _tokenURI the new token URI
    function setURI(uint256 tokenId, string memory _tokenURI) external nonReentrant whenNotPaused {
        require(tokenOwners[tokenId] == msg.sender, "Not authorised to set");
        _setURI(tokenId, _tokenURI);
    }

    /// @notice lock the token to not be transfered 
    /// @param tokenId token ID
    function lock(uint256 tokenId) external nonReentrant whenNotPaused {
        require(tokenOwners[tokenId] == msg.sender, "Not authorised to set");
        lockable[tokenId] = true;
    }

    /// @notice unlock the token
    /// @param tokenId token ID
    function unlock(uint256 tokenId) external nonReentrant whenNotPaused {
        require(tokenOwners[tokenId] == msg.sender, "Not authorised to set");
        lockable[tokenId] = false;
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

    // set the base URI
    function setBaseURI(string memory baseURI) external onlyAdmin whenNotPaused {
        _setBaseURI(baseURI);
    }

    // INTERNAL FUNCTIONS

    modifier onlyAdmin() {
        require(
            permissions[msg.sender] == Role.ADMIN,
            "Caller is not the admin"
        );
        _;
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
        internal virtual override
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        for (uint256 i = 0; i < ids.length; i++) {
            if (tokenOwners[ids[i]] != operator) {
                require(lockable[ids[i]] == false, "Not allow to be transfered");
            }
        }
 
    }
}
