// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StudyGroupKRNL.sol";
import "./StudyToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StudyGroupFactory
 * @dev Factory contract to create and manage study groups
 * Includes welcome bonus system for new users
 */
contract StudyGroupFactory is Ownable {
    StudyToken public studyToken;
    address public verificationOracle;
    
    // Welcome bonus settings
    uint256 public welcomeBonus = 100 * 10**18; // 100 STUDY tokens
    mapping(address => bool) public hasClaimedWelcomeBonus;
    
    struct GroupMetadata {
        address groupAddress;
        string title;
        address creator;
        uint256 createdAt;
        bool isActive;
    }
    
    mapping(uint256 => GroupMetadata) public groups;
    uint256 public groupCount;
    
    // User's groups
    mapping(address => uint256[]) public userGroups;
    
    event GroupCreated(
        uint256 indexed groupId,
        address indexed groupAddress,
        address indexed creator,
        string title
    );
    
    event WelcomeBonusClaimed(address indexed user, uint256 amount);
    event WelcomeBonusUpdated(uint256 newAmount);
    
    constructor(address _studyToken, address _verificationOracle) Ownable(msg.sender) {
        studyToken = StudyToken(_studyToken);
        verificationOracle = _verificationOracle;
    }
    
    /**
     * @dev Claim welcome bonus for new users
     */
    function claimWelcomeBonus() external {
        require(!hasClaimedWelcomeBonus[msg.sender], "Already claimed welcome bonus");
        require(welcomeBonus > 0, "Welcome bonus not available");
        
        hasClaimedWelcomeBonus[msg.sender] = true;
        studyToken.mint(msg.sender, welcomeBonus);
        
        emit WelcomeBonusClaimed(msg.sender, welcomeBonus);
    }
    
    /**
     * @dev Auto-claim welcome bonus if user hasn't claimed yet (called internally)
     */
    function _autoClaimWelcomeBonus(address user) internal {
        if (!hasClaimedWelcomeBonus[user] && welcomeBonus > 0) {
            hasClaimedWelcomeBonus[user] = true;
            studyToken.mint(user, welcomeBonus);
            emit WelcomeBonusClaimed(user, welcomeBonus);
        }
    }
    
    /**
     * @dev Create a new study group (auto-claims welcome bonus for first-time users)
     */
    function createGroup(
        string memory title,
        string memory description,
        string memory subject,
        uint256 stakeAmount,
        uint256 maxMembers,
        uint256 durationDays
    ) external returns (address) {
        require(bytes(title).length > 0, "Title required");
        require(stakeAmount > 0, "Stake amount must be > 0");
        require(maxMembers > 0 && maxMembers <= 100, "Invalid max members");
        require(durationDays > 0 && durationDays <= 365, "Invalid duration");
        
        // Auto-claim welcome bonus for new users (DISABLED - Factory not authorized to mint)
        // Users should claim welcome bonus manually via claimWelcomeBonus() before creating groups
        // _autoClaimWelcomeBonus(msg.sender);
        
        // Deploy new StudyGroup contract
        StudyGroup newGroup = new StudyGroup(
            address(studyToken),
            verificationOracle,
            title,
            description,
            subject,
            stakeAmount,
            maxMembers,
            durationDays,
            msg.sender
        );
        
        address groupAddress = address(newGroup);
        
        groups[groupCount] = GroupMetadata({
            groupAddress: groupAddress,
            title: title,
            creator: msg.sender,
            createdAt: block.timestamp,
            isActive: true
        });
        
        userGroups[msg.sender].push(groupCount);
        
        emit GroupCreated(groupCount, groupAddress, msg.sender, title);
        groupCount++;
        
        return groupAddress;
    }
    
    /**
     * @dev Update welcome bonus amount (only owner)
     */
    function setWelcomeBonus(uint256 newAmount) external onlyOwner {
        welcomeBonus = newAmount;
        emit WelcomeBonusUpdated(newAmount);
    }
    
    /**
     * @dev Update verification oracle address
     */
    function updateOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        verificationOracle = newOracle;
    }
    
    /**
     * @dev Get all groups created by a user
     */
    function getUserGroups(address user) external view returns (uint256[] memory) {
        return userGroups[user];
    }
    
    /**
     * @dev Get group metadata
     */
    function getGroup(uint256 groupId) external view returns (GroupMetadata memory) {
        require(groupId < groupCount, "Invalid group ID");
        return groups[groupId];
    }
    
    /**
     * @dev Get all groups (paginated)
     */
    function getGroups(uint256 offset, uint256 limit) 
        external 
        view 
        returns (GroupMetadata[] memory) 
    {
        require(offset < groupCount, "Invalid offset");
        
        uint256 end = offset + limit;
        if (end > groupCount) {
            end = groupCount;
        }
        
        uint256 resultLength = end - offset;
        GroupMetadata[] memory result = new GroupMetadata[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = groups[offset + i];
        }
        
        return result;
    }
}
