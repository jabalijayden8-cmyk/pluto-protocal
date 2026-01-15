
import React from 'react';
import { CryptoData, UserRole, AuditCertificate, ForexPair } from './types';

export const VERIFICATION_CODE = '196405';

export const MOCK_EXCHANGES = [
  { id: 'binance', name: 'Binance', fee: '0.1%', status: 'Stable' },
  { id: 'coinbase', name: 'Coinbase Pro', fee: '0.5%', status: 'Stable' },
  { id: 'kraken', name: 'Kraken', fee: '0.26%', status: 'High Volume' },
  { id: 'pluto_dex', name: 'Pluto DEX', fee: '0.05%', status: 'Optimal' },
];

export const MOCK_FOREX: ForexPair[] = [
  { id: 'eur_usd', symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.0842, change24h: 0.12, fundingRate: 0.0001 },
  { id: 'gbp_usd', symbol: 'GBP/USD', name: 'British Pound / US Dollar', price: 1.2654, change24h: -0.05, fundingRate: 0.0002 },
  { id: 'usd_jpy', symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', price: 150.32, change24h: 0.45, fundingRate: -0.0001 },
  { id: 'aud_usd', symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', price: 0.6542, change24h: -0.18, fundingRate: 0.0001 }
];

export const generateRegistrySeed = () => {
  const seeds = [
    { id: '0x1111', name: 'Pluto Core Genesis', symbol: 'PLTO', tvl: '$12.4B', status: 'LIVE', health: 100, tier: 1 },
    { id: '0x99F1', name: 'Mars Liquidity Bridge', symbol: 'MARS', tvl: '$2.1B', status: 'Operational', health: 100, tier: 1 },
  ];

  const suffixes = ['Alpha', 'Institutional', 'Liquidity', 'Bridge', 'Vault', 'Index', 'Protocol', 'Hub', 'Nexus', 'Terminal'];
  const prefixes = ['Global', 'Quantum', 'Prime', 'Titan', 'Apex', 'Solid', 'Iron', 'Ether', 'Vortex', 'Sovereign'];

  for (let i = 0; i < 20000; i++) {
    const pre = prefixes[i % prefixes.length];
    const suf = suffixes[Math.floor(Math.random() * suffixes.length)];
    const id = '0x' + (i + 5000).toString(16).toUpperCase();
    const tvlValue = (Math.random() * 500 + 1).toFixed(1);
    
    seeds.push({
      id,
      name: `${pre} ${suf} Node ${i}`,
      symbol: pre.slice(0, 3).toUpperCase(),
      tvl: `$${tvlValue}M`,
      status: Math.random() > 0.1 ? 'Operational' : 'Syncing',
      health: Math.floor(Math.random() * 20) + 80,
      tier: i < 500 ? 2 : 3
    });
  }
  return seeds;
};

export const MOCK_AUDIT_CERT: AuditCertificate = {
  id: 'CERT-OZ-9912',
  auditor: 'OPENZEPPELIN',
  timestamp: Date.now() - 86400000 * 45,
  status: 'VERIFIED',
  hash: '0x8f2a9c...1e7b6d4'
};

export const MOCK_CRYPTOS: CryptoData[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 68420.50,
    change24h: 2.45,
    marketCap: '$1.3T',
    sparkline: [65000, 66000, 65500, 67000, 68000, 67500, 68420]
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3450.12,
    change24h: -1.20,
    marketCap: '$414B',
    sparkline: [3550, 3500, 3400, 3420, 3480, 3460, 3450]
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    price: 145.88,
    change24h: 5.67,
    marketCap: '$65B',
    sparkline: [130, 135, 138, 142, 140, 144, 145.8]
  },
  {
    id: 'pluto',
    symbol: 'PLTO',
    name: 'Pluto',
    price: 1.00,
    change24h: 0.0,
    marketCap: '$1.2B',
    sparkline: [1, 1, 1, 1, 1, 1, 1]
  }
];

export const INITIAL_USER_STATE = {
  id: 'PLTO-' + Math.random().toString(16).slice(2, 10),
  email: 'explorer@node-network.io',
  role: UserRole.USER,
  auditCert: MOCK_AUDIT_CERT,
  wallet: {
    id: 'w-' + Math.random().toString(16).slice(2, 6),
    balanceUsd: 10000.00,
    custodyProvider: 'FIREBLOCKS' as const,
    assets: [
        { symbol: 'PLTO', amount: 1000 }
    ]
  },
  transactions: []
};

export const INITIAL_CREATOR_STATE = {
  id: 'PLTO-ADMIN-' + Math.random().toString(16).slice(2, 6),
  email: 'admin-gatekeeper@sovereign-layer.net',
  role: UserRole.CREATOR,
  wallet: {
    id: 'admin-w-' + Math.random().toString(16).slice(2, 6),
    balanceUsd: 1000000.00,
    assets: [
        { symbol: 'PLTO', amount: 1000000 }
    ]
  },
  transactions: []
};
