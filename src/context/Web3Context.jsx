import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Check if wallet is already connected on mount
    useEffect(() => {
        checkConnection();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, []);

    const checkConnection = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.listAccounts();

                if (accounts.length > 0) {
                    const signer = await provider.getSigner();
                    const network = await provider.getNetwork();

                    setProvider(provider);
                    setSigner(signer);
                    setAccount(accounts[0].address);
                    setChainId(Number(network.chainId));
                    setIsConnected(true);
                }
            } catch (error) {
                console.error('Error checking connection:', error);
            }
        }
    };

    const connectWallet = async () => {
        console.log('🔵 Connect Wallet clicked');
        console.log('🔍 window.ethereum:', window.ethereum);

        if (!window.ethereum) {
            alert('Please install MetaMask to use this dApp!');
            console.error('❌ MetaMask not detected');
            return;
        }

        setIsConnecting(true);
        console.log('⏳ Connecting to MetaMask...');

        try {
            // Request account access
            console.log('📝 Requesting accounts...');
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log('✅ Accounts received:', accounts);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const network = await provider.getNetwork();

            console.log('✅ Connected!');
            console.log('  - Address:', address);
            console.log('  - Network:', network.chainId);

            // Check if on Sepolia
            const targetChainId = Number(import.meta.env.VITE_CHAIN_ID);
            console.log('  - Target Chain ID:', targetChainId);

            if (Number(network.chainId) !== targetChainId) {
                console.log('⚠️  Wrong network, switching...');
                await switchNetwork(targetChainId);
            }

            setProvider(provider);
            setSigner(signer);
            setAccount(address);
            setChainId(Number(network.chainId));
            setIsConnected(true);

            console.log('🎉 Wallet connected successfully!');

        } catch (error) {
            console.error('❌ Error connecting wallet:', error);
            alert('Failed to connect wallet: ' + error.message);
        } finally {
            setIsConnecting(false);
        }
    };

    const switchNetwork = async (targetChainId) => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${targetChainId.toString(16)}` }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: `0x${targetChainId.toString(16)}`,
                            chainName: 'Sepolia Testnet',
                            nativeCurrency: {
                                name: 'ETH',
                                symbol: 'ETH',
                                decimals: 18
                            },
                            rpcUrls: ['https://rpc.sepolia.org'],
                            blockExplorerUrls: ['https://sepolia.etherscan.io']
                        }],
                    });
                } catch (addError) {
                    throw new Error('Failed to add network');
                }
            } else {
                throw switchError;
            }
        }
    };

    const disconnectWallet = () => {
        setProvider(null);
        setSigner(null);
        setAccount(null);
        setChainId(null);
        setIsConnected(false);
    };

    const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
            disconnectWallet();
        } else {
            setAccount(accounts[0]);
        }
    };

    const handleChainChanged = () => {
        window.location.reload();
    };

    const value = {
        provider,
        signer,
        account,
        chainId,
        isConnected,
        isConnecting,
        connectWallet,
        disconnectWallet
    };

    return (
        <Web3Context.Provider value={value}>
            {children}
        </Web3Context.Provider>
    );
};

export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error('useWeb3 must be used within Web3Provider');
    }
    return context;
};
