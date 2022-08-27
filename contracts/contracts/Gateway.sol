// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "./Marketplace.sol";

/**
 * @title P2P Universal Asset Marketplace (Multi-Chain)
 */

contract Gateway is Marketplace {
    using Address for address;

    struct RelayMessage {
        bytes32 root;
        uint256 timestamp;
    }

    struct ClaimMessage {
        bytes32 root;
        uint256 timestamp;
    }

    // order that's half-fulfilled at pair chain
    struct PartialOrder {
        bool active;
        bool ended;
        address buyer;
        address assetAddress;
        uint256 tokenIdOrAmount;
        TokenType tokenType;
    }

    // Each message contains Merkle Tree's root of all orders listed from all EVM chains
    mapping(uint256 => RelayMessage) public relayMessages;
    uint256 public relayMessageCount;
    // Clearance messages contains the hash
    mapping(uint256 => ClaimMessage) public claimMessages;
    uint256 public claimMessageCount;
    // Orders that have been partially fulfilled (Order's IPFS CID -> struct)
    mapping(string => PartialOrder) public partialOrders;
    // Validator list
    mapping(address => bool) private validators;
    // Relayer list
    mapping(address => bool) private relayers;

    event PartialSwapped(string cid, address indexed fromAddress);
    event Claimed(string cid, address indexed fromAddress, bool isOriginChain);

    constructor(uint256 _chainId) Marketplace(_chainId) {}

    // check if the caller can claim the NFT (that approved by the validator )
    function eligibleToClaim(
        string memory _cid,
        address _claimer,
        bool _isOriginChain,
        bytes32[] memory _proof
    ) external view returns (bool) {
        return _eligibleToClaim(_cid, _claimer, _isOriginChain, _proof);
    }

    // check if the caller can deposit the nft
    function eligibleToPartialSwap(
        string memory _cid,
        address _assetAddress,
        uint256 _tokenIdOrAmount,
        bytes32[] memory _proof
    ) external view returns (bool) {
        return
            _eligibleToPartialSwap(
                _cid,
                _assetAddress,
                _tokenIdOrAmount,
                _proof
            );
    }

    function eligibleToPartialSwapWithEth(
        string memory _cid,
        bytes32[] memory _proof,
        uint256 _amount
    ) external view returns (bool) {
        return _eligibleToPartialSwapWithEth(_cid, _proof, _amount);
    }

    // cross-chain swaps, deposit the NFT on the destination chain and wait for the validator to approve the claim
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

    function partialSwapWithEth(string memory _cid, bytes32[] memory _proof)
        external
        payable
        whenNotPaused
        nonReentrant
    {
        _partialSwapWithEth(_cid, _proof);

        emit PartialSwapped(_cid, msg.sender);
    }

    // claim the NFT (that approved by the validator )
    function claim(
        string memory _cid,
        bool _isOriginChain,
        bytes32[] memory _proof,
        address _recipient
    ) external whenNotPaused nonReentrant {

        _claim(_cid, _isOriginChain, _proof, _recipient);

        emit Claimed(_cid, _recipient, _isOriginChain);
    }

    function claimBatch(
        string[] calldata _cids,
        bool[] calldata _isOriginChains,
        bytes32[][] calldata _proofs,
        address[] calldata _recipients
    ) external whenNotPaused nonReentrant {
        require(maxBatchOrders >= _cids.length, "Exceed batch size");

        for (uint256 i = 0; i < _cids.length; i++) {
            _claim(_cids[i], _isOriginChains[i], _proofs[i], _recipients[i]);

            emit Claimed(_cids[i],  _recipients[i], _isOriginChains[i]);
        }

    }

    // ONLY RELAYER / VALIDATOR

    // attaches the all order data in hash
    function updateRelayMessage(bytes32 _root)
        external
        onlyRelayer
        nonReentrant
    {
        relayMessageCount += 1;
        relayMessages[relayMessageCount].root = _root;
        relayMessages[relayMessageCount].timestamp = block.timestamp;
    }

    // attaches the confirmation in hash
    function updateClaimMessage(bytes32 _root)
        external
        onlyValidator
        nonReentrant
    {
        claimMessageCount += 1;
        claimMessages[claimMessageCount].root = _root;
        claimMessages[claimMessageCount].timestamp = block.timestamp;
    }

    // return latest confirmation's state root
    function claimRoot() external view returns (bytes32) {
        return _claimRoot();
    }

    // return latest relay's state root
    function relayRoot() external view returns (bytes32) {
        return _relayRoot();
    }

    // ADMIN

    // update the Validator list
    function setValidator(address _address, bool _enabled) external onlyAdmin {
        validators[_address] = _enabled;
    }

    // update the Relayer list
    function setRelayer(address _address, bool _enabled) external onlyAdmin {
        relayers[_address] = _enabled;
    }

    // only admin can cancel the partial swap
    function cancelPartialSwap(string memory _cid, address _to)
        external
        onlyAdmin
        nonReentrant
    {
        require(partialOrders[_cid].active == true, "Invalid order");

        _give(
            address(this),
            partialOrders[_cid].assetAddress,
            partialOrders[_cid].tokenIdOrAmount,
            partialOrders[_cid].tokenType,
            _to
        );

        partialOrders[_cid].active = false;
    }

    // INTERNAL FUNCTIONS

    modifier onlyRelayer() {
        require(relayers[msg.sender], "Caller is not the relayer");
        _;
    }

    modifier onlyValidator() {
        require(validators[msg.sender], "Caller is not the validator");
        _;
    }

    function _claim(
        string memory _cid,
        bool _isOriginChain,
        bytes32[] memory _proof,
        address _recipient
    ) internal {
        require(
            _eligibleToClaim(_cid, msg.sender, _isOriginChain, _proof) == true,
            "The caller is not eligible to claim the NFT"
        );


        // giving NFT
        if (_isOriginChain == true) {
            require(
                orders[_cid].ended == false,
                "The order has been fulfilled"
            );
            _give(
                orders[_cid].owner,
                orders[_cid].assetAddress,
                orders[_cid].tokenId,
                orders[_cid].tokenType,
                _recipient
            );

            orders[_cid].ended = true;
        } else {
            require(
                partialOrders[_cid].ended == false,
                "The order has been fulfilled"
            );
            _give(
                address(this),
                partialOrders[_cid].assetAddress,
                partialOrders[_cid].tokenIdOrAmount,
                partialOrders[_cid].tokenType,
                _recipient
            );

            partialOrders[_cid].ended = true;
        }
    }

    function _partialSwap(
        string memory _cid,
        address _assetAddress,
        uint256 _tokenIdOrAmount,
        TokenType _type,
        bytes32[] memory _proof
    ) internal {
        require(
            partialOrders[_cid].active == false,
            "The order is already active"
        );
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

        partialOrders[_cid].active = true;
        partialOrders[_cid].buyer = msg.sender;
        partialOrders[_cid].assetAddress = _assetAddress;
        partialOrders[_cid].tokenIdOrAmount = _tokenIdOrAmount;
        partialOrders[_cid].tokenType = _type;
    }

    function _partialSwapWithEth(string memory _cid, bytes32[] memory _proof)
        internal
    {
        require(
            partialOrders[_cid].active == false,
            "The order is already active"
        );
        require(
            _eligibleToPartialSwapWithEth(_cid, _proof, msg.value) == true,
            "The caller is not eligible to claim the NFT"
        );

        // deposit ETH
        // (bool sent, ) = address(this).call{value: msg.value}("");
        // require(sent, "Failed to send Ether");

        partialOrders[_cid].active = true;
        partialOrders[_cid].buyer = msg.sender;
        partialOrders[_cid].assetAddress = ETHER_ADDRESS;
        partialOrders[_cid].tokenIdOrAmount = msg.value;
        partialOrders[_cid].tokenType = TokenType.ETHER;
    }

    function _claimRoot() internal view returns (bytes32) {
        return claimMessages[claimMessageCount].root;
    }

    // return latest relay's state root
    function _relayRoot() internal view returns (bytes32) {
        return relayMessages[relayMessageCount].root;
    }

    function _eligibleToPartialSwap(
        string memory _cid,
        address _assetAddress,
        uint256 _tokenIdOrAmount,
        bytes32[] memory _proof
    ) internal view returns (bool) {
        bytes32 leaf = keccak256(
            abi.encodePacked(_cid, chainId, _assetAddress, _tokenIdOrAmount)
        );
        return MerkleProof.verify(_proof, _relayRoot(), leaf);
    }

    function _eligibleToPartialSwapWithEth(
        string memory _cid,
        bytes32[] memory _proof,
        uint256 amount
    ) internal view returns (bool) {
        bytes32 leaf = keccak256(
            abi.encodePacked(_cid, chainId, ETHER_ADDRESS, amount)
        );
        return MerkleProof.verify(_proof, _relayRoot(), leaf);
    }

    function _eligibleToClaim(
        string memory _cid,
        address _claimer,
        bool _isOriginChain,
        bytes32[] memory _proof
    ) internal view returns (bool) {
        bytes32 leaf = keccak256(
            abi.encodePacked(_cid, chainId, _claimer, _isOriginChain)
        );
        return MerkleProof.verify(_proof, _claimRoot(), leaf);
    }
}
