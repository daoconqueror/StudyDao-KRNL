// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StudyGroup.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VerificationOracle
 * @dev Oracle contract that receives AI verification results and updates StudyGroup contracts
 * In production, this would integrate with Chainlink or a custom oracle service
 */
contract VerificationOracle is Ownable {
    // Authorized verifiers (backend services that submit AI results)
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
        // Authorize deployer as initial verifier
        authorizedVerifiers[msg.sender] = true;
    }
    
    /**
     * @dev Authorize a new verifier (backend service)
     */
    function authorizeVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid verifier");
        authorizedVerifiers[verifier] = true;
        emit VerifierAuthorized(verifier);
    }
    
    /**
     * @dev Revoke verifier authorization
     */
    function revokeVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = false;
        emit VerifierRevoked(verifier);
    }
    
    /**
     * @dev Request verification for a study session
     * Called by StudyGroup contract or off-chain service
     */
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
    
    /**
     * @dev Submit verification result (called by authorized verifier after AI check)
     */
    function submitVerification(
        uint256 requestId,
        bool approved
    ) external onlyVerifier {
        require(requestId < requestCount, "Invalid request ID");
        require(!requests[requestId].processed, "Already processed");
        
        VerificationRequest storage request = requests[requestId];
        request.processed = true;
        
        // Call the StudyGroup contract to verify the session
        StudyGroup studyGroup = StudyGroup(request.studyGroup);
        studyGroup.verifySession(request.sessionId, approved);
        
        emit VerificationProcessed(requestId, request.studyGroup, request.sessionId, approved);
    }
    
    /**
     * @dev Batch verify multiple sessions
     */
    function submitBatchVerification(
        uint256[] memory requestIds,
        bool[] memory approvals
    ) external onlyVerifier {
        require(requestIds.length == approvals.length, "Array length mismatch");
        
        for (uint256 i = 0; i < requestIds.length; i++) {
            if (requestIds[i] < requestCount && !requests[requestIds[i]].processed) {
                VerificationRequest storage request = requests[requestIds[i]];
                request.processed = true;
                
                StudyGroup studyGroup = StudyGroup(request.studyGroup);
                studyGroup.verifySession(request.sessionId, approvals[i]);
                
                emit VerificationProcessed(
                    requestIds[i],
                    request.studyGroup,
                    request.sessionId,
                    approvals[i]
                );
            }
        }
    }
    
    /**
     * @dev Get verification request details
     */
    function getRequest(uint256 requestId) 
        external 
        view 
        returns (VerificationRequest memory) 
    {
        require(requestId < requestCount, "Invalid request ID");
        return requests[requestId];
    }
    
    /**
     * @dev Get pending verification requests
     */
    function getPendingRequests(uint256 limit) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory pending = new uint256[](limit);
        uint256 count = 0;
        
        for (uint256 i = requestCount; i > 0 && count < limit; i--) {
            if (!requests[i - 1].processed) {
                pending[count] = i - 1;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = pending[i];
        }
        
        return result;
    }
}
