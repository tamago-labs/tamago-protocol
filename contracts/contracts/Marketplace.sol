// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./Eligibility.sol";

/**
 * @title P2P Prompt Marketplace
 */

contract Marketplace is ReentrancyGuard, ERC1155Holder, Eligibility {
    using Address for address;
    using SafeERC20 for IERC20;

    enum Role {
        UNAUTHORIZED,
        ADMIN
    }

    enum TokenType {
        ERC20,
        ERC1155,
        ETHER,
        FIAT
    }

    struct Order {
        address assetAddress;
        uint256 tokenId;
        TokenType tokenType;
        address owner;
        bytes32 root; // Merkle Tree's root
        bool active;
        bool ended;
    }

    // ACL
    mapping(address => Role) private permissions;
    // Fees (for ERC-20 / Ether)
    uint256 public swapFee;
    // Dev address
    address public devAddress;
    // Order's IPFS CID => Order
    mapping(string => Order) public orders;
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

    constructor(uint256 _chainId) Eligibility(_chainId) {
        maxBatchOrders = 100;

        permissions[msg.sender] = Role.ADMIN;

        devAddress = msg.sender;

        // set fees for ERC-20 / Ether
        swapFee = 300; // 3%
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
    ) external nonReentrant {
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
    ) external nonReentrant {
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
    function cancel(string memory _cid) external nonReentrant {
        _cancel(_cid);

        emit OrderCanceled(_cid, msg.sender);
    }

    /// @notice cancel multiple orders
    /// @param _cids ID that want to cancel
    function cancelBatch(string[] calldata _cids) external nonReentrant {
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
    ) external validateId(_cid) nonReentrant {
        _swap(_cid, _assetAddress, _tokenIdOrAmount, _type, _proof);

        emit Swapped(_cid, msg.sender);
    }

    /// @notice buy the NFT from the given order ID with ETH
    /// @param _cid ID for the order
    /// @param _proof the proof generated from off-chain
    function swapWithEth(string memory _cid, bytes32[] memory _proof)
        external
        payable
        validateId(_cid)
        nonReentrant
    {
        _swapWithEth(_cid, _proof);

        emit Swapped(_cid, msg.sender);
    }

    /// @notice buy the NFT from the fiat (only admin can proceed)
    /// @param _cid ID for the order
    /// @param _assetAddress NFT or ERC20 contract address want to swap
    /// @param _tokenIdOrAmount NFT's token ID or ERC20 token amount want to swap
    /// @param _proof the proof generated from off-chain
    function swapWithFiat(
        string memory _cid,
        address _toAddress,
        address _assetAddress,
        uint256 _tokenIdOrAmount,
        bytes32[] memory _proof
    ) external onlyAdmin validateId(_cid) nonReentrant {
        _swapWithFiat(_cid, _toAddress, _assetAddress, _tokenIdOrAmount, _proof);

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
    ) external validateIds(_cids) nonReentrant {
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

    /// @notice buy the NFT in batch
    /// @param _cids ID for the order
    /// @param _proofs the proof generated from off-chain
    function swapBatchWithEth(
        string[] calldata _cids,
        bytes32[][] calldata _proofs
    ) external validateIds(_cids) nonReentrant {
        for (uint256 i = 0; i < _cids.length; i++) {
            _swapWithEth(_cids[i], _proofs[i]);
            emit Swapped(_cids[i], msg.sender);
        }
    }

    /// @notice buy the NFT in batch from the fiat (only admin can proceed)
    /// @param _cids ID for the order
    /// @param _assetAddresses NFT or ERC20 contract address want to swap
    /// @param _tokenIdOrAmounts NFT's token ID or ERC20 token amount want to swap
    /// @param _proofs the proof generated from off-chain
    function swapBatchWithFiat(
        string[] calldata _cids,
        address _toAddress,
        address[] calldata _assetAddresses,
        uint256[] calldata _tokenIdOrAmounts,
        bytes32[][] calldata _proofs
    ) external onlyAdmin validateIds(_cids) nonReentrant {
        for (uint256 i = 0; i < _cids.length; i++) {
            _swapWithFiat(
                _cids[i],
                _toAddress,
                _assetAddresses[i],
                _tokenIdOrAmounts[i],
                _proofs[i]
            );
            emit Swapped(_cids[i], msg.sender);
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

    // update swap fees
    function setSwapFee(uint256 _fee) external onlyAdmin {
        swapFee = _fee;
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
            require(
                orders[_orderIds[i]].ended == false,
                "The order has been fulfilled"
            );
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

    function _swap(
        string memory _orderId,
        address _assetAddress,
        uint256 _tokenId,
        TokenType _type,
        bytes32[] memory _proof
    ) internal {
        require(_type != TokenType.ETHER, "ETHER is not support");
        require(_type != TokenType.FIAT, "Fiat is not support");
        require(
            _eligibleToSwap(
                _orderId,
                _assetAddress,
                _tokenId,
                orders[_orderId].root,
                _proof
            ) == true,
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

    function _swapWithEth(string memory _orderId, bytes32[] memory _proof)
        internal
    {
        require(
            _eligibleToSwapWithEth(_orderId, orders[_orderId].root, _proof) ==
                true,
            "The caller is not eligible to claim the NFT"
        );

        // taking ETH

        uint256 amount = msg.value;

        // taking swap fees
        if (swapFee != 0) {
            uint256 fee = (amount * (swapFee)) / (10000);
            (bool successDev, ) = orders[_orderId].owner.call{value: fee}("");
            require(successDev, "Failed to send Ether to dev");
            amount -= fee;
        }

        (bool sent, ) = orders[_orderId].owner.call{value: amount}("");
        require(sent, "Failed to send Ether");

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

    function _swapWithFiat(
        string memory _orderId,
        address _toAddress,
        address _assetAddress,
        uint256 _tokenId,
        bytes32[] memory _proof
    ) internal {
        require(
            _eligibleToSwap(
                _orderId,
                _assetAddress,
                _tokenId,
                orders[_orderId].root,
                _proof
            ) == true,
            "The caller is not eligible to claim the NFT"
        );

        // giving NFT
        _give(
            orders[_orderId].owner,
            orders[_orderId].assetAddress,
            orders[_orderId].tokenId,
            orders[_orderId].tokenType,
            _toAddress
        );

        orders[_orderId].ended = true;
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
        } else if (_type == TokenType.ERC20) {
            uint256 amount = _tokenIdOrAmount;

            // taking swap fees
            if (swapFee != 0) {
                uint256 fee = (amount * (swapFee)) / (10000);
                IERC20(_assetAddress).safeTransferFrom(
                    msg.sender,
                    devAddress,
                    fee
                );
                amount -= fee;
            }

            IERC20(_assetAddress).safeTransferFrom(msg.sender, _to, amount);
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
        } else if (_type == TokenType.ETHER) {
            if (_fromAddress == address(this)) {
                uint256 amount = _tokenIdOrAmount;

                // taking swap fees
                if (swapFee != 0) {
                    uint256 fee = (_tokenIdOrAmount * (swapFee)) / (10000);
                    (bool successDev, ) = _to.call{value: fee}("");
                    require(successDev, "Failed to send Ether to dev");
                    amount -= fee;
                }

                (bool success, ) = _to.call{value: amount}("");
                require(success, "Failed to send Ether to user");
            }
        } else if (_type == TokenType.ERC20) {
            uint256 amount = _tokenIdOrAmount;

            if (swapFee != 0) {
                uint256 fee = (_tokenIdOrAmount * (swapFee)) / (10000);
                if (_fromAddress == address(this)) {
                    IERC20(_assetAddress).safeTransfer(devAddress, fee);
                } else {
                    IERC20(_assetAddress).safeTransferFrom(
                        _fromAddress,
                        devAddress,
                        fee
                    );
                }
                amount -= fee;
            }

            if (_fromAddress == address(this)) {
                IERC20(_assetAddress).safeTransfer(msg.sender, amount);
            } else {
                IERC20(_assetAddress).safeTransferFrom(
                    _fromAddress,
                    msg.sender,
                    amount
                );
            }
        }
    }

    receive() external payable {}

    fallback() external payable {}
}
