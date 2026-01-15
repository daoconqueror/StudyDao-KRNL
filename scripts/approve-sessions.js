// Auto-approve all pending study sessions
// Run this to make rewards claimable
import { ethers } from 'ethers';
import 'dotenv/config';

const STUDY_GROUP_ADDRESS = process.env.VITE_STUDY_GROUP_KRNL_ADDRESS;
const ORACLE_ADDRESS = process.env.VITE_VERIFICATION_ORACLE_KRNL_ADDRESS;
const RPC_URL = process.env.VITE_RPC_SEPOLIA_URL;

const ABI = [
    "function sessionCount() view returns (uint256)",
    "function sessions(uint256) view returns (address member, uint256 startTime, uint256 duration, string submissionHash, bool verified, bool rewarded, uint256 timestamp, string aiAnalysis)",
    "function verifySession(uint256 sessionId, bool approved, (uint256 nonce, uint256 expiry, bytes32 contextHash, (bytes32 hash, bytes signature, bytes metadata)[] attestations, bytes result, bool requireUserSignature, bytes userSignature) authData) external"
];

async function approveAllSessions() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const contract = new ethers.Contract(STUDY_GROUP_ADDRESS, ABI, wallet);

    const sessionCount = await contract.sessionCount();
    console.log(`📊 Total sessions: ${sessionCount}`);

    for (let i = 0; i < sessionCount; i++) {
        const session = await contract.sessions(i);

        if (!session.verified) {
            console.log(`✅ Approving session ${i}...`);

            // Create simple AuthData
            const authData = {
                nonce: Date.now(),
                expiry: Math.floor(Date.now() / 1000) + 3600,
                contextHash: ethers.ZeroHash,
                attestations: [[ethers.keccak256(ethers.toUtf8Bytes('auto-approve')), '0x' + '00'.repeat(65), '0x']],
                result: '0x',
                requireUserSignature: false,
                userSignature: '0x'
            };

            const tx = await contract.verifySession(i, true, authData);
            await tx.wait();
            console.log(`✅ Session ${i} approved!`);
        } else {
            console.log(`⏭️  Session ${i} already verified`);
        }
    }

    console.log('🎉 All sessions approved!');
}

approveAllSessions().catch(console.error);
