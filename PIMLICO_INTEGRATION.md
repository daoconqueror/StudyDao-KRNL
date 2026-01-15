# Pimlico Integration (Planned Enhancement)

This document outlines how Pimlico would be integrated to enable gasless transactions and account abstraction (ERC-4337) in StudyDAO.

## Overview

**Pimlico** provides infrastructure for ERC-4337 account abstraction, enabling:
- **Gasless Transactions**: Users don't need ETH for gas fees
- **Bundled Operations**: Combine multiple transactions into one
- **Smart Contract Wallets**: Enhanced security and recovery options

## Current Implementation

StudyDAO currently uses **direct MetaMask integration** via ethers.js:

```javascript
// Current: Web3Context.jsx
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Users pay gas for every transaction
const tx = await contract.joinGroup();
await tx.wait(); // User pays gas
```

## Planned Pimlico Integration

### Step 1: Smart Account Setup

```javascript
// services/pimlicoService.js
import { createSmartAccountClient } from "permissionless";
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";

export async function createSmartAccount(owner) {
  const paymasterClient = createPimlicoPaymasterClient({
    transport: http(import.meta.env.VITE_PAYMASTER_URL),
  });

  const smartAccountClient = await createSmartAccountClient({
    bundlerTransport: http(import.meta.env.VITE_BUNDLER_URL),
    middleware: {
      gasPrice: async () => ({
        maxFeePerGas: await paymasterClient.getUserOperationGasPrice(),
        maxPriorityFeePerGas: await paymasterClient.getUserOperationGasPrice(),
      }),
      sponsorUserOperation: paymasterClient.sponsorUserOperation,
    },
  });

  return smartAccountClient;
}
```

### Step 2: Gasless Join Group

```javascript
// Example: Gasless group joining
async function joinGroupGasless(groupAddress) {
  const smartAccount = await createSmartAccount(signer);
  
  // Prepare join group call
  const callData = encodeFunctionData({
    abi: StudyGroupABI,
    functionName: 'joinGroup',
    args: []
  });

  // Send as user operation (gasless)
  const userOpHash = await smartAccount.sendUserOperation({
    target: groupAddress,
    data: callData,
    value: 0n,
  });

  // Wait for bundler to submit on-chain
  const receipt = await smartAccount.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  console.log('✅ Joined group without paying gas!', receipt);
}
```

### Step 3: Bundled Operations

```javascript
// Approve + Join in ONE transaction (gasless)
async function approveAndJoinGasless(tokenAddress, groupAddress, amount) {
  const smartAccount = await createSmartAccount(signer);

  const calls = [
    // 1. Approve tokens
    {
      target: tokenAddress,
      data: encodeFunctionData({
        abi: ERC20ABI,
        functionName: 'approve',
        args: [groupAddress, amount]
      }),
      value: 0n,
    },
    // 2. Join group
    {
      target: groupAddress,
      data: encodeFunctionData({
        abi: StudyGroupABI,
        functionName: 'joinGroup',
        args: []
      }),
      value: 0n,
    }
  ];

  // Execute both in single user operation
  const userOpHash = await smartAccount.sendUserOperation(calls);
  const receipt = await smartAccount.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  console.log('✅ Approved and joined in one gasless transaction!');
}
```

### Step 4: Updated Web3 Context

```javascript
// context/PimlicoContext.jsx (planned)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createSmartAccount } from '../services/pimlicoService';

const PimlicoContext = createContext();

export function PimlicoProvider({ children }) {
  const [smartAccount, setSmartAccount] = useState(null);

  const connectSmartAccount = async () => {
    const signer = await getSigner(); // From MetaMask
    const account = await createSmartAccount(signer);
    setSmartAccount(account);
  };

  return (
    <PimlicoContext.Provider value={{ smartAccount, connectSmartAccount }}>
      {children}
    </PimlicoContext.Provider>
  );
}

export const usePimlico = () => useContext(PimlicoContext);
```

## Benefits of Pimlico Integration

### ✅ Improved User Experience
- No need to hold Sepolia ETH for gas
- Fewer wallet popups (bundled operations)
- Faster onboarding for new users

### ✅ Enhanced Security
- Smart contract wallets with recovery options
- Session keys for temporary permissions
- Multi-sig capabilities

### ✅ Better UX for Study Sessions
```javascript
// Current: 2 transactions (approve + join)
await tokenContract.approve(groupAddress, amount); // Popup 1
await groupContract.joinGroup();                    // Popup 2

// With Pimlico: 1 gasless operation
await approveAndJoinGasless(tokenAddress, groupAddress, amount); // Popup 1 (sponsored)
```

## Environment Variables

Already configured in `.env`:

```bash
# Pimlico Configuration
VITE_PILMICO_API_KEY=
VITE_BUNDLER_URL=https://api.pimlico.io/v2/sepolia/rpc?apikey=pim_h119X1RCZ9YMEbFfysA7sK
VITE_PAYMASTER_URL=https://api.pimlico.io/v2/sepolia/rpc?apikey=pim_h119X1RCZ9YMEbFfysA7sK
```

## Implementation Roadmap

### Phase 1: Smart Account Factory (2-3 hours)
- Deploy ERC-4337 account factory contract
- Integrate Pimlico client libraries
- Create smart account on first login

### Phase 2: Paymaster Logic (1-2 hours)
- Configure sponsorship policies
- Set gas limits per operation
- Add fallback to user-paid gas

### Phase 3: Frontend Integration (2-3 hours)
- Update Web3Context to support both modes
- Modify transaction flows to use smart accounts
- Add toggle for gasless mode

### Phase 4: Testing (1-2 hours)
- Test bundled operations
- Verify paymaster sponsorship
- Ensure fallback mechanisms work

**Total Estimated Time**: 6-10 hours

## Current Status

✅ **Configured**: Pimlico API keys and endpoints set up  
❌ **Not Implemented**: Currently using standard MetaMask transactions  
📋 **Planned**: Future enhancement for better UX  

## Why Not Implemented Yet?

1. **Scope Priority**: Focused on core KRNL + AI verification first
2. **Complexity**: AA requires additional smart contracts and testing
3. **Presentation Ready**: Current implementation is fully functional for demo
4. **Future Enhancement**: Can be added post-presentation as v2 feature

## References

- [Pimlico Documentation](https://docs.pimlico.io/)
- [ERC-4337 Standard](https://eips.ethereum.org/EIPS/eip-4337)
- [Permissionless.js](https://docs.pimlico.io/permissionless)

---

**Note**: This integration would make StudyDAO more accessible to non-crypto-native users by removing the need to acquire testnet ETH for gas fees.
