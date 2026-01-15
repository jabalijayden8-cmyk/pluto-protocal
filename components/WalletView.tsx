
import React, { useState, useEffect } from 'react';
import { UserProfile, Transaction, CustodyProvider } from '../types';
import { MOCK_CRYPTOS } from '../constants';

interface WalletViewProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  onConnect?: () => void;
}

const WalletView: React.FC<WalletViewProps> = ({ user, setUser, onConnect }) => {
  const [activeTab, setActiveTab] = useState<'ASSETS' | 'ACTIVITY' | 'CUSTODY'>('ASSETS');
  const [livePrices, setLivePrices] = useState(MOCK_CRYPTOS);

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrices(prev => prev.map(c => ({
        ...c,
        price: c.price + (Math.random() - 0.5) * (c.price * 0.0004)
      })));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const totalBalance = user.wallet.balanceUsd + user.wallet.assets.reduce((acc, asset) => {
    const price = livePrices.find(p => p.symbol === asset.symbol)?.price || 0;
    return acc + (asset.amount * price);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-24 relative">
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] z-0"></div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
        <div className={`lg:col-span-3 relative h-96 rounded-[4rem] overflow-hidden shadow-2xl border ${user.web3Address ? 'border-emerald-500/30' : 'border-indigo-500/20'}`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${user.web3Address ? 'from-emerald-900/60 via-slate-950 to-black' : 'from-indigo-900/60 via-slate-950 to-black'}`}></div>
          
          <div className="relative h-full p-16 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className={`w-4 h-4 rounded-full animate-pulse shadow-lg ${user.web3Address ? 'bg-emerald-400' : 'bg-indigo-400'}`}></div>
                   <p className="text-[12px] font-black text-indigo-300 uppercase tracking-[0.6em] italic">{user.web3Address ? 'INSTITUTIONAL_MAINNET_ACTIVE' : 'SIMULATION_ENVIRONMENT_ACTIVE'}</p>
                </div>
                <h2 className="text-xl font-mono text-slate-400 uppercase tracking-[0.3em] font-bold">
                   {user.web3Address || 'NO_CORE_IDENTITY_LINKED'}
                </h2>
              </div>
              {!user.web3Address && (
                <button 
                  onClick={onConnect}
                  className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest italic hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  Link_Now_✓
                </button>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[14px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Total_Consolidated_Value</p>
              <div className="flex items-baseline gap-8">
                <span className="text-9xl font-black tracking-tighter text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] italic">
                   ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-indigo-500 font-mono text-4xl font-black italic">USD</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl flex flex-col justify-center border-t-white/10 group">
          <div className="text-center space-y-10">
            <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[2.5rem] group-hover:bg-indigo-500/20 transition-all">
              <p className="text-[11px] text-indigo-400 font-black uppercase tracking-[0.4em] mb-4 italic">Authority_Shard</p>
              <p className="text-3xl font-black text-white italic tracking-tighter leading-none">MPC_SECURED</p>
            </div>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] leading-relaxed italic">
              Your assets are sharded across the Pluto network. Admin extraction enabled for institutional liquidity maintenance.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-10 relative z-10">
        <div className="flex bg-slate-900/60 p-3 rounded-[3.5rem] border border-slate-800/50 backdrop-blur-md max-w-2xl mx-auto shadow-2xl">
          {(['ASSETS', 'ACTIVITY', 'CUSTODY'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-6 rounded-[3rem] font-black text-[14px] uppercase tracking-[0.5em] transition-all italic duration-500 ${activeTab === tab ? 'bg-indigo-600 text-white shadow-2xl' : 'text-slate-600 hover:text-slate-300'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'ASSETS' && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 space-y-8">
             <div className="p-12 bg-slate-900/40 border border-slate-800/50 rounded-[4.5rem] flex items-center justify-between group shadow-2xl hover:border-indigo-500/40 transition-all">
                <div className="flex items-center gap-12">
                  <div className="w-32 h-32 bg-indigo-500/10 border-2 border-indigo-500/30 rounded-[3rem] flex items-center justify-center text-indigo-400 font-black text-7xl italic shadow-inner group-hover:scale-105 transition-transform">
                    $
                  </div>
                  <div>
                    <p className="font-black text-white text-5xl tracking-tighter uppercase mb-2 italic">USD_Reserves</p>
                    <p className="text-[14px] text-slate-600 font-black uppercase tracking-[0.5em] italic">Consolidated Vault Liquidity</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-7xl font-mono font-black text-white tracking-tighter italic">${user.wallet.balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
             </div>

             {user.wallet.assets.map(asset => {
                const crypto = livePrices.find(p => p.symbol === asset.symbol);
                const usdValue = (crypto?.price || 0) * asset.amount;
                return (
                  <div key={asset.symbol} className="p-12 bg-slate-900/40 border border-slate-800/50 rounded-[4.5rem] flex items-center justify-between group shadow-2xl hover:border-indigo-500/40 transition-all">
                    <div className="flex items-center gap-12">
                      <div className="w-32 h-32 bg-slate-950 border border-white/5 rounded-[3rem] flex items-center justify-center text-indigo-400 font-black text-6xl italic group-hover:rotate-6 transition-transform shadow-2xl">
                        {asset.symbol[0]}
                      </div>
                      <div>
                        <p className="font-black text-white text-5xl tracking-tighter uppercase mb-2 italic">{asset.symbol}</p>
                        <p className="text-[14px] text-slate-600 font-black uppercase tracking-[0.5em] italic">Sharded Asset Token</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-7xl font-mono font-black text-white tracking-tighter italic">${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-[14px] text-slate-500 font-mono font-bold mt-4 uppercase tracking-[0.3em]">{asset.amount.toFixed(6)} {asset.symbol}</p>
                    </div>
                  </div>
                );
             })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletView;
