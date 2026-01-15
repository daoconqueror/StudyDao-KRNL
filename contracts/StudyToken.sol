// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StudyToken
 * @dev The native token for StudyDAO platform
 * Users earn this token by completing verified study sessions
 */
contract StudyToken is ERC20, Ownable {
    // Maximum supply: 1 billion tokens
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    
    // Minting limits
    uint256 public mintedSupply;
    
    // Authorized minters (StudyGroup contracts, VerificationOracle)
    mapping(address => bool) public authorizedMinters;
    
    event MinterAuthorized(address indexed minter);
    event MinterRevoked(address indexed minter);
    
    constructor() ERC20("StudyDAO Token", "STUDY") Ownable(msg.sender) {
        // Mint initial supply to deployer (10% of max supply)
        uint256 initialSupply = (MAX_SUPPLY * 10) / 100;
        _mint(msg.sender, initialSupply);
        mintedSupply = initialSupply;
    }
    
    /**
     * @dev Authorize an address to mint tokens (e.g., StudyGroup contracts)
     */
    function authorizeMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        authorizedMinters[minter] = true;
        emit MinterAuthorized(minter);
    }
    
    /**
     * @dev Revoke minting authorization
     */
    function revokeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRevoked(minter);
    }
    
    /**
     * @dev Mint new tokens (only by authorized minters)
     */
    function mint(address to, uint256 amount) external {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        require(mintedSupply + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        mintedSupply += amount;
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens from caller's balance
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
