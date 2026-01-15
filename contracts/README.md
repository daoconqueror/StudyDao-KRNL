# StudyDAO Smart Contracts

This directory contains the Solidity smart contracts for the StudyDAO platform.

## Contracts Overview

### 1. StudyToken.sol
- **Type**: ERC20 Token
- **Purpose**: Platform's native token for staking and rewards
- **Features**:
  - Max supply: 1 billion STUDY tokens
  - Authorized minter system for controlled token distribution
  - Burn functionality

### 2. StudyGroup.sol
- **Purpose**: Individual study group with staking mechanism
- **Features**:
  - Members stake STUDY tokens to join
  - Submit study sessions for AI verification
  - Claim rewards if sessions are verified
  - Refund stake if requirements not met

### 3. StudyGroupFactory.sol
- **Purpose**: Factory for creating and managing study groups
- **Features**:
  - Create new StudyGroup contracts
  - Track all groups and user participation
  - Paginated group retrieval
  - **Welcome Bonus System**: New users get 100 STUDY tokens automatically when they:
    - Create their first group, OR
    - Manually call `claimWelcomeBonus()`
  - Owner can adjust welcome bonus amount

### 4. VerificationOracle.sol
- **Purpose**: Bridge between AI verification service and smart contracts
- **Features**:
  - Receives verification requests
  - Authorized verifiers submit AI results on-chain
  - Batch verification support
  - Updates StudyGroup contracts with verification results

## Deployment Order

1. Deploy `StudyToken.sol`
2. Deploy `VerificationOracle.sol`
3. Deploy `StudyGroupFactory.sol` (passing StudyToken and Oracle addresses)
4. Authorize `StudyGroupFactory` and `VerificationOracle` as minters on StudyToken

## Usage Flow

1. **Create Group**: User calls `StudyGroupFactory.createGroup()`
2. **Join Group**: Users stake tokens via `StudyGroup.joinGroup()`
3. **Study Session**: Users submit sessions via `StudyGroup.submitStudySession()`
4. **AI Verification**: Off-chain service processes and calls `VerificationOracle.submitVerification()`
5. **Claim Rewards**: After deadline, users call `StudyGroup.claimRewards()`

## Development with Remix IDE

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Create new files and copy each contract
3. Install OpenZeppelin contracts:
   - File Explorer → "+" → Create `.deps/npm/@openzeppelin` folder structure
   - Or use Remix's GitHub import feature
4. Compile contracts (Solidity 0.8.20)
5. Deploy to testnet (Sepolia, Mumbai, etc.)

## Required Dependencies

```json
{
  "@openzeppelin/contracts": "^5.0.0"
}
```

## Security Notes

- All contracts use OpenZeppelin's audited implementations
- ReentrancyGuard on all token transfer functions
- Access control via Ownable pattern
- Input validation on all public functions

## Testing Checklist

- [ ] Deploy StudyToken
- [ ] Test minting authorization
- [ ] Deploy VerificationOracle and authorize verifiers
- [ ] Deploy StudyGroupFactory
- [ ] Create a test study group
- [ ] Join group with test account
- [ ] Submit and verify a session
- [ ] Test reward claiming
