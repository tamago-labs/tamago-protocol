// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@opengsn/contracts/src/BaseRelayRecipient.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./utils/SBT1155.sol";
import "./utils/SBT1155URIStorage.sol";
import "./interfaces/IArtwork.sol";

/**
 * @title Novel NFT ERC-1155
 */

contract Novel is
    SBT1155,
    SBT1155URIStorage,
    ReentrancyGuard,
    BaseRelayRecipient,
    Pausable
{
    using Address for address;
    using SafeERC20 for IERC20;

    enum Role {
        UNAUTHORIZED,
        ADMIN
    }

    struct Page {
        bytes32 root;
        uint256 artworkId;
        bool active;
    }

    struct Price {
        address asset;
        uint256 amount;
    }

    // maps to the owner of each token ID
    mapping(uint256 => address) public tokenOwners;
    uint256 public tokenOwnerCount;
    // pages
    mapping(uint256 => mapping(uint8 => Page)) private pages;
    // prices
    mapping(uint256 => Price) private prices;
    // maps to lock / unlock states
    mapping(uint256 => bool) public lockable;
    // ACL
    mapping(address => Role) private permissions;
    // Dev address
    address public devAddress;
    // For the platform
    uint256 public platformFee;
    // Fot the artwork creators
    uint256 public creatorPayoutFee;
    // Artwork NFT contract
    IArtwork public artwork;

    // ETHER ADDRESS
    address constant ETHER_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    event Authorised(uint256 indexed tokenId, address owner);
    event Sold(
        address tokenAddress,
        uint256 amount,
        uint256 totalWriter,
        uint256 totalPayout
    );
    event Withdrawn( address tokenAddress,address indexed toAddress, uint256 amount);

    constructor(address _forwarder, address _artwork) public {
        _setTrustedForwarder(_forwarder);

        permissions[_msgSender()] = Role.ADMIN;

        artwork = IArtwork(_artwork);

        devAddress = _msgSender();

        // Set fees
        platformFee = 1000; // 10%
        creatorPayoutFee = 3000; // 30%
    }

    /// @notice check token price for the given token ID
    function tokenPrice(
        uint256 _tokenId
    ) external view returns (address, uint256) {
        return ( prices[_tokenId].asset, prices[_tokenId].amount);
    }

    /// @notice authorise to issue a token
    function authorise(
        string memory _tokenURI,
        uint256 _initialAmount,
        address _priceAsset,
        uint256 _priceValue
    ) external nonReentrant whenNotPaused {
        require(_initialAmount > 0, "Initial amount must be greater than zero");
        tokenOwnerCount += 1;
        tokenOwners[tokenOwnerCount] = _msgSender();

        // first mint
        _mint(_msgSender(), tokenOwnerCount, _initialAmount, "");
        _setURI(tokenOwnerCount, _tokenURI);

        lockable[tokenOwnerCount] = true;

        // set the price
        prices[tokenOwnerCount].asset = _priceAsset;
        prices[tokenOwnerCount].amount = _priceValue;

        emit Authorised(tokenOwnerCount, _msgSender());
    }

    /// @notice set the token URI (only be called by the token owner)
    function setTokenURI(uint256 _tokenId, string memory _tokenURI)
        external
        nonReentrant
        whenNotPaused
    {
        require(tokenOwners[_tokenId] == _msgSender(), "Not authorised to set");
        _setURI(_tokenId, _tokenURI);
    }

    /// @notice set the token content (only be called by the token owner)
    function setPages(
        uint256 _tokenId,
        uint8 _pageIdStart,
        bytes32[] memory _roots,
        uint256[] memory _artworkIds
    ) external nonReentrant whenNotPaused {
        require(tokenOwners[_tokenId] == _msgSender(), "Not authorised to set");
        for (uint8 i = _pageIdStart; i < _roots.length; i++) {
            pages[_tokenId][i].root = _roots[i];
            pages[_tokenId][i].artworkId = _artworkIds[i];
            pages[_tokenId][i].active = true;
        }
    }

    /// @notice get the merkle-root from the given token, page
    function getPageRoot(uint256 _tokenId, uint8 _pageId) external view returns (bytes32) {
        return pages[_tokenId][_pageId].root;
    }

    /// @notice get the artwork from the given token
    function getPageArtwork(uint256 _tokenId, uint8 _pageId) external view returns (uint256) {
        return pages[_tokenId][_pageId].artworkId;
    }

    /// @notice set the token price (only be called by the token owner)
    function setTokenPrice(
        uint256 _tokenId,
        address _priceAsset,
        uint256 _priceValue
    ) external nonReentrant whenNotPaused {
        require(tokenOwners[_tokenId] == _msgSender(), "Not authorised to set");

        prices[_tokenId].asset = _priceAsset;
        prices[_tokenId].amount = _priceValue;
    }

    /// @notice mint tokens
    /// @param _to recipient to be received
    /// @param _tokenId token ID
    /// @param _value amount of the token to be minted
    /// @param _data aux data
    function mint(
        address _to,
        uint256 _tokenId,
        uint256 _value,
        bytes memory _data
    ) external nonReentrant whenNotPaused {
        address tokenOwner = tokenOwners[_tokenId];

        if (tokenOwner == _msgSender()) {
            // free mint for the owner
            _mint(_to, _tokenId, _value, _data);
        } else {
            address priceAsset = prices[_tokenId].asset;
            uint256 priceAmount = prices[_tokenId].amount;

            require(priceAsset != ETHER_ADDRESS, "ETHER is not support here");
            require(_value == 1, "One token only");

            // only one token is minted

            uint256 payoutValue;

            if (creatorPayoutFee != 0) {
                payoutValue = (priceAmount * (creatorPayoutFee)) / (10000);
            }

            // taking platform fees
            if (platformFee != 0) {
                uint256 fee = (priceAmount * (platformFee)) / (10000);
                IERC20(priceAsset).safeTransferFrom(
                    _msgSender(),
                    devAddress,
                    fee
                );
                priceAmount -= fee;
            }

            // Locking in the contract until Admin releases it
            IERC20(priceAsset).safeTransferFrom(
                _msgSender(),
                address(this),
                priceAmount
            );

            _mint(_to, _tokenId, 1, _data);

            emit Sold(priceAsset, prices[_tokenId].amount, priceAmount , payoutValue);
        }
    }

    /// @notice mint tokens with ETH
    function mintWithEth(
        address _to,
        uint256 _tokenId,
        uint256 _value,
        bytes memory _data
    ) external payable nonReentrant whenNotPaused {
        require(tokenOwners[_tokenId] != _msgSender(), "Owner is not allowed");
        require(
            prices[_tokenId].asset == ETHER_ADDRESS,
            "PriceAsset must be ETH"
        );
        require(_value == 1, "One token only");

        // only one token is minted
        uint256 amount = msg.value;
        uint256 priceAmount = prices[_tokenId].amount;

        require( amount == priceAmount , "Invalid amount");

        uint256 payoutValue;

        if (creatorPayoutFee != 0) {
            payoutValue = (priceAmount * (creatorPayoutFee)) / (10000);
        }

        // taking platform fees
        if (platformFee != 0) {
            uint256 fee = (priceAmount * (platformFee)) / (10000);
            (bool successDev, ) = devAddress.call{value: fee}("");
            require(successDev, "Failed to send Ether to dev");
            priceAmount -= fee;
        }

        _mint(_to, _tokenId, 1, _data);

        emit Sold(ETHER_ADDRESS, prices[_tokenId].amount, priceAmount ,payoutValue);
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
    function reveal(
        bytes32[] memory _proof,
        uint256 _tokenId,
        uint8 _pageId,
        uint256 _index,
        string memory _word
    ) external view returns (bool) {
        bool holded = false;
        if (balanceOf(_msgSender(), _tokenId) > 0) {
            holded = true;
        }
        bytes32 leaf = keccak256(abi.encodePacked(holded, _index, _word));
        return MerkleProof.verify(_proof, pages[_tokenId][_pageId].root, leaf);
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

    /// @notice set a new artwork contract
    /// @param _address artwork contract address
    function setArtwork(address _address) external onlyAdmin {
        artwork = IArtwork(_address);
    }

    // update dev address
    function setDevAddress(address _devAddress) external onlyAdmin {
        devAddress = _devAddress;
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

    // withdraw locked funds
    function withdrawErc20(address _tokenAddress, address _toAddress, uint256 _amount)
        external
        nonReentrant
        onlyAdmin
    {
        IERC20(_tokenAddress).safeTransfer(_toAddress, _amount);

        emit Withdrawn( _tokenAddress, _toAddress, _amount );
    }

    // widthdraw ETH
    function withdraw(address _toAddress, uint256 _amount)
        external
        nonReentrant
        onlyAdmin
    {
        (bool sent, ) = _toAddress.call{value: _amount}("");
        require(sent, "Failed to send Ether");

        emit Withdrawn(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, _toAddress, _amount);
    }

    // update fees
    function setFees(uint256 _platformFee, uint256 _creatorPayoutFee)
        external
        onlyAdmin
    {
        platformFee = _platformFee;
        creatorPayoutFee = _creatorPayoutFee;
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
