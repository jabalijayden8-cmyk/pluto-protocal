
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, CryptoData } from '../types';
import { MOCK_CRYPTOS } from '../constants';
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from 'recharts';

interface DashboardProps {
  user: UserProfile;
  onConnectWallet?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onConnectWallet }) => {
  const [livePrices, setLivePrices] = useState(MOCK_CRYPTOS);
  const [integrityScore, setIntegrityScore] = useState(99.4);
  const [nodes, setNodes] = useState([
    { city: 'LONDON', ping: '12ms', status: 'STABLE', mainnet: 'CONNECTED' },
    { city: 'NEW YORK', ping: '24ms', status: 'HIGH_LOAD', mainnet: 'STABLE' },
    { city: 'SINGAPORE', ping: '45ms', status: 'STABLE', mainnet: 'LATENT' },
    { city: 'TOKYO', ping: '38ms', status: 'STABLE', mainnet: 'CONNECTED' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrices(prev => prev.map(c => ({
        ...c,
        price: c.price + (Math.random() - 0.5) * (c.price * 0.0006)
      })));
      setIntegrityScore(prev => Math.min(100, Math.max(99.1, prev + (Math.random() - 0.5) * 0.02)));
      setNodes(prev => prev.map(n => ({ ...n, ping: `${Math.floor(Math.random() * 15 + 10)}ms` })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const totalPortfolioValue = useMemo(() => {
    const assetValue = user.wallet.assets.reduce((acc, asset) => {
      const crypto = livePrices.find(p => p.symbol === asset.symbol);
      return acc + (asset.amount * (crypto?.price || 0));
    }, 0);
    return user.wallet.balanceUsd + assetValue;
  }, [user.wallet.balanceUsd, user.wallet.assets, livePrices]);

  const chartData = useMemo(() => {
    const base = totalPortfolioValue;
    return Array.from({length: 20}).map((_, i) => ({
      val: base * (0.98 + (i * 0.001) + (Math.random() * 0.015))
    }));
  }, [totalPortfolioValue]);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-32">
      {/* Massive Unlinked Identity Bridge CTA */}
      {!user.web3Address && (
        <div className="relative overflow-hidden bg-indigo-600 rounded-[3.5rem] p-12 shadow-[0_30px_100px_rgba(79,70,229,0.4)] border border-indigo-400/30 group animate-in slide-in-from-top-10 duration-700">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
           <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-40 group-hover:scale-125 transition-transform duration-1000"></div>
           <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="space-y-6 max-w-2xl text-center lg:text-left">
                 <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 border border-white/20 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic">CRITICAL_ACTION_REQUIRED</span>
                 </div>
                 <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
                    Identity_Bridge_Unlinked
                 </h2>
                 <p className="text-indigo-100 text-xl font-medium leading-relaxed italic opacity-80">
                    Your current session is restricted to <span className="text-white font-black underline">Paper Liquidity</span>. Sync your institutional node to enable real-time mainnet settlement and shard discovery.
                 </p>
              </div>
              <button 
                 onClick={onConnectWallet}
                 className="px-20 py-10 bg-white text-indigo-600 rounded-[3rem] font-black text-2xl uppercase tracking-[0.5em] italic shadow-2xl hover:scale-105 active:scale-95 transition-all group-hover:shadow-white/20"
              >
                 Connect_Node_✓
              </button>
           </div>
        </div>
      )}

      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-5">
            <h1 className="text-7xl font-black tracking-tighter text-white uppercase italic leading-none">Mission_Control</h1>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,1)]"></div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">Mainnet_Link: ACTIVE</span>
              </div>
              <div className={`flex items-center gap-3 px-4 py-1.5 border rounded-full transition-all ${user.web3Address ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-rose-500/10 border-rose-500/20 animate-pulse'}`}>
                <div className={`w-2 h-2 rounded-full ${user.web3Address ? 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,1)]' : 'bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,1)]'}`}></div>
                <span className={`text-[10px] font-black uppercase tracking-widest italic ${user.web3Address ? 'text-indigo-400' : 'text-rose-400'}`}>
                   Shard_Identity: {user.web3Address ? 'SECURED' : 'PENDING'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-slate-500 text-xl font-medium tracking-tight border-l-2 border-slate-800 pl-6">
            Institutional terminal for global liquidity routing and MPC vault management.
          </p>
        </div>
        
        <div className="flex gap-6">
           <div className="px-12 py-8 bg-slate-900/40 border border-white/5 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl border-t-white/10 group hover:border-indigo-500/30 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 blur-3xl -mr-12 -mt-12"></div>
              <p className="text-[11px] text-slate-600 font-black uppercase tracking-[0.5em] mb-3">Portfolio Net Exposure</p>
              <div className="flex items-baseline gap-4">
                 <span className="text-6xl font-black text-white tracking-tighter group-hover:text-indigo-400 transition-colors italic">${totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                 <span className="text-indigo-500 font-mono text-lg font-black italic">USD</span>
              </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        <div className="xl:col-span-3 space-y-10">
          <div className="bg-slate-900/40 border border-slate-800/50 rounded-[4rem] p-12 h-[600px] flex flex-col shadow-2xl backdrop-blur-md relative overflow-hidden group border-t-white/10">
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
             <div className="flex justify-between items-center mb-12 relative z-10 px-4">
                <div>
                   <h3 className="text-xs font-black uppercase tracking-[0.8em] text-slate-400">Yield_Discovery_Engine</h3>
                   <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest mt-1">Aggregating 24h PnL from Institutional Pools</p>
                </div>
                <div className="flex gap-4">
                   <div className="px-4 py-2 bg-black/40 border border-white/5 rounded-xl font-mono text-[10px] text-indigo-400 font-bold">
                      MODE: REAL_TIME
                   </div>
                </div>
             </div>
             <div className="flex-1 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="mainGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '2rem', boxShadow: '0 40px 80px rgba(0,0,0,0.8)' }}
                      itemStyle={{ color: '#818cf8', fontWeight: '900', textTransform: 'uppercase' }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Area type="monotone" dataKey="val" stroke="#818cf8" strokeWidth={8} fill="url(#mainGrad)" animationDuration={4000} strokeLinecap="round" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {MOCK_CRYPTOS.map(crypto => {
               const price = livePrices.find(p => p.id === crypto.id)?.price || 0;
               return (
                 <div key={crypto.id} className="bg-slate-900/40 border border-slate-800/50 p-8 rounded-[3rem] hover:border-indigo-500/30 transition-all shadow-xl group border-t-white/5">
                    <div className="flex justify-between items-center mb-6">
                       <div className="w-12 h-12 bg-black border border-white/10 rounded-2xl flex items-center justify-center font-black text-indigo-400 text-lg italic shadow-inner">{crypto.symbol[0]}</div>
                       <span className={`text-[10px] font-black tracking-widest ${crypto.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {crypto.change24h > 0 ? '+' : ''}{crypto.change24h}%
                       </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 italic">{crypto.name}</p>
                    <p className="text-3xl font-black text-white italic tracking-tighter">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                 </div>
               );
             })}
          </div>
        </div>

        <div className="space-y-10">
           <div className="bg-slate-900/60 border border-indigo-500/20 rounded-[4rem] p-12 shadow-2xl backdrop-blur-3xl relative overflow-hidden group border-t-indigo-500/30">
              <div className="flex justify-between items-start mb-12">
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Integrity</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 italic">Handshake Score</p>
                 </div>
                 <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
              </div>

              <div className="flex flex-col items-center mb-12">
                 <div className="text-7xl font-black text-white tracking-tighter mb-4 italic animate-in slide-in-from-bottom-2">{integrityScore.toFixed(2)}%</div>
                 <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${integrityScore}%` }}></div>
                 </div>
              </div>

              <div className="space-y-4">
                 {nodes.map(node => (
                    <div key={node.city} className="flex justify-between items-center p-5 bg-black/40 rounded-[1.5rem] border border-white/5 hover:border-indigo-500/30 transition-all group/node">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase group-hover/node:text-indigo-400 transition-colors">{node.city}</span>
                          <span className="text-[8px] text-slate-700 font-bold uppercase tracking-widest mt-0.5">{node.mainnet}</span>
                       </div>
                       <span className="text-xs font-mono font-black text-white italic">{node.ping}</span>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-[3rem] p-10 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                 </div>
                 <h4 className="text-xs font-black text-white uppercase tracking-widest italic">MPC Custody Active</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium italic">
                 Private keys are sharded across 12 distributed nodes. No single entity can unilaterally sign transactions.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
