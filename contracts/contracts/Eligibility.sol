// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title Eligibility Contract where the verification takes places
 */

contract Eligibility 
{
    using Address for address;

    // Chain ID
    uint256 public chainId;
    // ETHER ADDRESS
    address constant ETHER_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    constructor(uint256 _chainId) {
        chainId = _chainId;
    }

    // check whether can do swaps
    function eligibleToSwap(
        string memory _cid,
        address _assetAddress,
        uint256 _tokenIdOrAmount,
        bytes32 _root,
        bytes32[] memory _proof
    ) external view returns (bool) {
        return _eligibleToSwap(_cid, _assetAddress, _tokenIdOrAmount,  _root, _proof);
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
            abi.encodePacked( _cid, chainId, _assetAddress, _tokenIdOrAmount)
        );
        return MerkleProof.verify(_proof, _root, leaf);
    }

    function _eligibleToSwapWithEth(
        string memory _cid,
        bytes32 _root,
        bytes32[] memory _proof
    ) internal view returns (bool) {
        bytes32 leaf = keccak256(
            abi.encodePacked( _cid, chainId, ETHER_ADDRESS , msg.value)
        );
        return MerkleProof.verify(_proof, _root, leaf);
    }

}