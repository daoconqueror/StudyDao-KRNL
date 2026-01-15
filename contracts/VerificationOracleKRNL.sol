// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TargetBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Forward declaration - we'll use interface instead of import to avoid circular dependency
interface IStudyGroupKRNL {
    function verifySession(
        uint256 sessionId, 
        bool approved,
        TargetBase.AuthData calldata authData
    ) external;
}

/**
 * @title VerificationOracleKRNL
 * @dev KRNL-compatible oracle for AI verification results
 */
contract VerificationOracleKRNL is TargetBase, Ownable {
    mapping(address => bool) public authorizedVerifiers;
    
    struct VerificationRequest {
        address studyGroup;
        uint256 sessionId;
        address member;
        string submissionHash;
        uint256 timestamp;
        bool processed;
    }
    
    mapping(uint256 => VerificationRequest) public requests;
    uint256 public requestCount;
    
    event VerificationRequested(
        uint256 indexed requestId,
        address indexed studyGroup,
        uint256 sessionId,
        address member
    );
    
    event VerificationProcessed(
        uint256 indexed requestId,
        address indexed studyGroup,
        uint256 sessionId,
        bool approved
    );
    
    event VerifierAuthorized(address indexed verifier);
    event VerifierRevoked(address indexed verifier);
    
    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender], "Not authorized verifier");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        authorizedVerifiers[msg.sender] = true;
    }
    
    function authorizeVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid verifier");
        authorizedVerifiers[verifier] = true;
        emit VerifierAuthorized(verifier);
    }
    
    function revokeVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = false;
        emit VerifierRevoked(verifier);
    }
    
    /**
     * @dev Submit verification via KRNL workflow
     * AuthData.result contains: (requestId, approved)
     */
    function submitVerification(AuthData calldata authData) 
        external 
        onlyVerifier 
        requireAuth(authData) 
    {
        (uint256 requestId, bool approved) = abi.decode(authData.result, (uint256, bool));
        
        require(requestId < requestCount, "Invalid request ID");
        require(!requests[requestId].processed, "Already processed");
        
        VerificationRequest storage request = requests[requestId];
        request.processed = true;
        
        // Create AuthData for StudyGroup contract call
        AuthData memory studyGroupAuthData = AuthData({
            nonce: authData.nonce + 1,
            expiry: authData.expiry,
            contextHash: authData.contextHash,
            attestations: authData.attestations,
            result: abi.encode(approved),
            requireUserSignature: false,
            userSignature: ""
        });
        
        IStudyGroupKRNL studyGroup = IStudyGroupKRNL(request.studyGroup);
        studyGroup.verifySession(request.sessionId, approved, studyGroupAuthData);
        
        emit VerificationProcessed(requestId, request.studyGroup, request.sessionId, approved);
    }
    
    function requestVerification(
        address studyGroup,
        uint256 sessionId,
        address member,
        string memory submissionHash
    ) external returns (uint256) {
        requests[requestCount] = VerificationRequest({
            studyGroup: studyGroup,
            sessionId: sessionId,
            member: member,
            submissionHash: submissionHash,
            timestamp: block.timestamp,
            processed: false
        });
        
        emit VerificationRequested(requestCount, studyGroup, sessionId, member);
        requestCount++;
        return requestCount - 1;
    }
    
    function getRequest(uint256 requestId) external view returns (VerificationRequest memory) {
        require(requestId < requestCount, "Invalid request ID");
        return requests[requestId];
    }
}
