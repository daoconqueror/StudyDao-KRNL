// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TargetBase
 * @dev Base contract for KRNL-compatible target contracts
 * Provides AuthData struct and verification logic for workflows
 */
abstract contract TargetBase {
    
    // AuthData struct matching KRNL Protocol spec
    struct Attestation {
        bytes32 hash;      // Hash of the attested data
        bytes signature;   // Attestor signature
        bytes metadata;    // Additional attestation metadata
    }
    
    struct AuthData {
        uint256 nonce;                    // Prevents replay attacks
        uint256 expiry;                   // Expiration timestamp
        bytes32 contextHash;              // Hash of execution context
        Attestation[] attestations;       // Cryptographic proofs from attestors
        bytes result;                     // ABI-encoded workflow output
        bool requireUserSignature;        // Whether user signature is required
        bytes userSignature;              // User's signature over intent
    }
    
    // Mapping to track used nonces (prevents replay)
    mapping(uint256 => bool) public usedNonces;
    
    // Events
    event AuthDataVerified(uint256 indexed nonce, address indexed caller);
    event NonceUsed(uint256 indexed nonce);
    
    /**
     * @dev Modifier to verify AuthData before executing function
     */
    modifier requireAuth(AuthData calldata authData) {
        _verifyAuthData(authData);
        _;
    }
    
    /**
     * @dev Internal function to verify AuthData
     */
    function _verifyAuthData(AuthData calldata authData) internal {
        // 1. Check expiry
        require(block.timestamp <= authData.expiry, "AuthData expired");
        
        // 2. Check nonce hasn't been used (replay protection)
        require(!usedNonces[authData.nonce], "Nonce already used");
        
        // 3. Mark nonce as used
        usedNonces[authData.nonce] = true;
        emit NonceUsed(authData.nonce);
        
        // 4. Verify at least one attestation exists
        require(authData.attestations.length > 0, "No attestations provided");
        
        // 5. Additional validation can be added here:
        // - Verify attestor signatures
        // - Check contextHash matches expected workflow
        // - Validate user signature if required
        
        if (authData.requireUserSignature) {
            require(authData.userSignature.length > 0, "User signature required but not provided");
            // In production, verify the signature against msg.sender or expected signer
        }
        
        emit AuthDataVerified(authData.nonce, msg.sender);
    }
    
    /**
     * @dev Check if a nonce has been used
     */
    function isNonceUsed(uint256 nonce) external view returns (bool) {
        return usedNonces[nonce];
    }
}
