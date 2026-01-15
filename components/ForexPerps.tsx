
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile, ForexPair, Transaction } from '../types';
import { MOCK_FOREX } from '../constants';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ForexPerpsProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  addNotification: (title: string, message: string, type: 'EMAIL' | 'SMS' | 'SYSTEM') => void;
}

const ForexPerps: React.FC<ForexPerpsProps> = ({ user, setUser, addNotification }) => {
  const [pairs, setPairs] = useState<ForexPair[]>(MOCK_FOREX);
  const [selectedPairId, setSelectedPairId] = useState(MOCK_FOREX[0].id);
  const [leverage, setLeverage] = useState(50);
  const [size, setSize] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ id: string, sender: string, text: string, type: 'PEER' | 'ADMIN' }[]>([
    { id: '1', sender: 'PEER_772', text: 'EUR/USD long at 1.0841. Funding is juicy.', type: 'PEER' },
    { id: '2', sender: 'WHALE_01', text: 'USD/JPY breakout imminent. 151.00 target.', type: 'PEER' },
    { id: '3', sender: 'SYSTEM', text: 'Global Shard Sharding v4.2 Active.', type: 'ADMIN' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedPair = pairs.find(p => p.id === selectedPairId) || pairs[0];

  // Tick simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPairs(prev => prev.map(p => ({
        ...p,
        price: p.price + (Math.random() - 0.5) * (p.price * 0.0001)
      })));

      // Random bot messages
      if (Math.random() > 0.9) {
        const senders = ['PEER_ALPHA', 'QUANT_NODE', 'MPC_SIGNER', 'WHALE_X'];
        const phrases = ['Liquidated a short on GBP.', 'Funding rates converging...', '200x on AUD? Madman.', 'Market efficiency at 99%.'];
        setChatMessages(prev => [
           ...prev.slice(-20),
           { id: Date.now().toString(), sender: senders[Math.floor(Math.random() * senders.length)], text: phrases[Math.floor(Math.random() * phrases.length)], type: 'PEER' }
        ]);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const chartData = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      time: i,
      val: selectedPair.price * (1 + (Math.random() - 0.5) * 0.0005)
    }));
  }, [selectedPairId, selectedPair.price]);

  const handleOrder = (type: 'LONG' | 'SHORT') => {
    const numSize = parseFloat(size);
    if (isNaN(numSize) || numSize <= 0) return;
    
    const requiredMargin = numSize / leverage;
    if (user.wallet.balanceUsd < requiredMargin) {
      alert("Insufficient Institutional Margin.");
      return;
    }

    setIsExecuting(true);
    setTimeout(() => {
      const txId = `PERP-${Date.now().toString(36).toUpperCase()}`;
      const newTx: Transaction = {
        id: txId,
        type: type === 'LONG' ? 'LONG' : 'SHORT',
        asset: selectedPair.symbol,
        amount: numSize,
        status: 'COMPLETED',
        timestamp: Date.now(),
        leverage: leverage,
        custodyNode: 'FOREX_MPC_BRIDGE'
      };

      setUser({
        ...user,
        wallet: { ...user.wallet, balanceUsd: user.wallet.balanceUsd - requiredMargin },
        transactions: [newTx, ...user.transactions]
      });

      addNotification('Order Executed', `${type} position opened for ${selectedPair.symbol} @ ${selectedPair.price.toFixed(5)}`, 'SYSTEM');
      setIsExecuting(false);
      setSize('');
    }, 1200);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ME', text: chatInput, type: 'PEER' }]);
    setChatInput('');
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-24">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-slate-800 pb-12">
        <div>
          <div className="flex items-center gap-4 mb-4">
             <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">
                Forex_Perpetuals_v4
             </div>
             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase italic leading-none">Global_FX_Shard</h1>
          <p className="text-slate-500 text-xl font-medium mt-3 italic border-l-2 border-slate-800 pl-6">High-frequency forex perpetuals with institutional liquidity discovery.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
           {pairs.map(p => (
             <button 
               key={p.id} 
               onClick={() => setSelectedPairId(p.id)}
               className={`p-6 rounded-[2rem] border transition-all text-left group ${selectedPairId === p.id ? 'bg-indigo-600 border-indigo-500 shadow-2xl' : 'bg-slate-900/40 border-slate-800/60 hover:border-indigo-500/50'}`}
             >
                <p className={`text-[10px] font-black uppercase tracking-widest ${selectedPairId === p.id ? 'text-indigo-200' : 'text-slate-600'}`}>{p.symbol}</p>
                <p className="text-xl font-black text-white italic tracking-tighter mt-1">{p.price.toFixed(4)}</p>
                <p className={`text-[9px] font-black mt-2 ${p.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                   {p.change24h > 0 ? '+' : ''}{p.change24h}%
                </p>
             </button>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        {/* Execution Hub */}
        <div className="xl:col-span-3 space-y-8">
           <div className="bg-slate-900/40 border border-slate-800/60 rounded-[3.5rem] p-10 shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
              {isExecuting && (
                <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center space-y-6">
                   <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                   <p className="text-indigo-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Broadcasting_Order</p>
                </div>
              )}
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-10 italic">Execution_Console</h3>
              
              <div className="space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest px-4">Position Magnitude</label>
                    <div className="relative">
                       <input 
                         type="number" 
                         value={size} 
                         onChange={(e) => setSize(e.target.value)}
                         placeholder="0.00" 
                         className="w-full bg-black/60 border border-white/5 rounded-[2rem] p-8 text-4xl font-mono font-black text-white focus:outline-none placeholder:text-slate-900"
                       />
                       <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700 font-black italic">USD</span>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex justify-between items-center px-4">
                       <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">Leverage: {leverage}x</label>
                       <span className="text-[9px] text-indigo-400 font-black">MAX: 200x</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="200" 
                      value={leverage} 
                      onChange={(e) => setLeverage(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                 </div>

                 <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-4">
                    <div className="flex justify-between text-[10px] font-black">
                       <span className="text-slate-600 uppercase">Margin Required</span>
                       <span className="text-white">${(parseFloat(size) / leverage || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black">
                       <span className="text-slate-600 uppercase">Funding Rate</span>
                       <span className="text-emerald-400 font-mono">{(selectedPair.fundingRate * 100).toFixed(4)}%</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleOrder('LONG')} className="py-8 bg-emerald-600 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl italic active:scale-95 shadow-emerald-500/20">Long</button>
                    <button onClick={() => handleOrder('SHORT')} className="py-8 bg-rose-600 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest hover:bg-rose-500 transition-all shadow-xl italic active:scale-95 shadow-rose-500/20">Short</button>
                 </div>
              </div>
           </div>
        </div>

        {/* Real-time Chart Hub */}
        <div className="xl:col-span-6 space-y-10">
           <div className="bg-slate-900/40 border border-slate-800/60 rounded-[4rem] p-12 shadow-2xl h-[650px] flex flex-col backdrop-blur-3xl relative overflow-hidden group">
              <div className="absolute top-10 right-10 flex items-center gap-6">
                 <div className="flex flex-col items-end">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Mark_Price</p>
                    <p className="text-3xl font-black text-white italic tracking-tighter">{selectedPair.price.toFixed(5)}</p>
                 </div>
                 <div className="h-12 w-px bg-slate-800"></div>
                 <div className="flex flex-col items-end">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">24H High</p>
                    <p className="text-xl font-black text-slate-300 italic tracking-tighter">{(selectedPair.price * 1.02).toFixed(4)}</p>
                 </div>
              </div>

              <div className="flex-1 mt-12 relative">
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="perpGrad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                             <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="time" hide />
                       <YAxis domain={['auto', 'auto']} hide />
                       <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '1.5rem', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }} itemStyle={{ color: '#818cf8', fontWeight: 900 }} labelStyle={{ display: 'none' }} />
                       <Area type="step" dataKey="val" stroke="#818cf8" strokeWidth={6} fill="url(#perpGrad)" animationDuration={1000} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-800/50 flex justify-between items-center opacity-40">
                 <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.6em] italic">Real-Time Aggregation • Shard: FX-NORTH-01</p>
                 <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse delay-150"></div>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900/20 border border-slate-800/60 rounded-[3.5rem] overflow-hidden shadow-2xl">
              <div className="px-10 py-6 border-b border-slate-800/50 bg-slate-950/40">
                 <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Open_Positions</h4>
              </div>
              <div className="p-10 text-center text-slate-700 font-black uppercase text-[10px] tracking-widest italic py-20">
                 No active perpetual shards detected in current session.
              </div>
           </div>
        </div>

        {/* Global Shard Chat (Trollbox) */}
        <div className="xl:col-span-3">
           <div className="bg-slate-900/60 border border-slate-800/60 rounded-[4rem] h-[850px] flex flex-col shadow-2xl backdrop-blur-3xl overflow-hidden group">
              <div className="p-8 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                 <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Shard_Trollbox</h3>
                    <p className="text-[8px] text-slate-700 font-black uppercase tracking-[0.4em] mt-1 italic">Real-time Peer Handshake</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">342 Peers</span>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                 {chatMessages.map((msg) => (
                    <div key={msg.id} className="space-y-1.5 animate-in slide-in-from-right-4 duration-300">
                       <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black uppercase tracking-widest ${msg.type === 'ADMIN' ? 'text-indigo-400' : 'text-slate-600'}`}>
                             {msg.sender}
                          </span>
                       </div>
                       <div className={`p-4 rounded-2xl text-[11px] leading-relaxed font-medium ${msg.type === 'ADMIN' ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 italic' : 'bg-black/40 border border-white/5 text-slate-400 italic'}`}>
                          {msg.text}
                       </div>
                    </div>
                 ))}
                 <div ref={chatEndRef} />
              </div>

              <div className="p-8 border-t border-slate-800 bg-slate-950/60">
                 <div className="relative group">
                    <input 
                       type="text"
                       value={chatInput}
                       onChange={(e) => setChatInput(e.target.value)}
                       onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                       placeholder="Broadcast signal..."
                       className="w-full bg-black border border-white/5 rounded-[1.5rem] px-6 py-5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono italic"
                    />
                    <button 
                       onClick={handleSendChat}
                       className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all"
                    >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7"/></svg>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ForexPerps;
