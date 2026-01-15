import { ethers } from 'ethers';

// Add function to fetch all groups from factory
export async function getAllGroups(provider) {
    const factoryAddress = import.meta.env.VITE_STUDY_GROUP_FACTORY_ADDRESS;
    if (!factoryAddress) return [];

    const factoryABI = [
        "function groupCount() view returns (uint256)",
        "function groups(uint256) view returns (address groupAddress, string title, address creator, uint256 createdAt, bool isActive)"
    ];

    const factory = new ethers.Contract(factoryAddress, factoryABI, provider);
    const count = await factory.groupCount();

    const allGroups = [];
    for (let i = 0; i < count; i++) {
        try {
            const group = await factory.groups(i);
            if (group.isActive) {
                allGroups.push({
                    id: i,
                    address: group.groupAddress,
                    title: group.title,
                    creator: group.creator,
                    createdAt: Number(group.createdAt)
                });
            }
        } catch (error) {
            console.error(`Error fetching group ${i}:`, error);
        }
    }

    return allGroups;
}

// Existing contractService functions...
export async function getTokenBalance(address, provider) {
    const tokenAddress = import.meta.env.VITE_STUDY_TOKEN_ADDRESS;
    const abi = ["function balanceOf(address) view returns (uint256)"];
    const contract = new ethers.Contract(tokenAddress, abi, provider);
    const balance = await contract.balanceOf(address);
    return ethers.formatEther(balance);
}

export async function getMemberInfo(address, provider, groupAddress = null) {
    const studyGroupAddress = groupAddress || import.meta.env.VITE_STUDY_GROUP_KRNL_ADDRESS;
    const abi = [
        "function members(address) view returns (address memberAddress, uint256 stakedAmount, uint256 joinedAt, bool hasWithdrawn, uint256 studyHours, uint256 completedSessions)"
    ];
    const contract = new ethers.Contract(studyGroupAddress, abi, provider);
    const member = await contract.members(address);

    return {
        stakedAmount: ethers.formatEther(member.stakedAmount),
        studyHours: Number(member.studyHours),
        completedSessions: Number(member.completedSessions),
        hasWithdrawn: member.hasWithdrawn,
        isMember: Number(member.stakedAmount) > 0
    };
}

export async function getMemberCount(provider, groupAddress = null) {
    const studyGroupAddress = groupAddress || import.meta.env.VITE_STUDY_GROUP_KRNL_ADDRESS;
    const abi = ["function getMemberCount() view returns (uint256)"];
    const contract = new ethers.Contract(studyGroupAddress, abi, provider);
    const count = await contract.getMemberCount();
    return Number(count);
}

export async function getGroupInfo(provider, groupAddress = null) {
    const studyGroupAddress = groupAddress || import.meta.env.VITE_STUDY_GROUP_KRNL_ADDRESS;
    const abi = [
        "function getGroupInfo() view returns (tuple(string title, string description, string subject, uint256 stakeAmount, uint256 maxMembers, uint256 deadline, address creator, bool isActive))"
    ];
    const contract = new ethers.Contract(studyGroupAddress, abi, provider);
    const info = await contract.getGroupInfo();

    return {
        title: info[0],
        description: info[1],
        subject: info[2],
        stakeAmount: ethers.formatEther(info[3]),
        maxMembers: Number(info[4]),
        deadline: Number(info[5]) * 1000,
        creator: info[6],
        isActive: info[7]
    };
}

export async function approveTokens(amount, signer, spenderAddress = null) {
    const tokenAddress = import.meta.env.VITE_STUDY_TOKEN_ADDRESS;
    const studyGroupAddress = spenderAddress || import.meta.env.VITE_STUDY_GROUP_KRNL_ADDRESS;
    const abi = ["function approve(address spender, uint256 amount) returns (bool)"];
    const contract = new ethers.Contract(tokenAddress, abi, signer);
    const amountWei = ethers.parseEther(amount.toString());
    const tx = await contract.approve(studyGroupAddress, amountWei);
    await tx.wait();
    return tx.hash;
}

export async function joinStudyGroup(signer, groupAddress = null) {
    const studyGroupAddress = groupAddress || import.meta.env.VITE_STUDY_GROUP_KRNL_ADDRESS;
    const abi = ["function joinGroup()"];
    const contract = new ethers.Contract(studyGroupAddress, abi, signer);
    const tx = await contract.joinGroup();
    await tx.wait();
    return tx.hash;
}

export async function claimRewards(signer, groupAddress = null) {
    const studyGroupAddress = groupAddress || import.meta.env.VITE_STUDY_GROUP_KRNL_ADDRESS;
    const abi = ["function claimRewards()"];
    const contract = new ethers.Contract(studyGroupAddress, abi, signer);
    const tx = await contract.claimRewards();
    await tx.wait();
    return tx.hash;
}

export async function getSessionCount(provider, groupAddress = null) {
    const studyGroupAddress = groupAddress || import.meta.env.VITE_STUDY_GROUP_KRNL_ADDRESS;
    const abi = ["function sessionCount() view returns (uint256)"];
    const contract = new ethers.Contract(studyGroupAddress, abi, provider);
    const count = await contract.sessionCount();
    return Number(count);
}
