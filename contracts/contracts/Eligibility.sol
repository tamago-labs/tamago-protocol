// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./interfaces/IGateway.sol";



/**
 * @title Eligibility Contract where the verification takes places
 */


contract Eligibility 
{
    using Address for address;

    // Gateway contract
    IGateway public gateway;
    

    constructor(address _gatewayAddress) {
        gateway = IGateway(_gatewayAddress);
    }

    // check whether can do intra-chain swaps
    function eligibleToSwap(
        string memory _cid,
        address _assetAddress,
        uint256 _tokenIdOrAmount,
        bytes32 _root,
        bytes32[] memory _proof
    ) external view returns (bool) {
        return _eligibleToSwap(_cid, _assetAddress, _tokenIdOrAmount,  _root, _proof);
    }

     // check whether can do cross-chain swaps
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

     // check if the caller can claim the NFT (that approved by the validator )
    function eligibleToClaim(
        string memory _cid,
        address _claimer,
        bool _isOriginChain,
        bytes32[] memory _proof
    ) external view returns (bool) {
        return _eligibleToClaim(_cid, _claimer, _isOriginChain, _proof);
    }

    // INTERNAL

    function _eligibleToSwap(
        string memory _cid,
        address _assetAddress,
        uint256 _tokenIdOrAmount,
        bytes32 _root,
        bytes32[] memory _proof
    ) internal view returns (bool) {
        bytes32 leaf = keccak256(
            abi.encodePacked( _cid, gateway.chainId(), _assetAddress, _tokenIdOrAmount)
        );
        return MerkleProof.verify(_proof, _root, leaf);
    }

    function _eligibleToPartialSwap(
        string memory _cid,
        address _assetAddress,
        uint256 _tokenIdOrAmount,
        bytes32[] memory _proof
    ) internal view returns (bool) {
        bytes32 leaf = keccak256(
            abi.encodePacked(
                _cid,
                gateway.chainId(),
                _assetAddress,
                _tokenIdOrAmount
            )
        );
        return MerkleProof.verify(_proof,  gateway.relayRoot(), leaf);
    }

    function _eligibleToClaim(
        string memory _cid,
        address _claimer,
        bool _isOriginChain,
        bytes32[] memory _proof
    ) internal view returns (bool) {
        bytes32 leaf = keccak256(
            abi.encodePacked(
                _cid,
                gateway.chainId(),
                _claimer,
                _isOriginChain
            )
        );
        return MerkleProof.verify(_proof, gateway.claimRoot(), leaf);
    }

    function _setGateway(address _gatewayAddress) internal {
         gateway = IGateway(_gatewayAddress);
    }

}