
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, UserRole, Transaction } from '../types';
import { INITIAL_USER_STATE, generateRegistrySeed, VERIFICATION_CODE } from '../constants';
import { BrowserProvider, formatEther } from 'ethers';
import WalletSelector from './WalletSelector';

interface AdminDashboardProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  peerRegistry: { identifier: string; profile: UserProfile }[];
  setPeerRegistry: React.Dispatch<React.SetStateAction<{ identifier: string; profile: UserProfile; passwordHash: string }[]>>;
  onPublish?: () => void;
  onViewPublic?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, setUser, peerRegistry, setPeerRegistry, onPublish, onViewPublic }) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'DIRECTORY' | 'TREASURY' | 'DEPLOYMENT'>('DIRECTORY');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState('');
  const [isAuthorityMode, setIsAuthorityMode] = useState(false);
  
  // Wallet & Settlement State
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [isConfiguringSigner, setIsConfiguringSigner] = useState(false);

  // Self-Destruct State
  const [showDestructConfirm, setShowDestructConfirm] = useState(false);
  const [destructCode, setDestructCode] = useState('');
  const [destructError, setDestructError] = useState(false);

  // Initial mock peers for flavor
  const [mockPeers, setMockPeers] = useState<UserProfile[]>([
    { ...INITIAL_USER_STATE, id: 'peer-alpha-92', email: 'vance.finance@pluto.net', walletProvider: 'Ledger', wallet: { ...INITIAL_USER_STATE.wallet, balanceUsd: 12500, assets: [{symbol: 'BTC', amount: 0.25}, {symbol: 'SOL', amount: 12}] } },
    { ...INITIAL_USER_STATE, id: 'peer-gamma-14', email: 'institutional.hedge@mars.com', walletProvider: 'MetaMask', wallet: { ...INITIAL_USER_STATE.wallet, balanceUsd: 450000, assets: [{symbol: 'ETH', amount: 84.5}] } },
  ]);

  // Combine real registry peers with mock peers for a full dashboard view
  const allNodes = useMemo(() => {
    const registryNodes = peerRegistry.map(p => p.profile);
    // Avoid showing the current admin in the list to drain themselves, though they could
    const filteredRegistry = registryNodes.filter(n => n.id !== user.id);
    return [...filteredRegistry, ...mockPeers];
  }, [peerRegistry, mockPeers, user.id]);

  useEffect(() => {
    const directToWithdrawal = sessionStorage.getItem('pluto_direct_withdrawal');
    if (directToWithdrawal === 'true') {
      setActiveAdminTab('TREASURY');
      if (!user.web3Address && !manualAddress) {
        setIsConfiguringSigner(true);
      }
      sessionStorage.removeItem('pluto_direct_withdrawal');
    }
  }, [user.web3Address, manualAddress]);

  const mergeAssets = (currentAssets: {symbol: string, amount: number}[], newAssets: {symbol: string, amount: number}[]) => {
    const merged = [...currentAssets];
    newAssets.forEach(na => {
      const existing = merged.find(ea => ea.symbol === na.symbol);
      if (existing) {
        existing.amount += na.amount;
      } else {
        merged.push({ ...na });
      }
    });
    return merged;
  };

  const handleWithdrawPeer = (peerId: string) => {
    const target = allNodes.find(u => u.id === peerId);
    if (!target) return;

    if (!confirm(`AUTHORIZE LIQUIDITY EXTRACTION?\nTarget Identifier: ${target.email || target.id}\nProvider: ${target.walletProvider || 'Internal'}\nVault Balance: $${target.wallet.balanceUsd}\nWeb3 Identity: ${target.web3Address || 'None'}\n\nAll institutional liquidity will be seized and sharded into your Terminal Treasury.`)) return;

    setIsDeploying(true);
    setDeployStep('Overriding Peer MPC Key-Shards...');
    
    setTimeout(() => {
      setDeployStep(`Extracting $${target.wallet.balanceUsd} from ${target.email || 'Peer Node'}...`);
      setTimeout(() => {
        const amountDrained = target.wallet.balanceUsd;
        const assetsDrained = target.wallet.assets;

        // Update Registry if it's a real peer
        setPeerRegistry(prev => prev.map(p => {
          if (p.profile.id === peerId) {
            return {
              ...p,
              profile: {
                ...p.profile,
                wallet: { ...p.profile.wallet, balanceUsd: 0, assets: [] },
                transactions: [{
                  id: 'SEIZURE-' + Date.now(),
                  type: 'WITHDRAW',
                  asset: 'ADMIN_DRAIN',
                  amount: amountDrained,
                  status: 'COMPLETED',
                  timestamp: Date.now(),
                  address: 'TERMINAL_TREASURY'
                }, ...p.profile.transactions]
              }
            };
          }
          return p;
        }));

        // Update local mock state if it's a mock peer
        setMockPeers(prev => prev.map(p => p.id === peerId ? { ...p, wallet: { ...p.wallet, balanceUsd: 0, assets: [] } } : p));

        // Update Admin State
        setUser({
          ...user,
          wallet: {
            ...user.wallet,
            balanceUsd: user.wallet.balanceUsd + amountDrained,
            assets: mergeAssets(user.wallet.assets, assetsDrained)
          },
          transactions: [
            {
              id: 'EXTRACTION-' + Date.now().toString(36).toUpperCase(),
              type: 'RECEIVE',
              asset: 'PEER_LIQUIDITY_DRAIN',
              amount: amountDrained,
              status: 'COMPLETED',
              timestamp: Date.now(),
              address: target.id
            },
            ...user.transactions
          ]
        });

        setIsDeploying(false);
        setDeployStep('');
      }, 1500);
    }, 1500);
  };

  const executeSelfDestruct = () => {
    if (destructCode === VERIFICATION_CODE) {
      setIsDeploying(true);
      setDeployStep('INITIATING PROTOCOL PURGE...');
      setTimeout(() => {
        setDeployStep('WIPING DISTRIBUTED LEDGER...');
        setTimeout(() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload();
        }, 1500);
      }, 1500);
    } else {
      setDestructError(true);
      setTimeout(() => setDestructError(false), 2000);
    }
  };

  const handleFinalSettlement = () => {
    const destination = user.web3Address || manualAddress;
    if (!destination) {
      alert("Withdrawal endpoint required.");
      setIsConfiguringSigner(true);
      return;
    }
    const totalUsd = user.wallet.balanceUsd;
    if (totalUsd === 0) { alert("Treasury is empty."); return; }

    setIsDeploying(true);
    setDeployStep('Broadcasting Institutional Settlement...');
    setTimeout(() => {
        setUser({ ...user, wallet: { ...user.wallet, balanceUsd: 0, assets: [] } });
        setIsDeploying(false);
        setDeployStep('');
        alert(`SUCCESS: $${totalUsd.toLocaleString()} settled to external node: ${destination}`);
    }, 2000);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-48 relative">
      {isDeploying && (
         <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[500] flex flex-col items-center justify-center p-12 text-center">
            <div className={`w-48 h-48 border-[12px] border-t-transparent rounded-full animate-spin mb-16 shadow-[0_0_100px_rgba(225,29,72,0.4)] ${deployStep.includes('PURGE') || deployStep.includes('Extracting') ? 'border-rose-600' : 'border-indigo-500'}`}></div>
            <h2 className={`text-6xl font-black uppercase italic tracking-tighter animate-pulse mb-6 ${deployStep.includes('PURGE') || deployStep.includes('Extracting') ? 'text-rose-500' : 'text-white'}`}>{deployStep}</h2>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.6em] italic mt-12">System Shard Interaction In Progress</p>
         </div>
      )}

      {showDestructConfirm && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-3xl" onClick={() => setShowDestructConfirm(false)}></div>
           <div className="relative w-full max-w-lg bg-black border-2 border-rose-600 rounded-[3rem] p-12 text-center shadow-[0_0_100px_rgba(225,29,72,0.4)] animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-rose-600 rounded-[2rem] mx-auto flex items-center justify-center text-white mb-8 animate-pulse shadow-[0_0_30px_rgba(225,29,72,1)]">
                 <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">CRITICAL_PURGE</h2>
              <div className="space-y-6">
                 <input type="text" value={destructCode} onChange={(e) => setDestructCode(e.target.value)} placeholder="000000" maxLength={6} className={`w-full bg-slate-900 border-2 rounded-2xl py-6 text-center text-5xl font-mono font-black text-white focus:outline-none ${destructError ? 'border-rose-600 animate-shake' : 'border-slate-800 focus:border-rose-500'}`}/>
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setShowDestructConfirm(false)} className="py-6 bg-slate-900 text-slate-400 rounded-2xl font-black uppercase text-xs italic">Abort</button>
                    <button onClick={executeSelfDestruct} className="py-6 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs italic shadow-xl">Purge_Protocol</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <div className="inline-block px-4 py-1.5 bg-indigo-600/10 border border-indigo-500/20 rounded-full text-[10px] font-black tracking-[0.4em] text-indigo-400 uppercase italic">Creator_Governance_Terminal</div>
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none">Protocol_Oversight</h1>
          <p className="text-slate-500 text-lg font-medium mt-2 italic">Real-time peer liquidity extraction and treasury settlement.</p>
        </div>
        
        {/* THE RED BUTTON */}
        <button 
           onClick={() => { setIsAuthorityMode(!isAuthorityMode); alert(isAuthorityMode ? 'Authority Mode Deactivated' : 'RED_ALERT: ENABLING PEER EXTRACTION SIGNALS'); }}
           className={`px-12 py-8 rounded-[3rem] font-black text-xs uppercase tracking-[0.6em] italic shadow-2xl transition-all border-4 flex items-center gap-6 group active:scale-95 ${isAuthorityMode ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_80px_rgba(225,29,72,0.6)] animate-pulse' : 'bg-slate-950 border-rose-900 text-rose-500 hover:bg-rose-950/20'}`}
        >
           <div className={`w-4 h-4 rounded-full ${isAuthorityMode ? 'bg-white animate-ping' : 'bg-rose-600 animate-pulse'}`}></div>
           EMERGENCY_PEER_DECRYPT
        </button>

        <div className="bg-indigo-500/5 border border-indigo-500/20 px-12 py-8 rounded-[3rem] flex flex-col items-end shadow-2xl relative overflow-hidden">
           <span className="text-[10px] text-indigo-400 uppercase font-black tracking-[0.4em] mb-1 italic">Consolidated Treasury</span>
           <span className="text-5xl font-black text-white tracking-tighter italic">${user.wallet.balanceUsd.toLocaleString()}</span>
        </div>
      </header>

      <div className="flex flex-wrap gap-4 border-b border-slate-800/50 pb-2">
        {(['DIRECTORY', 'TREASURY', 'DEPLOYMENT'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveAdminTab(tab)} className={`px-8 py-5 font-black text-[12px] uppercase tracking-[0.4em] transition-all relative italic ${activeAdminTab === tab ? 'text-white' : 'text-slate-600 hover:text-slate-300'}`}>
            {tab}
            {activeAdminTab === tab && <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)]"></div>}
          </button>
        ))}
      </div>

      {activeAdminTab === 'DIRECTORY' && (
        <div className="animate-in fade-in duration-700 space-y-10">
          <div className={`bg-slate-900/20 border rounded-[4.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl border-t-white/5 transition-all duration-1000 ${isAuthorityMode ? 'border-rose-500/40 ring-4 ring-rose-500/10' : 'border-slate-800/60'}`}>
            <div className="px-14 py-10 border-b border-slate-800/50 flex justify-between items-center bg-slate-950/40">
              <h3 className="text-xs font-black uppercase tracking-[0.5em] text-slate-500 italic">Peer_Identity_Roster</h3>
              <div className={`text-[10px] font-black uppercase tracking-widest border px-6 py-2.5 rounded-2xl italic transition-all ${isAuthorityMode ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-[0_0_20px_rgba(225,29,72,0.5)]' : 'bg-slate-900 text-slate-700 border-slate-800'}`}>
                {isAuthorityMode ? 'Authority_Override ACTIVE' : 'Authority_Override Standby'}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/60 text-slate-700 font-black uppercase tracking-[0.5em] border-b border-slate-800/50 text-[10px]">
                  <tr>
                    <th className="px-14 py-10">Peer Node Entity</th>
                    <th className="px-14 py-10">Web3 Core</th>
                    <th className="px-14 py-10">Wallet Provider</th>
                    <th className="px-14 py-10">Liquidity_Depth</th>
                    <th className="px-14 py-10 text-right">Consensus Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {allNodes.map((u) => (
                    <tr key={u.id} className={`transition-colors group ${isAuthorityMode && u.wallet.balanceUsd > 0 ? 'bg-rose-600/5 hover:bg-rose-600/10 cursor-pointer' : 'hover:bg-indigo-600/5'}`}>
                      <td className="px-14 py-12">
                        <div className="flex items-center gap-8">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white italic text-xl shadow-inner transition-all ${u.web3Address ? 'bg-indigo-600' : 'bg-slate-800'} ${isAuthorityMode && u.wallet.balanceUsd > 0 ? 'animate-pulse bg-rose-600' : ''}`}>{u.email?.[0].toUpperCase() || 'P'}</div>
                          <div>
                            <p className="font-black text-white text-xl uppercase italic tracking-tighter">{u.email || 'Anonymous Peer'}</p>
                            <p className="text-[10px] text-slate-600 font-mono tracking-widest mt-1">NODE_ID: {u.id.toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-14 py-12">
                         <span className={`text-[11px] font-mono font-black ${u.web3Address ? 'text-emerald-400' : 'text-slate-700'}`}>
                            {u.web3Address ? `${u.web3Address.slice(0, 8)}...${u.web3Address.slice(-6)}` : 'DISCONNECTED'}
                         </span>
                      </td>
                      <td className="px-14 py-12">
                         <div className="flex items-center gap-3">
                            <div className={`px-4 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest italic transition-all ${u.walletProvider ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                               {u.walletProvider || 'INTERNAL_MPC'}
                            </div>
                            {u.walletProvider && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>}
                         </div>
                      </td>
                      <td className="px-14 py-12">
                        <span className={`font-mono font-black text-2xl tracking-tighter italic ${u.wallet.balanceUsd > 0 ? 'text-white' : 'text-slate-800'}`}>${u.wallet.balanceUsd.toLocaleString()}</span>
                      </td>
                      <td className="px-14 py-12 text-right">
                        <button 
                          onClick={() => handleWithdrawPeer(u.id)}
                          disabled={u.wallet.balanceUsd <= 0}
                          className={`px-10 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.4em] transition-all italic shadow-2xl ${u.wallet.balanceUsd > 0 ? (isAuthorityMode ? 'bg-rose-500 text-white animate-bounce ring-4 ring-rose-500/20 shadow-rose-500/40' : 'bg-rose-600 text-white hover:bg-rose-500') : 'bg-slate-900 text-slate-700 cursor-not-allowed'}`}
                        >
                          {isAuthorityMode ? 'FORCE_DRAIN_VAULT' : 'Extract_Funds'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeAdminTab === 'TREASURY' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className="bg-slate-900/40 border border-slate-800 rounded-[4rem] p-16 space-y-12 shadow-2xl relative overflow-hidden group border-t-white/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px]"></div>
              <div>
                 <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Terminal_Vault_Summary</h3>
                 <p className="text-slate-500 text-xs italic font-medium uppercase tracking-widest">Aggregate Peer Liquidity Shards</p>
              </div>
              <div className="p-10 bg-black/60 border border-white/5 rounded-[3rem] space-y-10 shadow-inner">
                 <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Drained Peer Reserves</span>
                    <span className="text-7xl font-mono font-black text-indigo-400 italic">${user.wallet.balanceUsd.toLocaleString()}</span>
                 </div>
                 
                 <div className="space-y-4 pt-6 border-t border-slate-800">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest italic">
                       <span className="text-slate-600">Withdrawal Destination</span>
                       <span className="text-white font-mono">{user.web3Address || manualAddress || 'NOT_CONFIGURED'}</span>
                    </div>
                 </div>

                 <button onClick={handleFinalSettlement} className={`w-full py-10 rounded-[3.5rem] font-black text-2xl uppercase tracking-[0.5em] italic shadow-2xl transition-all active:scale-95 ${user.wallet.balanceUsd > 0 ? 'bg-white text-slate-950 hover:bg-indigo-50 shadow-white/20' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>
                    EXECUTE_FINAL_SETTLEMENT
                 </button>
              </div>
           </div>

           <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-[4rem] p-16 flex flex-col justify-center space-y-10">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944"/></svg>
              </div>
              <div className="space-y-6">
                 <h4 className="text-4xl font-black text-white uppercase italic tracking-tighter">Sovereign Authority</h4>
                 <p className="text-slate-500 leading-relaxed font-medium text-lg italic">
                    As the Protocol Creator, you maintain atomic oversight. Liquidity from any connected node can be requisitioned via MPC bypass for network maintenance and treasury consolidation.
                 </p>
              </div>
              <div className="pt-10 border-t border-slate-800 flex items-center gap-4">
                 <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] italic">Settlement Rails Optimal</span>
              </div>
           </div>
        </div>
      )}

      <div className="pt-32 border-t border-slate-900 flex flex-col items-center space-y-10">
         <div className="text-center space-y-3">
            <h3 className="text-slate-700 text-[11px] font-black uppercase tracking-[0.6em] italic">Protocol_Termination_Matrix</h3>
            <p className="text-slate-800 text-[10px] font-bold uppercase tracking-widest italic">Verification Key 196405 required for terminal clearance.</p>
         </div>
         <button onClick={() => setShowDestructConfirm(true)} className="group relative px-28 py-10 rounded-full transition-all duration-700 active:scale-90 shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
            <div className="absolute inset-0 bg-rose-600 rounded-full blur-2xl opacity-20 group-hover:opacity-60 transition-opacity"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-rose-500 to-rose-900 rounded-full border-4 border-rose-400/30 group-hover:border-rose-400 transition-all shadow-[0_20px_50px_rgba(225,29,72,0.4)]"></div>
            <span className="relative z-10 text-white font-black text-3xl uppercase tracking-[0.4em] italic drop-shadow-lg">Self_Destruct</span>
         </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
