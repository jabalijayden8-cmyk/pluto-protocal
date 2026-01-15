
import React, { useState, useEffect } from 'react';
import { UserProfile, AuthMethod } from '../types';
import { BrowserProvider, formatEther } from 'ethers';
import WalletSelector from './WalletSelector';

interface SettingsProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  addNotification: (title: string, message: string, type: 'EMAIL' | 'SMS' | 'SYSTEM') => void;
}

const Settings: React.FC<SettingsProps> = ({ user, setUser, addNotification }) => {
  const [isIndexed, setIsIndexed] = useState(true);
  const [customDomain, setCustomDomain] = useState('terminal.pluto-vault.io');
  const [isLinking, setIsLinking] = useState(false);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [entropy, setEntropy] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setEntropy(Array.from({length: 40}).map(() => Math.random()));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleWalletSelect = async (providerId: string) => {
    setShowWalletSelector(false);
    setIsLinking(true);
    setError(null);
    
    if (providerId === 'metamask' || providerId === 'coinbase' || providerId === 'phantom') {
      if (typeof (window as any).ethereum === 'undefined') {
        setError(`EVM_ERROR: ${providerId.toUpperCase()} not detected in browser environment.`);
        setIsLinking(false);
        return;
      }

      try {
        const provider = new BrowserProvider((window as any).ethereum);
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        const balance = await provider.getBalance(address);
        const ethAmount = parseFloat(formatEther(balance));

        setUser({ 
          ...user, 
          web3Address: address,
          wallet: {
            ...user.wallet,
            assets: [
              ...user.wallet.assets.filter(a => a.symbol !== 'ETH'),
              { symbol: 'ETH', amount: ethAmount }
            ]
          }
        });
        
        addNotification('Identity Updated', `Linked ${providerId} node ${address.slice(0, 6)}... to protocol.`, 'EMAIL');
        setIsLinking(false);
      } catch (err: any) {
        setError('HANDSHAKE_FAILED: Connection refused by the institutional signer.');
        setIsLinking(false);
      }
    } else {
      setTimeout(() => {
        const mockAddr = '0x' + Math.random().toString(16).slice(2, 42);
        setUser({ 
          ...user, 
          web3Address: mockAddr,
          wallet: {
            ...user.wallet,
            assets: [
              ...user.wallet.assets.filter(a => a.symbol !== 'ETH'),
              { symbol: 'ETH', amount: 4.21 }
            ]
          }
        });
        addNotification('Identity Updated', `Universal bridge established for provider: ${providerId.toUpperCase()}`, 'EMAIL');
        setIsLinking(false);
      }, 2000);
    }
  };

  const disconnectWallet = () => {
    setUser({ ...user, web3Address: undefined });
    addNotification('Identity Updated', 'Web3 address unlinked from protocol. Security alert sent to email.', 'EMAIL');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addNotification('System', 'Identifier copied to clipboard buffer.', 'SYSTEM');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-24 px-4 sm:px-0">
      {showWalletSelector && (
        <WalletSelector onSelect={handleWalletSelect} onClose={() => setShowWalletSelector(false)} />
      )}

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white uppercase italic">Profile_Center</h1>
            <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
              MAINNET NODE ACTIVE
            </div>
          </div>
          <p className="text-slate-500 font-medium text-base sm:text-lg">Managing institutional identity and node configuration.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-6">
           <div className="relative group cursor-pointer perspective-1000">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-slate-900 border border-slate-800 rounded-[3rem] p-10 overflow-hidden shadow-2xl transition-all duration-500 group-hover:translate-y-[-8px]">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                 <div className="absolute bottom-0 left-0 w-48 h-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0"></div>
                 <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-5xl font-black text-white shadow-2xl relative overflow-hidden">
                       <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
                       {user.email?.[0] || 'U'}
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic truncate max-w-full px-4">{user.email || 'Anonymous'}</h2>
                       <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mt-2">Pluto Protocol Tier 1</p>
                    </div>
                 </div>
                 <div className="mt-12 space-y-6 border-t border-slate-800 pt-8">
                    <div>
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Node Identifier</p>
                       <div className="flex items-center justify-between gap-4">
                          <p className="text-[11px] font-mono text-slate-300 font-bold truncate">{user.id}</p>
                          <button onClick={() => copyToClipboard(user.id)} className="text-indigo-400 hover:text-white transition-colors shrink-0">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2"/></svg>
                          </button>
                       </div>
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Status</p>
                       <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Verified Explorer</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Mobile Handshake Bridge */}
           <div className="bg-black/60 border border-white/5 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="flex flex-col items-center text-center space-y-6">
                 <div className="flex justify-between w-full items-center">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Mobile_Handshake</h3>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,1)]"></div>
                 </div>
                 <div className="w-40 h-40 bg-white p-3 rounded-2xl shadow-xl relative group-hover:scale-105 transition-transform">
                    {/* Simulated QR Pattern */}
                    <div className="w-full h-full grid grid-cols-5 grid-rows-5 gap-1.5">
                       {Array.from({length: 25}).map((_, i) => (
                          <div key={i} className={`rounded-sm ${Math.random() > 0.4 ? 'bg-slate-950' : 'bg-transparent'}`}></div>
                       ))}
                    </div>
                 </div>
                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                   Scan this encrypted terminal bridge to mirror your Pluto session on a mobile device.
                 </p>
              </div>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-10">
          <section className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-6 sm:p-10 space-y-10 shadow-2xl">
            <div className="space-y-6">
               <div className="flex justify-between items-end">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Node Signal Signature</h3>
                  <span className="text-[9px] font-bold text-slate-700 font-mono">MAINNET_LINK</span>
               </div>
               <div className={`relative p-6 sm:p-10 rounded-[2.5rem] border transition-all duration-700 ${user.web3Address ? 'bg-indigo-600/5 border-indigo-500/20' : 'bg-slate-950 border-slate-800'}`}>
                  <div className="absolute top-0 left-10 right-10 flex gap-1 h-1">
                     {entropy.map((v, i) => (
                       <div key={i} className={`flex-1 transition-all duration-300 ${user.web3Address ? 'bg-indigo-500/40' : 'bg-slate-800'}`} style={{ height: `${user.web3Address ? v * 100 : 20}%` }}></div>
                     ))}
                  </div>
                  <div className="flex flex-col items-center justify-between gap-10">
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full">
                      <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center shrink-0 transition-all duration-500 ${user.web3Address ? 'bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.5)] rotate-3' : 'bg-slate-900 text-slate-700 border border-slate-800'}`}>
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
                      </div>
                      <div className="space-y-2 flex-1 min-w-0">
                        <p className="font-black text-lg text-white tracking-tighter uppercase">Universal Web3 Node</p>
                        <div className="flex items-center justify-center sm:justify-start gap-3 w-full">
                           <p className="text-[11px] text-slate-500 font-mono break-all truncate">{isLinking ? 'BROADCASTING_BRIDGE...' : user.web3Address ? `${user.web3Address}` : 'UNLINKED_MAINNET_STATUS'}</p>
                           {user.web3Address && (
                             <button onClick={() => copyToClipboard(user.web3Address!)} className="p-2 bg-slate-900 rounded-lg text-indigo-400 hover:text-white transition-all border border-slate-800 shrink-0">
                               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2"/></svg>
                             </button>
                           )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={user.web3Address ? disconnectWallet : () => setShowWalletSelector(true)} 
                      disabled={isLinking} 
                      className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all relative overflow-hidden group ${user.web3Address ? 'bg-rose-600/10 text-rose-400 border border-rose-600/20 hover:bg-rose-600 hover:text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-2xl shadow-indigo-600/20'}`}
                    >
                      {isLinking ? 'Linking...' : user.web3Address ? 'Disconnect' : 'Sync Any Wallet'}
                    </button>
                  </div>
               </div>
            </div>
            {error && <p className="text-rose-500 text-[10px] font-black uppercase text-center animate-pulse tracking-widest">{error}</p>}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Global DNS Entry</h3>
              <div className="flex items-center gap-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800 group focus-within:border-indigo-500 transition-all">
                <input type="text" value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} className="flex-1 bg-transparent border-none text-sm font-mono text-white focus:outline-none"/>
              </div>
            </div>
          </section>

          <div className="p-10 bg-indigo-600/5 border border-indigo-500/10 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-6">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <div>
                <p className="text-[11px] font-black text-white uppercase tracking-widest mb-2 italic">Institutional Clearance</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                  Pluto Protocol v4.2 enforces Sovereign Ownership. All assets remain in your sharded MPC custody at all times.
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
