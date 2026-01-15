// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StudyGroup
 * @dev Individual study group contract with staking and rewards
 * Users stake StudyTokens to commit to studying, get rewards when AI verifies their work
 */
contract StudyGroup is ReentrancyGuard {
    IERC20 public studyToken;
    address public verificationOracle;
    
    struct GroupInfo {
        string title;
        string description;
        string subject;
        uint256 stakeAmount;
        uint256 maxMembers;
        uint256 deadline;
        address creator;
        bool isActive;
    }
    
    struct Member {
        address memberAddress;
        uint256 stakedAmount;
        uint256 joinedAt;
        bool hasWithdrawn;
        uint256 studyHours;
        uint256 completedSessions;
    }
    
    struct StudySession {
        address member;
        uint256 startTime;
        uint256 duration;
        string submissionHash; // IPFS hash or Supabase ID
        bool verified;
        bool rewarded;
        uint256 timestamp;
    }
    
    GroupInfo public groupInfo;
    mapping(address => Member) public members;
    address[] public memberList;
    mapping(uint256 => StudySession) public sessions;
    uint256 public sessionCount;
    
    uint256 public totalStaked;
    uint256 public rewardPool;
    
    event MemberJoined(address indexed member, uint256 stakeAmount);
    event SessionSubmitted(uint256 indexed sessionId, address indexed member);
    event SessionVerified(uint256 indexed sessionId, bool approved);
    event RewardClaimed(address indexed member, uint256 amount);
    event StakeRefunded(address indexed member, uint256 amount);
    
    modifier onlyOracle() {
        require(msg.sender == verificationOracle, "Only oracle can call");
        _;
    }
    
    modifier onlyActiveMember() {
        require(members[msg.sender].stakedAmount > 0, "Not an active member");
        _;
    }
    
    modifier beforeDeadline() {
        require(block.timestamp < groupInfo.deadline, "Group deadline passed");
        _;
    }
    
    constructor(
        address _studyToken,
        address _verificationOracle,
        string memory _title,
        string memory _description,
        string memory _subject,
        uint256 _stakeAmount,
        uint256 _maxMembers,
        uint256 _durationDays,
        address _creator
    ) {
        studyToken = IERC20(_studyToken);
        verificationOracle = _verificationOracle;
        
        groupInfo = GroupInfo({
            title: _title,
            description: _description,
            subject: _subject,
            stakeAmount: _stakeAmount,
            maxMembers: _maxMembers,
            deadline: block.timestamp + (_durationDays * 1 days),
            creator: _creator,
            isActive: true
        });
    }
    
    /**
     * @dev Join the study group by staking tokens
     */
    function joinGroup() external beforeDeadline nonReentrant {
        require(groupInfo.isActive, "Group is not active");
        require(memberList.length < groupInfo.maxMembers, "Group is full");
        require(members[msg.sender].stakedAmount == 0, "Already a member");
        
        // Transfer stake from user
        require(
            studyToken.transferFrom(msg.sender, address(this), groupInfo.stakeAmount),
            "Stake transfer failed"
        );
        
        members[msg.sender] = Member({
            memberAddress: msg.sender,
            stakedAmount: groupInfo.stakeAmount,
            joinedAt: block.timestamp,
            hasWithdrawn: false,
            studyHours: 0,
            completedSessions: 0
        });
        
        memberList.push(msg.sender);
        totalStaked += groupInfo.stakeAmount;
        
        emit MemberJoined(msg.sender, groupInfo.stakeAmount);
    }
    
    /**
     * @dev Submit a study session for AI verification
     */
    function submitStudySession(
        uint256 duration,
        string memory submissionHash
    ) external onlyActiveMember nonReentrant {
        require(groupInfo.isActive, "Group is not active");
        require(duration > 0, "Invalid duration");
        
        sessions[sessionCount] = StudySession({
            member: msg.sender,
            startTime: block.timestamp,
            duration: duration,
            submissionHash: submissionHash,
            verified: false,
            rewarded: false,
            timestamp: block.timestamp
        });
        
        emit SessionSubmitted(sessionCount, msg.sender);
        sessionCount++;
    }
    
    /**
     * @dev Verify a study session (called by oracle after AI verification)
     */
    function verifySession(uint256 sessionId, bool approved) external onlyOracle {
        require(sessionId < sessionCount, "Invalid session ID");
        require(!sessions[sessionId].verified, "Already verified");
        
        sessions[sessionId].verified = true;
        
        if (approved) {
            Member storage member = members[sessions[sessionId].member];
            member.studyHours += sessions[sessionId].duration;
            member.completedSessions++;
        }
        
        emit SessionVerified(sessionId, approved);
    }
    
    /**
     * @dev Claim rewards after deadline (if eligible)
     */
    function claimRewards() external onlyActiveMember nonReentrant {
        require(block.timestamp >= groupInfo.deadline, "Deadline not reached");
        require(!members[msg.sender].hasWithdrawn, "Already withdrawn");
        
        Member storage member = members[msg.sender];
        member.hasWithdrawn = true;
        
        // Check if member completed minimum requirements (at least 1 verified session)
        if (member.completedSessions > 0) {
            // Return stake + reward (simple: 20% bonus)
            uint256 reward = (member.stakedAmount * 120) / 100;
            require(studyToken.transfer(msg.sender, reward), "Reward transfer failed");
            emit RewardClaimed(msg.sender, reward);
        } else {
            // Return only stake (no reward)
            require(studyToken.transfer(msg.sender, member.stakedAmount), "Refund failed");
            emit StakeRefunded(msg.sender, member.stakedAmount);
        }
    }
    
    /**
     * @dev Get group details
     */
    function getGroupInfo() external view returns (GroupInfo memory) {
        return groupInfo;
    }
    
    /**
     * @dev Get member count
     */
    function getMemberCount() external view returns (uint256) {
        return memberList.length;
    }
    
    /**
     * @dev Get member details
     */
    function getMember(address memberAddress) external view returns (Member memory) {
        return members[memberAddress];
    }
}
