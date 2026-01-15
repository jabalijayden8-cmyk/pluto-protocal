
import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { MOCK_CRYPTOS } from '../constants';

interface NavbarProps {
  user: UserProfile;
  toggleSidebar: () => void;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  isPublished?: boolean;
  onConnectWallet?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, toggleSidebar, onNavigate, onLogout, isPublished, onConnectWallet }) => {
  const [tickerPrices, setTickerPrices] = useState(MOCK_CRYPTOS);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerPrices(prev => prev.map(c => ({
        ...c,
        price: c.price + (Math.random() - 0.5) * (c.price * 0.0003)
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleVaultInteraction = (e: React.MouseEvent) => {
    onNavigate('WALLET');
  };

  const handleVaultDoubleClick = () => {
    if (user.role === UserRole.CREATOR) {
      sessionStorage.setItem('pluto_direct_withdrawal', 'true');
      onNavigate('ADMIN');
    }
  };

  return (
    <nav className="h-28 bg-slate-950/95 backdrop-blur-3xl border-b border-white/10 flex items-center justify-between px-12 sticky top-0 z-50 shadow-[0_10px_50px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-10">
        <button onClick={toggleSidebar} className="md:hidden text-slate-400 hover:text-white transition-colors">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16m-7 6h7"/></svg>
        </button>
        <div className="flex items-center gap-6 cursor-pointer group" onClick={() => onNavigate(user.role === UserRole.CREATOR ? 'ADMIN' : 'DASHBOARD')}>
          <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center font-black shadow-[0_0_50px_rgba(79,70,229,0.6)] group-hover:scale-110 transition-transform text-white text-4xl italic border-2 border-white/20">P</div>
          <div className="flex flex-col">
            <span className="font-black text-5xl tracking-tighter text-white uppercase italic leading-none">PLUTO</span>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.6em] mt-1.5 italic">SOVEREIGN_SYSTEM</span>
          </div>
        </div>
      </div>

      <div className="hidden xl:flex flex-1 mx-20 overflow-hidden items-center gap-12 border-x border-white/5 px-16 h-full">
        <div className="flex animate-marquee whitespace-nowrap gap-24">
          {[...tickerPrices, ...tickerPrices].map((c, i) => (
            <div key={`${c.id}-${i}`} className="flex items-center gap-5 group cursor-default">
              <span className="text-[12px] font-black text-slate-600 uppercase tracking-[0.5em] group-hover:text-indigo-400 transition-colors italic">{c.symbol}/USD</span>
              <span className="text-xl font-mono font-black text-white tracking-tighter italic">${c.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <div className={`flex items-center gap-1.5 text-[11px] font-black italic ${c.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {c.change24h > 0 ? '▲' : '▼'} {Math.abs(c.change24h)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-10">
        {!user.web3Address ? (
          <button 
            onClick={onConnectWallet}
            className="flex items-center gap-5 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] italic hover:scale-105 active:scale-95 transition-all shadow-[0_0_60px_rgba(79,70,229,0.5)] animate-pulse border-2 border-white/20"
          >
            <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
            CONNECT_CORE_NODE
          </button>
        ) : (
          <div className="flex items-center gap-6 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic">NODE_SYNCED</span>
                <span className="text-xs font-mono font-black text-white">{user.web3Address.slice(0, 6)}...{user.web3Address.slice(-4)}</span>
             </div>
             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,1)]"></div>
          </div>
        )}

        <div 
          className="hidden md:flex items-center gap-6 bg-slate-900/60 border border-white/10 px-8 py-4 rounded-3xl shadow-inner group cursor-pointer hover:border-indigo-500/40 transition-all select-none active:scale-95" 
          onClick={handleVaultInteraction}
          onDoubleClick={handleVaultDoubleClick}
        >
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em] italic group-hover:text-indigo-400 transition-colors">Total_Liquidity</span>
            <span className="text-2xl font-mono font-black text-white tracking-tighter italic group-hover:text-indigo-400 transition-colors">${user.wallet.balanceUsd.toLocaleString()}</span>
          </div>
        </div>

        <button 
           onClick={() => onNavigate('SETTINGS')}
           className="w-16 h-16 rounded-[1.5rem] bg-slate-900 border border-white/10 flex items-center justify-center hover:border-indigo-500 transition-all overflow-hidden group shadow-2xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-purple-900/40 group-hover:scale-110 transition-transform"></div>
          <span className="text-2xl font-black text-white z-10 italic uppercase">{user.email?.[0] || 'U'}</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
