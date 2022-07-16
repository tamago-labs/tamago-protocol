// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./Eligibility.sol";

/**
 * @title Multi-Chain Marketplace
 */

contract Marketplace is
    ReentrancyGuard,
    IERC721Receiver,
    ERC721Holder,
    ERC1155Holder,
    Pausable,
    Eligibility
{
    using Address for address;
    using SafeERC20 for IERC20;

    enum Role {
        UNAUTHORIZED,
        ADMIN
    }

    enum TokenType {
        ERC20,
        ERC721,
        ERC1155
    }

    struct Order {
        address assetAddress;
        uint256 tokenId;
        TokenType tokenType;
        address owner;
        // string cid; // IPFS hash where the barter list is stored
        bytes32 root; // Merkle Tree's root
        bool active;
        bool ended;
    }

    struct Partial {
        bool active;
        bool ended;
        address buyer;
        address assetAddress;
        uint256 tokenIdOrAmount;
        TokenType tokenType;
    }

    // ACL
    mapping(address => Role) private permissions;
    
    // Fees (for ERC-20)
    uint256 public swapFee;
    // Dev address
    address public devAddress;
    // Order's IPFS CID => Order
    mapping(string => Order) public orders;
    // Order's IPFS CID => Partial
    mapping(string => Partial) public partials;
    // Max. orders can be executed at a time
    uint256 maxBatchOrders;

    event OrderCreated(
        address indexed owner,
        string cid,
        address assetAddress,
        uint256 tokenId,
        TokenType tokenType,
        bytes32 root
    );

    event OrderCanceled(string cid, address indexed owner);
    event Swapped(string cid, address indexed fromAddress);
    event PartialSwapped(string cid, address indexed fromAddress);
    event Claimed(
        string cid,
        address indexed fromAddress,
        bool isOriginChain
    );

    constructor(address _gatewayAddress) Eligibility(_gatewayAddress) {
        maxBatchOrders = 20;

        permissions[msg.sender] = Role.ADMIN;

        devAddress = msg.sender;

        // set fees for ERC-20
        // swapFee = 100; // 1%
    }

    /// @notice create an order
    /// @param _cid IPFS HASH CID for the order
    /// @param _assetAddress NFT contract address being listed
    /// @param _tokenId NFT token ID being listed
    /// @param _type Token type that want to swap
    /// @param _root in the barter list in merkle tree root
    function create(
        string memory _cid,
        address _assetAddress,
        uint256 _tokenId,
        TokenType _type,
        bytes32 _root
    ) external nonReentrant whenNotPaused {
        _create(_cid, _assetAddress, _tokenId, _type, _root);

        emit OrderCreated(
            msg.sender,
            _cid,
            _assetAddress,
            _tokenId,
            _type,
            _root
        );
    }

    /// @notice create multiple orders
    /// @param _cids ID for the order
    /// @param _assetAddresses NFT contract address being listed
    /// @param _tokenIds NFT token ID being listed
    /// @param _types NFT's being listed ERC1155 flag
    /// @param _roots in the barter list in merkle tree root
    function createBatch(
        string[] calldata _cids,
        address[] calldata _assetAddresses,
        uint256[] calldata _tokenIds,
        TokenType[] calldata _types,
        bytes32[] calldata _roots
    ) external nonReentrant whenNotPaused {
        require(maxBatchOrders >= _cids.length, "Exceed batch size");

        for (uint256 i = 0; i < _cids.length; i++) {
            _create(
                _cids[i],
                _assetAddresses[i],
                _tokenIds[i],
                _types[i],
                _roots[i]
            );

            emit OrderCreated(
                msg.sender,
                _cids[i],
                _assetAddresses[i],
                _tokenIds[i],
                _types[i],
                _roots[i]
            );
        }

    }

    /// @notice cancel the order
    /// @param _cid ID that want to cancel
    function cancel(string memory _cid) external whenNotPaused nonReentrant {
        _cancel(_cid);

        emit OrderCanceled(_cid, msg.sender);
    }

    /// @notice cancel multiple orders
    /// @param _cids ID that want to cancel
    function cancelBatch(string[] calldata _cids)
        external
        whenNotPaused
        nonReentrant
    {
        for (uint256 i = 0; i < _cids.length; i++) {
            _cancel(_cids[i]);
            emit OrderCanceled(_cids[i], msg.sender);
        }

    }

    /// @notice buy the NFT from the given order ID
    /// @param _cid ID for the order
    /// @param _assetAddress NFT or ERC20 contract address want to swap
    /// @param _tokenIdOrAmount NFT's token ID or ERC20 token amount want to swap
    /// @param _type Token type that want to swap
    /// @param _proof the proof generated from off-chain
    function swap(
        string memory _cid,
        address _assetAddress,
        uint256 _tokenIdOrAmount,
        TokenType _type,
        bytes32[] memory _proof
    ) external validateId(_cid) whenNotPaused nonReentrant {
        _swap(_cid, _assetAddress, _tokenIdOrAmount, _type, _proof);

        emit Swapped(_cid, msg.sender);
    }

    /// @notice buy the NFT in batch
    /// @param _cids ID for the order
    /// @param _assetAddresses NFT or ERC20 contract address want to swap
    /// @param _tokenIdOrAmounts NFT's token ID or ERC20 token amount want to swap
    /// @param _types Token type that want to swap
    /// @param _proofs the proof generated from off-chain
    function swapBatch(
        string[] calldata _cids,
        address[] calldata _assetAddresses,
        uint256[] calldata _tokenIdOrAmounts,
        TokenType[] calldata _types,
        bytes32[][] calldata _proofs
    ) external validateIds(_cids) whenNotPaused nonReentrant {
        for (uint256 i = 0; i < _cids.length; i++) {
            _swap(
                _cids[i],
                _assetAddresses[i],
                _tokenIdOrAmounts[i],
                _types[i],
                _proofs[i]
            );
            emit Swapped(_cids[i], msg.sender);
        }
    }

    /// @notice buy the NFT from another chain
    /// @param _cid ID for the order
    /// @param _assetAddress NFT or ERC20 contract address want to swap
    /// @param _tokenIdOrAmount NFT's token ID or ERC20 token amount want to swap
    /// @param _type Token type that want to swap
    /// @param _proof the proof generated from off-chain
    function partialSwap(
        string memory _cid,
        address _assetAddress,
        uint256 _tokenIdOrAmount,
        TokenType _type,
        bytes32[] memory _proof
    ) external whenNotPaused nonReentrant {
        _partialSwap(_cid, _assetAddress, _tokenIdOrAmount, _type, _proof);

        emit PartialSwapped(_cid, msg.sender);
    }

    /// @notice buy the NFT from another chain in batch
    /// @param _cids ID for the order
    /// @param _assetAddresses NFT or ERC20 contract address want to swap
    /// @param _tokenIdOrAmounts NFT's token ID or ERC20 token amount want to swap
    /// @param _types Token type that want to swap
    /// @param _proofs the proof generated from off-chain
    function partialSwapBatch(
        string[] calldata _cids,
        address[] calldata _assetAddresses,
        uint256[] calldata _tokenIdOrAmounts,
        TokenType[] calldata _types,
        bytes32[][] calldata _proofs
    ) external whenNotPaused nonReentrant {
        for (uint256 i = 0; i < _cids.length; i++) {
            _partialSwap(
                _cids[i],
                _assetAddresses[i],
                _tokenIdOrAmounts[i],
                _types[i],
                _proofs[i]
            );
            emit PartialSwapped(_cids[i], msg.sender);
        }

    }

    /// @notice claim the NFT from cross-chain transactions
    /// @param _cid ID for the order
    /// @param _isOriginChain is the origin chain?
    /// @param _proof the proof generated from off-chain
    function claim(
        string memory _cid,
        bool _isOriginChain,
        bytes32[] memory _proof
    ) external whenNotPaused nonReentrant {
        _claim(_cid, _isOriginChain, _proof);

        emit Claimed(_cid, msg.sender, _isOriginChain);
    }

    /// @notice claim the NFT from cross-chain transactions in batch
    /// @param _cids ID for the order
    /// @param _isOriginChain is the origin chain?
    /// @param _proofs the proof generated from off-chain
    function claimBatch(
        string[] calldata _cids,
        bool _isOriginChain,
        bytes32[][] calldata _proofs
    ) external whenNotPaused nonReentrant {
        for (uint256 i = 0; i < _cids.length; i++) {
            _claim(_cids[i], _isOriginChain, _proofs[i]);
            emit Claimed(_cids[i], msg.sender, _isOriginChain);
        }
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

    // update swap fees
    function setSwapFee(uint256 _fee) external onlyAdmin {
        swapFee = _fee;
    }

    // update gateway
    function setGateway(address _gatewayAddress) external onlyAdmin {
        _setGateway(_gatewayAddress);
    }

    // update dev address
    function setDevAddress(address _devAddress) external onlyAdmin {
        devAddress = _devAddress;
    }

    // set max. orders can be created and swapped per time
    function setMaxBatchOrders(uint256 _value) external onlyAdmin {
        require(_value != 0, "Invalid value");
        maxBatchOrders = _value;
    }

    // only admin can cancel the partial swap
    function cancelPartialSwap(string memory _cid, address _to)
        external
        onlyAdmin
        nonReentrant
    {
        require(partials[_cid].active == true, "Invalid order");

        _give(
            partials[_cid].buyer,
            partials[_cid].assetAddress,
            partials[_cid].tokenIdOrAmount,
            partials[_cid].tokenType,
            _to
        );

        partials[_cid].active = false;
    }

    // INTERNAL FUNCTIONS

    modifier onlyAdmin() {
        require(
            permissions[msg.sender] == Role.ADMIN,
            "Caller is not the admin"
        );
        _;
    }

    modifier validateId(string memory _orderId) {
        require(orders[_orderId].active == true, "Given ID is invalid");
        require(
            orders[_orderId].ended == false,
            "The order has been fulfilled"
        );
        _;
    }

    modifier validateIds(string[] memory _orderIds) {
        require(maxBatchOrders >= _orderIds.length, "Exceed batch size");
        for (uint256 i = 0; i < _orderIds.length; i++) {
            require(orders[_orderIds[i]].active == true, "Given ID is invalid");
            require(orders[_orderIds[i]].ended == false, "The order has been fulfilled");
        }
        _;
    }

    function _create(
        string memory _cid,
        address _assetAddress,
        uint256 _tokenId,
        TokenType _type,
        bytes32 _root
    ) internal {
        require(orders[_cid].active == false, "Given ID is occupied");

        orders[_cid].active = true;
        orders[_cid].assetAddress = _assetAddress;
        orders[_cid].tokenId = _tokenId;
        orders[_cid].tokenType = _type;
        orders[_cid].root = _root;
        orders[_cid].owner = msg.sender;
    }

    function _cancel(string memory _orderId) internal {
        require(orders[_orderId].active == true, "Given ID is invalid");
        require(orders[_orderId].owner == msg.sender, "You are not the owner");

        orders[_orderId].ended = true;
    }

    function _partialSwap(
        string memory _cid,
        address _assetAddress,
        uint256 _tokenIdOrAmount,
        TokenType _type,
        bytes32[] memory _proof
    ) internal {
        require(partials[_cid].active == false, "The order is already active");
        require(
            _eligibleToPartialSwap(
                _cid,
                _assetAddress,
                _tokenIdOrAmount,
                _proof
            ) == true,
            "The caller is not eligible to claim the NFT"
        );

        // deposit NFT or tokens until the NFT locked in the origin chain is being transfered to the buyer
        _take(_assetAddress, _tokenIdOrAmount, _type, address(this));

        partials[_cid].active = true;
        partials[_cid].buyer = msg.sender;
        partials[_cid].assetAddress = _assetAddress;
        partials[_cid].tokenIdOrAmount = _tokenIdOrAmount;
        partials[_cid].tokenType = _type;
    }

    function _swap(
        string memory _orderId,
        address _assetAddress,
        uint256 _tokenId,
        TokenType _type,
        bytes32[] memory _proof
    ) internal {
        require(
            _eligibleToSwap(_orderId, _assetAddress, _tokenId,  orders[_orderId].root, _proof) == true,
            "The caller is not eligible to claim the NFT"
        );

        // taking NFT
        _take(_assetAddress, _tokenId, _type, orders[_orderId].owner);

        // giving NFT
        _give(
            orders[_orderId].owner,
            orders[_orderId].assetAddress,
            orders[_orderId].tokenId,
            orders[_orderId].tokenType,
            msg.sender
        );

        orders[_orderId].ended = true;
    }
    
    function _claim(
        string memory _orderId,
        bool _isOriginChain,
        bytes32[] memory _proof
    ) internal {
        require(
            _eligibleToClaim(_orderId, msg.sender, _isOriginChain, _proof) ==
                true,
            "The caller is not eligible to claim the NFT"
        );

        // giving NFT
        if (_isOriginChain == true) {
            _give(
                orders[_orderId].owner,
                orders[_orderId].assetAddress,
                orders[_orderId].tokenId,
                orders[_orderId].tokenType,
                msg.sender
            );

            orders[_orderId].ended = true;
        } else {
            _give(
                address(this),
                partials[_orderId].assetAddress,
                partials[_orderId].tokenIdOrAmount,
                partials[_orderId].tokenType,
                msg.sender
            );

            partials[_orderId].ended = true;
        }
    }

    function _take(
        address _assetAddress,
        uint256 _tokenIdOrAmount,
        TokenType _type,
        address _to
    ) internal {
        if (_type == TokenType.ERC1155) {
            IERC1155(_assetAddress).safeTransferFrom(
                msg.sender,
                _to,
                _tokenIdOrAmount,
                1,
                "0x00"
            );
        } else if (_type == TokenType.ERC721) {
            IERC721(_assetAddress).safeTransferFrom(
                msg.sender,
                _to,
                _tokenIdOrAmount
            );
        } else {
            // taking swap fees
            if (swapFee != 0) {
                uint256 fee = (_tokenIdOrAmount * (swapFee)) / (10000);
                IERC20(_assetAddress).safeTransferFrom(
                    msg.sender,
                    devAddress,
                    fee
                );
            }

            IERC20(_assetAddress).safeTransferFrom(
                msg.sender,
                _to,
                _tokenIdOrAmount
            );
        }
    }

    function _give(
        address _fromAddress,
        address _assetAddress,
        uint256 _tokenIdOrAmount,
        TokenType _type,
        address _to
    ) internal {
        if (_type == TokenType.ERC1155) {
            IERC1155(_assetAddress).safeTransferFrom(
                _fromAddress,
                _to,
                _tokenIdOrAmount,
                1,
                "0x00"
            );
        } else if (_type == TokenType.ERC721) {
            IERC721(_assetAddress).safeTransferFrom(
                _fromAddress,
                _to,
                _tokenIdOrAmount
            );
        } else {
            if (_fromAddress == address(this)) {
                IERC20(_assetAddress).safeTransfer(
                    msg.sender,
                    _tokenIdOrAmount
                );
            } else {
                IERC20(_assetAddress).safeTransferFrom(
                    _fromAddress,
                    msg.sender,
                    _tokenIdOrAmount
                );
            }
        }
    }
}
