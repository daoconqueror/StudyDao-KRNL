# StudyDAO - Decentralized Study Groups with AI Verification

StudyDAO is a blockchain-based platform that incentivizes collaborative learning through tokenized study groups. Members stake tokens to join groups, submit AI-verified study sessions, and earn rewards based on their commitment and performance.

## 🌟 Key Features

### 💡 AI-Powered Verification
- **DeepSeek-V3.1 Integration**: Study notes are analyzed by state-of-the-art AI models via Hugging Face
- **Quality Gate**: Only submissions scoring 60% or higher are accepted
- **On-Chain Verification**: Successful AI analysis automatically marks sessions as verified via KRNL

### 🔗 Blockchain Integration
- **ERC-20 Study Tokens**: Custom token economy for staking and rewards
- **Smart Contract Groups**: Transparent, trustless study group management
- **Sepolia Testnet**: Deployed and tested on Ethereum's Sepolia testnet

### 🎯 Core Mechanics
- **Stake to Join**: Members stake STUDY tokens to join groups
- **Submit Sessions**: Record study time with detailed notes
- **AI Analysis**: Notes are verified for quality and relevance
- **Earn Rewards**: Claim tokens after group completion based on participation

---

## 🏗️ Architecture

### Smart Contracts

#### 1. **StudyToken.sol**
ERC-20 token with minting and burning capabilities.
- **Symbol**: STUDY
- **Supply**: Mintable by authorized addresses
- **Use Cases**: Staking, rewards, marketplace purchases

#### 2. **StudyGroupKRNL.sol**
Main study group contract with KRNL integration for AI verification.
- **Group Management**: Create and manage study groups with deadlines
- **Member System**: Join groups by staking tokens, track study hours and sessions
- **AI Verification**: Uses KRNL's `TargetBase` and `requireAuth` modifier
- **Auto-Verification**: Sessions are automatically verified on-chain after AI approval
- **Reward Distribution**: Members can claim their stake + proportional rewards after group deadline

**Key Functions:**
- `joinGroup()`: Stake tokens to become a member
- `submitStudySession(AuthData)`: Submit AI-verified session via KRNL
- `claimRewards()`: Withdraw stake and rewards after completion

#### 3. **StudyGroupFactory.sol**
Deploys new KRNL-enabled study groups.
- **Standardized Deployment**: Creates groups with consistent parameters
- **Group Registry**: Tracks all deployed groups
- **Event Emission**: Logs group creation for frontend indexing

#### 4. **VerificationOracleKRNL.sol**
KRNL verification oracle that processes AI verification requests.
- **Off-Chain Computation**: Handles AI analysis via KRNL workflow
- **On-Chain Recording**: Returns verified results to study group contracts

---

## 🔐 KRNL Integration

### What is KRNL?
KRNL is a platform for enabling off-chain computation with on-chain verification. It allows smart contracts to securely execute complex workflows (like AI analysis) off-chain and trustlessly verify the results on-chain.

### How StudyDAO Uses KRNL

```
┌─────────────┐
│   Student   │
│ Submits     │
│ Study Notes │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ Frontend (React)     │
│ - Uploads to Supabase│
│ - Calls AI API       │
│ - Gets KRNL proof    │
└──────┬───────────────┘
       │
       ▼
┌────────────────────────────────┐
│ DeepSeek-V3.1 AI Analysis      │
│ - Scores notes (0-100)         │
│ - Checks quality (>60% passes) │
│ - Generates analysis report    │
└──────┬─────────────────────────┘
       │
       ▼
┌────────────────────────────┐
│ KRNL Workflow Service      │
│ - Creates cryptographic    │
│   proof of AI computation  │
│ - Packages AuthData struct │
└──────┬─────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ StudyGroupKRNL.submitStudySession│
│ - Validates KRNL proof           │
│ - Records session on-chain       │
│ - Updates member stats           │
│ - Auto-marks as verified ✅      │
└──────────────────────────────────┘
```

### KRNL Verification Flow

1. **Off-Chain AI Analysis**
   - Frontend calls DeepSeek-V3.1 via Hugging Face Router API
   - AI analyzes study notes and returns a score (0-100)
   - Quality gate rejects submissions below 60%

2. **KRNL Proof Generation**
   - KRNL workflow service creates cryptographic proof of AI computation
   - Proof is packaged into `AuthData` struct with verification signature

3. **On-Chain Verification**
   - `StudyGroupKRNL` inherits from `TargetBase`
   - `requireAuth(authData)` modifier validates KRNL proof
   - Only verified computations can record sessions on-chain

4. **Auto-Verification**
   - Unlike traditional oracles, AI approval immediately verifies the session
   - No manual approval or secondary verification needed
   - Member stats (studyHours, completedSessions) updated instantly

### Benefits of KRNL Integration

✅ **Trustless AI**: Users don't need to trust the frontend - verification happens on-chain  
✅ **Cost-Efficient**: Expensive AI computation happens off-chain  
✅ **Scalable**: Can analyze hundreds of sessions without blockchain gas limits  
✅ **Tamper-Proof**: Cryptographic proofs ensure AI results can't be spoofed  

---

## 🛠️ Technology Stack

