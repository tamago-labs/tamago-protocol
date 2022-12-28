// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@opengsn/contracts/src/BaseRelayRecipient.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./utils/SBT1155.sol";
import "./utils/SBT1155URIStorage.sol";

/**
 * @title Artwork NFT ERC-1155
 */

contract Artwork is
    SBT1155,
    SBT1155URIStorage,
    ReentrancyGuard,
    BaseRelayRecipient,
    Pausable
{
    using Address for address;

    enum Role {
        UNAUTHORIZED,
        ADMIN
    }

    // maps to the owner of each token ID
    mapping(uint256 => address) public tokenOwners;
    uint256 public tokenOwnerCount;
    // roots
    mapping(uint256 => bytes32) private roots;
    // maps to lock / unlock states
    mapping(uint256 => bool) public lockable;
    // ACL
    mapping(address => Role) private permissions;

    event Authorised(uint256 indexed tokenId, address owner);
    event MintedMultipleAddresses(
        address[] indexed accounts,
        uint256 tokenId,
        uint256 amount
    );

    constructor(address _forwarder) public {
        _setTrustedForwarder(_forwarder);

        permissions[_msgSender()] = Role.ADMIN;
    }

    /// @notice authorise to issue a token
    function authorise(
        string memory _tokenURI,
        bytes32 _root,
        uint256 _initialAmount
    ) external nonReentrant whenNotPaused {
        require(_initialAmount > 0, "Initial amount must be greater than zero");
        tokenOwnerCount += 1;
        tokenOwners[tokenOwnerCount] = _msgSender();

        // first mint
        _mint(_msgSender(), tokenOwnerCount, _initialAmount, "");
        _setURI(tokenOwnerCount, _tokenURI);
        roots[tokenOwnerCount] = _root;

        lockable[tokenOwnerCount] = true;

        emit Authorised(tokenOwnerCount, _msgSender());
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
        require(tokenOwners[id] == _msgSender(), "Not authorised to mint");
        _mint(to, id, value, data);
    }

    /// @notice mint tokens to multiple accounts at the same time
    /// @param accounts recipient to be received
    /// @param id token ID
    /// @param value amount of the token to be minted
    function push(
        address[] memory accounts,
        uint256 id,
        uint256 value
    ) external nonReentrant whenNotPaused {
        require(tokenOwners[id] == _msgSender(), "Not authorised to mint");

        for (uint256 i = 0; i < accounts.length; ++i) {
            // bypass pre/post transfers checks
            _balances[id][accounts[i]] += value;
            emit TransferSingle(
                _msgSender(),
                address(0),
                accounts[i],
                id,
                value
            );
        }
    }

    /// @notice authorise to issue a token in batch
    function authoriseBatch(
        string[] memory _tokenURI,
        bytes32[] memory _root,
        uint256 _initialAmount
    ) external nonReentrant whenNotPaused {
        require(_initialAmount > 0, "Initial amount must be greater than zero");
        require(_tokenURI.length == _root.length, "Invalid length");

        for (uint256 i = 0; i < _tokenURI.length; i++) {
            tokenOwnerCount += 1;
            tokenOwners[tokenOwnerCount] = _msgSender();

            // first mint
            _mint(_msgSender(), tokenOwnerCount, _initialAmount, "");
            _setURI(tokenOwnerCount, _tokenURI[i]);
            roots[tokenOwnerCount] = _root[i];

            emit Authorised(tokenOwnerCount, _msgSender());
        }
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
            require(
                tokenOwners[ids[i]] == _msgSender(),
                "Not authorised to mint"
            );
        }
        _mintBatch(to, ids, values, data);
    }

    /// @notice looks for token's owner in batch
    /// @param ids token ID(s)
    function tokenOwnersBatch(uint256[] memory ids)
        external
        view
        returns (address[] memory)
    {
        address[] memory owners = new address[](ids.length);

        for (uint256 i = 0; i < ids.length; ++i) {
            owners[i] = tokenOwners[ids[i]];
        }

        return owners;
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
        override(SBT1155, SBT1155URIStorage)
        returns (string memory)
    {
        return SBT1155URIStorage.uri(tokenId);
    }

    /// @notice reveal a word by given proof
    /// @param _proof proof generated off-chain
    /// @param _tokenId token ID
    /// @param _index index of the word
    /// @param _word word to check
    function revealWord(
        bytes32[] memory _proof,
        uint256 _tokenId,
        uint256 _index,
        string memory _word
    ) external view returns (bool) {
        bool holded = false;
        if (balanceOf(_msgSender(), _tokenId) > 0) {
            holded = true;
        }
        bytes32 leaf = keccak256(abi.encodePacked(holded, _index, _word));
        return MerkleProof.verify(_proof, roots[_tokenId], leaf);
    }

    /// @notice lock the token to not be transfered
    /// @param tokenId token ID
    function lock(uint256 tokenId) external onlyAdmin {
        lockable[tokenId] = true;
    }

    /// @notice unlock the token
    /// @param tokenId token ID
    function unlock(uint256 tokenId) external onlyAdmin {
        lockable[tokenId] = false;
    }

    // give a specific permission to the given address
    function grant(address _address, Role _role) external onlyAdmin {
        require(_address != _msgSender(), "You cannot grant yourself");
        permissions[_address] = _role;
    }

    // remove any permission binded to the given address
    function revoke(address _address) external onlyAdmin {
        require(_address != _msgSender(), "You cannot revoke yourself");
        permissions[_address] = Role.UNAUTHORIZED;
    }

    function setPaused(bool _paused) external onlyAdmin {
        if (_paused) {
            _pause();
        } else {
            _unpause();
        }
    }

    function versionRecipient() public pure override returns (string memory) {
        return "2.2.5";
    }

    function _msgSender()
        internal
        view
        override(Context, BaseRelayRecipient)
        returns (address sender)
    {
        sender = BaseRelayRecipient._msgSender();
    }

    function _msgData()
        internal
        view
        override(Context, BaseRelayRecipient)
        returns (bytes calldata)
    {
        return BaseRelayRecipient._msgData();
    }

    modifier onlyAdmin() {
        require(
            permissions[_msgSender()] == Role.ADMIN,
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
    ) internal virtual override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        for (uint256 i = 0; i < ids.length; i++) {
            if (
                to != address(this) &&
                from != address(0) &&
                to != address(0) &&
                permissions[to] != Role.ADMIN &&
                permissions[from] != Role.ADMIN &&
                permissions[operator] != Role.ADMIN
            ) {
                require(
                    lockable[ids[i]] == false,
                    "Not allow to be transfered"
                );
            }
        }
    }
}
