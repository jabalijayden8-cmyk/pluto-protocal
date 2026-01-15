
export enum AuthMethod {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  WEB3 = 'WEB3',
  GOOGLE = 'GOOGLE'
}

export enum UserRole {
  USER = 'USER',
  CREATOR = 'CREATOR'
}

export type CustodyProvider = 'FIREBLOCKS' | 'BITGO' | 'COINBASE' | 'LEDGER_ENTERPRISE';

export interface AuditCertificate {
  id: string;
  auditor: 'OPENZEPPELIN' | 'CERTIK' | 'QUANTSTAMP';
  timestamp: number;
  status: 'VERIFIED' | 'REVOKED' | 'EXPIRED';
  hash: string;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'SEND' | 'RECEIVE' | 'LONG' | 'SHORT' | 'LIQUIDATION';
  asset: string;
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  timestamp: number;
  address?: string;
  custodyNode?: string;
  leverage?: number;
}

export interface UserWallet {
  id: string;
  balanceUsd: number;
  assets: {
    symbol: string;
    amount: number;
  }[];
  custodyProvider?: CustodyProvider;
}

export interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  role: UserRole;
  wallet: UserWallet;
  transactions: Transaction[];
  web3Address?: string;
  walletProvider?: string;
  auditCert?: AuditCertificate;
}

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: string;
  sparkline: number[];
}

export interface ForexPair {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  fundingRate: number;
}