### **Frontend**
- **React 18**: Component-based UI
- **Vite**: Fast build tool and dev server
- **ethers.js v6**: Ethereum interaction
- **Lucide React**: Icon library
- **TailwindCSS**: Utility-first styling

### **Backend / Services**
- **Supabase**: Off-chain storage for study notes
- **Hugging Face API**: DeepSeek-V3.1 model hosting
- **KRNL SDK**: Proof generation and verification

### **Blockchain**
- **Solidity 0.8.30**: Smart contract language
- **Sepolia Testnet**: Ethereum test network
- **KRNL Protocol**: Off-chain computation verification

---

## 📁 Project Structure

```
studydao/
├── contracts/              # Solidity smart contracts
│   ├── StudyToken.sol
│   ├── StudyGroupKRNL.sol
│   ├── StudyGroupFactory.sol
│   ├── VerificationOracleKRNL.sol
│   └── TargetBase.sol
├── src/
│   ├── components/         # Reusable React components
│   ├── pages/              # Main application pages
│   │   ├── Dashboard.jsx
│   │   ├── StudyGroups.jsx
│   │   ├── StudySession.jsx
│   │   ├── Rewards.jsx
│   │   ├── Marketplace.jsx
│   │   └── Profile.jsx
│   ├── services/           # Business logic
│   │   ├── contractService.js
│   │   └── krnlWorkflowService.js
│   ├── context/            # React contexts
│   │   ├── Web3Context.jsx
│   │   └── AuthContext.jsx
│   └── lib/                # Utilities
│       └── supabase.js
├── supabase/               # Database schema and migrations
└── .env                    # Environment variables
```

---

## ⚙️ Setup and Installation

### Prerequisites
- Node.js 18+
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH (for gas)
- Hugging Face API token

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd studydao

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys and contract addresses

# Start development server
npm run dev
```

### Environment Variables

``env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Hugging Face
VITE_HUGGINGFACE_TOKEN=your_hf_token
VITE_HUGGINGFACE_MODEL=deepseek-ai/DeepSeek-V3.1:novita

# Contract Addresses (Sepolia)
VITE_STUDY_TOKEN_ADDRESS=0x...
VITE_STUDY_GROUP_KRNL_ADDRESS=0x...
VITE_STUDY_GROUP_FACTORY_ADDRESS=0x...
VITE_VERIFICATION_ORACLE_KRNL_ADDRESS=0x...
```

---

## 🎮 How to Use

### For Students

1. **Get STUDY Tokens**
   - Connect your wallet
   - Claim welcome bonus or participate in groups to earn

2. **Join a Study Group**
   - Browse available groups
   - Stake required tokens to join (refundable after completion)

3. **Study and Submit Sessions**
   - Use the built-in timer to track study time
   - Write detailed notes about what you learned
   - Submit for AI verification (must score ≥60%)

4. **Earn Rewards**
   - Complete sessions before the group deadline
   - Claim your staked tokens + proportional group rewards

### For Group Creators

1. **Create a Group**
   - Define: Title, description, subject, stake amount, max members, duration
   - Factory deploys a new KRNL-enabled study group contract
   - Group is auto-indexed and discoverable

2. **Manage Expectations**
   - Set appropriate deadlines (e.g., 7, 14, or 30 days)
   - Higher stakes = more serious commitment
   - AI quality gate ensures genuine participation

---

## 🧪 Testing

### Manual Testing Flow

1. **Create Group**: Use "Create Group" page with test parameters
2. **Join Group**: Approve STUDY tokens and join your own group
3. **Submit Session**:
   - Start timer for 5+ minutes
   - Write quality study notes (test AI with good/bad content)
   - Submit and observe AI score
4. **Check Blockchain**: Verify session appears in Rewards page
5. **Claim Rewards**: After deadline, claim tokens back

### AI Quality Gate Testing

**Good Submission (Passes ≥60%):**
```
# Graph Theory Study Session

## Concepts Learned:
- Definition of a graph G = (V, E)
- Degree of vertices and handshaking lemma
- Trees, cycles, and graph traversals
- Practical applications in network routing

Time: 45 minutes
```

**Bad Submission (Fails <60%):**
```
studied stuff
learned things
good session
```

---

## 📊 Smart Contract Methods

### StudyGroupKRNL

```solidity
// Join a group by staking tokens
function joinGroup() external

// Submit AI-verified session
function submitStudySession(AuthData calldata authData) external

// Claim rewards after deadline
function claimRewards() external

// View group information
function getGroupInfo() external view returns (...)

// View member stats
function members(address) external view returns (
    address memberAddress,
    uint256 stakedAmount,
    uint256 joinedAt,
    bool hasWithdrawn,
    uint256 studyHours,
    uint256 completedSessions
)
```

---

## 🚀 Deployed Contracts (Sepolia)

 Contract addresses have been deployed to Sepolia testnet. Check `.env` for the current addresses.

---

## 🤝 Contributing

This project was built as a proof-of-concept for decentralized learning incentive systems. Contributions, suggestions, and improvements are welcome!

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **KRNL Protocol**: For enabling trustless off-chain AI verification
- **Hugging Face**: For providing DeepSeek-V3.1 model access
- **OpenZeppelin**: For secure smart contract libraries
- **Supabase**: For scalable off-chain storage

---

