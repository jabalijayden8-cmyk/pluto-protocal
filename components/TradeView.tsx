
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, CryptoData, Transaction } from '../types';
import { MOCK_CRYPTOS, MOCK_EXCHANGES } from '../constants';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Brush } from 'recharts';

interface TradeViewProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  addNotification: (title: string, message: string, type: 'EMAIL' | 'SMS' | 'SYSTEM') => void;
}

const TradeView: React.FC<TradeViewProps> = ({ user, setUser, addNotification }) => {
  const [cryptos, setCryptos] = useState<CryptoData[]>(MOCK_CRYPTOS);
  const [mode, setMode] = useState<'TRADE' | 'SWAP'>('TRADE');
  const [selectedCryptoId, setSelectedCryptoId] = useState<string>(MOCK_CRYPTOS[0].id);
  const [selectedExchange, setSelectedExchange] = useState(MOCK_EXCHANGES[3]); 
  const [amount, setAmount] = useState('');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [isRouting, setIsRouting] = useState(false);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '1M' | '1Y'>('24H');

  const [swapFromId, setSwapFromId] = useState<string>('bitcoin');
  const [swapToId, setSwapToId] = useState<string>('ethereum');
  const [swapAmount, setSwapAmount] = useState('');

  const selectedCrypto = cryptos.find(c => c.id === selectedCryptoId) || cryptos[0];
  const swapFrom = cryptos.find(c => c.id === swapFromId) || cryptos[0];
  const swapTo = cryptos.find(c => c.id === swapToId) || cryptos[1];

  const chartData = useMemo(() => {
    const points = timeframe === '1H' ? 60 : timeframe === '24H' ? 24 : timeframe === '7D' ? 70 : 100;
    const basePrice = selectedCrypto.price;
    const volatility = 0.02;
    
    return Array.from({ length: points }).map((_, i) => {
      const time = new Date();
      if (timeframe === '1H') time.setMinutes(time.getMinutes() - (points - i));
      else if (timeframe === '24H') time.setHours(time.getHours() - (points - i));
      else time.setDate(time.getDate() - (points - i));

      return {
        time: timeframe === '1H' ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : time.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        price: basePrice * (1 + (Math.random() - 0.5) * volatility + (Math.sin(i / 5) * 0.01)),
      };
    });
  }, [selectedCrypto.id, timeframe, selectedCrypto.price]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCryptos(prev => prev.map(c => {
        const change = (Math.random() - 0.5) * (c.price * 0.0008);
        if (c.id === selectedCryptoId) {
          setPriceFlash(change > 0 ? 'up' : 'down');
          setTimeout(() => setPriceFlash(null), 800);
        }
        return { ...c, price: c.price + change };
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, [selectedCryptoId]);

  const handleTrade = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    const cost = numAmount * selectedCrypto.price;
    setIsRouting(true);
    
    setTimeout(() => {
      const txId = `TX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const newTx: Transaction = {
        id: txId,
        type: tradeType === 'BUY' ? 'RECEIVE' : 'SEND',
        asset: selectedCrypto.symbol,
        amount: numAmount,
        status: 'COMPLETED',
        timestamp: Date.now(),
        custodyNode: `DEX-${selectedExchange.id.toUpperCase()}`
      };

      if (tradeType === 'BUY') {
        if (user.wallet.balanceUsd < cost) {
          alert('Error: Insufficient USD Liquidity.');
          setIsRouting(false);
          return;
        }
        const updatedAssets = [...user.wallet.assets];
        const existing = updatedAssets.find(a => a.symbol === selectedCrypto.symbol);
        if (existing) existing.amount += numAmount;
        else updatedAssets.push({ symbol: selectedCrypto.symbol, amount: numAmount });
        
        setUser({ 
          ...user, 
          wallet: { ...user.wallet, balanceUsd: user.wallet.balanceUsd - cost, assets: updatedAssets },
          transactions: [newTx, ...user.transactions]
        });
        addNotification('Trade Receipt', `Purchase of ${numAmount} ${selectedCrypto.symbol} confirmed. Settlement receipt sent to your email.`, 'EMAIL');
      } else {
        const asset = user.wallet.assets.find(a => a.symbol === selectedCrypto.symbol);
        if (!asset || asset.amount < numAmount) {
          alert(`Error: Insufficient ${selectedCrypto.symbol} for order.`);
          setIsRouting(false);
          return;
        }
        const updatedAssets = user.wallet.assets.map(a => 
          a.symbol === selectedCrypto.symbol ? { ...a, amount: a.amount - numAmount } : a
        ).filter(a => a.amount > 0);
        
        setUser({ 
          ...user, 
          wallet: { ...user.wallet, balanceUsd: user.wallet.balanceUsd + cost, assets: updatedAssets },
          transactions: [newTx, ...user.transactions]
        });
        addNotification('Trade Receipt', `Sale of ${numAmount} ${selectedCrypto.symbol} confirmed. Funds settled to USD. Receipt sent to your email.`, 'EMAIL');
      }
      setAmount('');
      setIsRouting(false);
    }, 2000);
  };

  const handleSwap = () => {
    const numAmount = parseFloat(swapAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    
    const userAssetFrom = user.wallet.assets.find(a => a.symbol === swapFrom.symbol);
    if (!userAssetFrom || userAssetFrom.amount < numAmount) {
      alert(`Error: Insufficient ${swapFrom.symbol} balance.`);
      return;
    }

    setIsRouting(true);
    setTimeout(() => {
      const exchangeRate = swapFrom.price / swapTo.price;
      const receiveAmount = numAmount * exchangeRate;
      
      const txId = `SWAP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const newTx: Transaction = {
        id: txId,
        type: 'SEND',
        asset: `${swapFrom.symbol}→${swapTo.symbol}`,
        amount: numAmount,
        status: 'COMPLETED',
        timestamp: Date.now(),
        custodyNode: 'PLUTO-SWAP-BRIDGE'
      };

      let newAssets = user.wallet.assets.map(a => 
        a.symbol === swapFrom.symbol ? { ...a, amount: a.amount - numAmount } : a
      );
      
      const existingTo = newAssets.find(a => a.symbol === swapTo.symbol);
      if (existingTo) {
        newAssets = newAssets.map(a => a.symbol === swapTo.symbol ? { ...a, amount: a.amount + receiveAmount } : a);
      } else {
        newAssets.push({ symbol: swapTo.symbol, amount: receiveAmount });
      }

      setUser({ 
        ...user, 
        wallet: { ...user.wallet, assets: newAssets.filter(a => a.amount > 0) },
        transactions: [newTx, ...user.transactions]
      });
      addNotification('Swap Confirmation', `Successfully converted ${numAmount} ${swapFrom.symbol} to ${receiveAmount.toFixed(4)} ${swapTo.symbol}. Notification sent to email.`, 'EMAIL');
      setSwapAmount('');
      setIsRouting(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen animate-in fade-in duration-1000 pb-24 relative space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-slate-800/50 pb-12">
        <div>
          <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic leading-none">Execution_Desk</h1>
          <p className="text-slate-500 text-xl font-medium mt-3">Active Simulation Terminal for Effective Asset Testing.</p>
        </div>
        <div className="flex bg-slate-900/40 p-2 rounded-[2.5rem] border border-white/5">
           {(['TRADE', 'SWAP'] as const).map(m => (
             <button key={m} onClick={() => setMode(m)} className={`px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest italic transition-all ${mode === m ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-600 hover:text-slate-300'}`}>
               {m}
             </button>
           ))}
        </div>
      </header>

      {mode === 'TRADE' ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
          <div className="xl:col-span-3 space-y-12">
            <div className="bg-slate-900/40 border border-slate-800/50 rounded-[4rem] p-12 relative overflow-hidden backdrop-blur-3xl shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                 <div className="flex items-center gap-10">
                    <div className="w-24 h-24 bg-black border border-white/10 rounded-3xl flex items-center justify-center text-6xl font-black text-indigo-400 italic shadow-inner">
                       {selectedCrypto.symbol[0]}
                    </div>
                    <div>
                       <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">{selectedCrypto.name}</h2>
                       <p className={`text-4xl font-mono font-black mt-3 transition-all ${priceFlash === 'up' ? 'text-emerald-400' : priceFlash === 'down' ? 'text-rose-400' : 'text-white'}`}>
                         ${selectedCrypto.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </p>
                    </div>
                 </div>
                 
                 <div className="flex flex-col items-end gap-4">
                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                      {(['1H', '24H', '7D', '1M', '1Y'] as const).map(tf => (
                        <button key={tf} onClick={() => setTimeframe(tf)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${timeframe === tf ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-400'}`}>{tf}</button>
                      ))}
                    </div>
                    <div className="px-6 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[10px] font-black text-indigo-400 uppercase italic tracking-widest">
                       Routing: {selectedExchange.name}
                    </div>
                 </div>
              </div>

              <div className="h-[450px] w-full bg-black/60 rounded-[3rem] border border-white/5 relative group p-6 overflow-hidden">
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" hide />
                      <YAxis domain={['auto', 'auto']} orientation="right" tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '1rem', color: '#fff' }} itemStyle={{ color: '#818cf8', fontWeight: 900 }} labelStyle={{ color: '#64748b', fontSize: 10, marginBottom: 4 }}/>
                      <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorPrice)" animationDuration={1500}/>
                      <Brush dataKey="time" height={30} stroke="#1e293b" fill="#020617" travellerWidth={10}/>
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-slate-900/40 border border-slate-800/50 p-10 rounded-[3rem]">
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white italic mb-8">Asset_Matrix</h3>
                  <div className="grid grid-cols-2 gap-4">
                     {cryptos.map(c => (
                       <button key={c.id} onClick={() => setSelectedCryptoId(c.id)} className={`px-6 py-4 rounded-2xl border transition-all ${selectedCryptoId === c.id ? 'bg-white border-white' : 'bg-black/40 border-white/5 hover:border-indigo-500'}`}>
                          <p className={`text-[10px] font-black uppercase ${selectedCryptoId === c.id ? 'text-slate-950' : 'text-slate-500'}`}>{c.symbol}</p>
                       </button>
                     ))}
                  </div>
               </div>
               <div className="bg-slate-900/40 border border-slate-800/50 p-10 rounded-[3rem]">
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white italic mb-8">Profit_Pulse</h3>
                  <div className="p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-[2rem]">
                     <p className="text-[10px] text-slate-600 font-black uppercase mb-2">Projected 24h Yield</p>
                     <p className="text-4xl font-black italic tracking-tighter text-white">${((parseFloat(amount) || 0) * selectedCrypto.price * (selectedCrypto.change24h / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
               </div>
            </div>
          </div>
          <div className="space-y-12">
            <div className="bg-slate-900/60 border border-slate-800/50 rounded-[4rem] p-12 shadow-2xl relative overflow-hidden backdrop-blur-3xl border-t-white/10">
              {isRouting && (
                <div className="absolute inset-0 bg-black/98 backdrop-blur-[60px] z-[80] flex flex-col items-center justify-center space-y-10">
                   <div className="w-24 h-24 border-[6px] border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                   <p className="text-indigo-400 font-black text-xl uppercase tracking-[0.6em] animate-pulse">Execution_Ready</p>
                </div>
              )}
              <div className="flex bg-black/50 p-2.5 rounded-[2.5rem] gap-3 mb-12 shadow-inner">
                {(['BUY', 'SELL'] as const).map(t => (
                  <button key={t} onClick={() => setTradeType(t)} className={`flex-1 py-5 rounded-[2rem] font-black text-xs uppercase transition-all italic ${tradeType === t ? (t === 'BUY' ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white') : 'text-slate-600 hover:text-white'}`}>{t}</button>
                ))}
              </div>
              <div className="space-y-10">
                <div className="space-y-6">
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Magnitude</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-black/70 border border-white/10 rounded-[2.5rem] px-10 py-10 text-6xl font-mono font-black text-white focus:outline-none placeholder:text-slate-900"/>
                </div>
                <div className="p-10 bg-black/80 rounded-[3.5rem] border border-white/5 space-y-6">
                   <div className="flex justify-between items-center text-[11px] font-black text-slate-600 uppercase">
                      <span>Rate</span>
                      <span className="text-white font-mono font-bold">${selectedCrypto.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                   </div>
                   <div className="pt-6 border-t border-white/5">
                      <p className="text-[10px] text-slate-600 font-black uppercase mb-2">Total Exposure</p>
                      <p className="text-4xl font-mono font-black text-white italic">${((parseFloat(amount) || 0) * selectedCrypto.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                   </div>
                </div>
                <button onClick={handleTrade} className={`w-full py-10 rounded-[3rem] font-black text-2xl uppercase tracking-[0.5em] italic ${tradeType === 'BUY' ? 'bg-white text-slate-950 shadow-white/10' : 'bg-rose-600 text-white shadow-rose-600/20'}`}>Establish_Order</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-700">
           <div className="bg-slate-900/40 border border-slate-800/50 rounded-[5rem] p-20 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
              {isRouting && (
                <div className="absolute inset-0 bg-black/98 backdrop-blur-[80px] z-[80] flex flex-col items-center justify-center space-y-12">
                   <div className="w-48 h-48 border-[10px] border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                   <p className="text-indigo-400 font-black text-3xl uppercase tracking-[1em] animate-pulse">Swapping</p>
                </div>
              )}
              <div className="space-y-16">
                 <div className="space-y-6">
                    <label className="text-[11px] font-black text-slate-500 uppercase px-6">Convert From</label>
                    <div className="bg-black/60 rounded-[3rem] p-10 flex items-center gap-10 border border-white/5">
                       <select value={swapFromId} onChange={(e) => setSwapFromId(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-black uppercase text-xl appearance-none min-w-[180px]">
                          {cryptos.map(c => <option key={c.id} value={c.id}>{c.symbol}</option>)}
                       </select>
                       <input type="number" value={swapAmount} onChange={(e) => setSwapAmount(e.target.value)} placeholder="0.00" className="flex-1 bg-transparent text-6xl font-mono font-black text-white focus:outline-none placeholder:text-slate-900"/>
                    </div>
                 </div>
                 <div className="flex justify-center -my-10 relative z-10">
                    <button onClick={() => { const temp = swapFromId; setSwapFromId(swapToId); setSwapToId(temp); }} className="w-24 h-24 bg-indigo-600 text-white rounded-[2rem] border-4 border-[#030712] flex items-center justify-center hover:scale-110 transition-all shadow-2xl">
                       <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                    </button>
                 </div>
                 <div className="space-y-6">
                    <label className="text-[11px] font-black text-slate-500 uppercase px-6">Receive To</label>
                    <div className="bg-black/60 rounded-[3rem] p-10 flex items-center gap-10 border border-white/5">
                       <select value={swapToId} onChange={(e) => setSwapToId(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-black uppercase text-xl appearance-none min-w-[180px]">
                          {cryptos.map(c => <option key={c.id} value={c.id}>{c.symbol}</option>)}
                       </select>
                       <div className="flex-1 text-6xl font-mono font-black text-indigo-400 italic">
                          {(parseFloat(swapAmount) * (swapFrom.price / swapTo.price) || 0).toFixed(6)}
                       </div>
                    </div>
                 </div>
                 <button onClick={handleSwap} className="w-full py-12 bg-white text-slate-950 rounded-[4rem] font-black text-2xl uppercase tracking-[0.6em] italic shadow-2xl">Confirm_Swap_Simulation</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TradeView;
