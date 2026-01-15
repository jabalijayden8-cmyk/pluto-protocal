
import React, { useState, useEffect } from 'react';

interface WalletProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'Injected' | 'Mobile' | 'Hardware' | 'Manual';
}

const PROVIDERS: WalletProvider[] = [
  { id: 'metamask', name: 'MetaMask', icon: '🦊', color: 'bg-orange-500', type: 'Injected' },
  { id: 'coinbase', name: 'Coinbase', icon: '🔵', color: 'bg-blue-600', type: 'Injected' },
  { id: 'phantom', name: 'Phantom', icon: '👻', color: 'bg-purple-500', type: 'Injected' },
  { id: 'trust', name: 'Trust Wallet', icon: '🛡️', color: 'bg-blue-400', type: 'Mobile' },
  { id: 'ledger', name: 'Ledger', icon: '📟', color: 'bg-slate-700', type: 'Hardware' },
];

interface WalletSelectorProps {
  onSelect: (providerId: string, address?: string) => void;
  onClose: () => void;
}

const WalletSelector: React.FC<WalletSelectorProps> = ({ onSelect, onClose }) => {
  const [view, setView] = useState<'LIST' | 'SCAN' | 'MANUAL'>('LIST');
  const [manualAddress, setManualAddress] = useState('');
  const [manualProvider, setManualProvider] = useState('Custom Node');
  const [isScanning, setIsScanning] = useState(false);
  const [scanPulse, setScanPulse] = useState(0);

  useEffect(() => {
    if (view === 'SCAN') {
      const interval = setInterval(() => setScanPulse(p => (p + 1) % 100), 50);
      return () => clearInterval(interval);
    }
  }, [view]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualAddress.length < 20) return;
    onSelect(manualProvider, manualAddress);
  };

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const mockAddr = '0x' + Math.random().toString(16).slice(2, 42);
      onSelect('Scanned Mobile', mockAddr);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-xl bg-slate-950 border border-white/10 rounded-[4rem] overflow-hidden shadow-[0_0_150px_rgba(79,70,229,0.3)] animate-in zoom-in-95 duration-500">
        <div className="p-12 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
          <div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">
              {view === 'LIST' ? 'Vault_Link' : view === 'SCAN' ? 'Node_Scanner' : 'Manual_Config'}
            </h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-1 italic">
              {view === 'LIST' ? 'Authorize Inbound Handshake' : view === 'SCAN' ? 'Optical Identity Discovery' : 'Direct Address Provisioning'}
            </p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-all">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-12">
          {view === 'LIST' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                {PROVIDERS.map((p) => (
                  <button 
                    key={p.id} 
                    onClick={() => onSelect(p.id)}
                    className="p-8 bg-slate-900/60 border border-white/5 rounded-[2.5rem] flex flex-col items-center gap-5 hover:border-indigo-500 hover:bg-slate-900 transition-all group shadow-xl"
                  >
                    <div className={`w-16 h-16 ${p.color} rounded-[1.25rem] flex items-center justify-center text-4xl shadow-2xl group-hover:scale-110 transition-transform`}>
                      {p.icon}
                    </div>
                    <div className="text-center">
                      <p className="text-base font-black text-white uppercase italic tracking-tighter">{p.name}</p>
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{p.type}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                  onClick={() => setView('SCAN')}
                  className="flex items-center justify-center gap-4 p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] hover:bg-indigo-600/20 transition-all group"
                 >
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    <span className="text-xs font-black text-white uppercase italic tracking-widest">Scan_Wallet</span>
                 </button>
                 <button 
                  onClick={() => setView('MANUAL')}
                  className="flex items-center justify-center gap-4 p-6 bg-slate-900 border border-white/5 rounded-[2rem] hover:bg-slate-800 transition-all group"
                 >
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    <span className="text-xs font-black text-white uppercase italic tracking-widest">Manual_Entry</span>
                 </button>
              </div>
            </div>
          )}

          {view === 'SCAN' && (
            <div className="space-y-10 py-6 text-center animate-in slide-in-from-bottom-4">
              <div className="relative mx-auto w-80 h-80 bg-black border-4 border-indigo-500/30 rounded-[3rem] overflow-hidden group shadow-[0_0_80px_rgba(79,70,229,0.2)]">
                {/* Mock Camera Feed UI */}
                <div className="absolute inset-0 opacity-40 bg-[url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3NueXJ1czJvbnN3NHN6bWsyYTh5Mml4dzBmaWc2ZzM3bHFwN2p6eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSjP87G7gUqY3y/giphy.gif')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-indigo-500/10 backdrop-blur-[2px]"></div>
                
                {/* Scanning Laser */}
                <div 
                  className="absolute left-0 right-0 h-1 bg-indigo-400 shadow-[0_0_20px_rgba(129,140,248,1)] z-20"
                  style={{ top: `${scanPulse}%` }}
                ></div>

                <div className="absolute inset-10 border-2 border-indigo-500/40 border-dashed rounded-[2rem] animate-pulse"></div>

                {isScanning && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-indigo-400 font-mono text-[10px] uppercase font-black tracking-widest">Resolving_Address...</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto italic uppercase tracking-widest leading-relaxed">
                  Position your wallet's QR code within the protocol frame for optical verification.
                </p>
                <div className="flex gap-4">
                   <button onClick={() => setView('LIST')} className="flex-1 py-5 bg-slate-900 text-slate-500 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest italic">Cancel</button>
                   <button onClick={simulateScan} className="flex-[2] py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.4em] italic shadow-2xl hover:bg-indigo-500">Capture_Signal</button>
                </div>
              </div>
            </div>
          )}

          {view === 'MANUAL' && (
            <div className="animate-in slide-in-from-right-4">
               <form onSubmit={handleManualSubmit} className="space-y-10">
                  <div className="space-y-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-4 italic">Provider Alias</label>
                        <input 
                           type="text" 
                           value={manualProvider} 
                           onChange={(e) => setManualProvider(e.target.value)}
                           className="w-full bg-black border border-white/5 rounded-2xl p-6 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 transition-all"
                           placeholder="Institutional_Wallet_v1"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-4 italic">Public Address Hash</label>
                        <textarea 
                           value={manualAddress} 
                           onChange={(e) => setManualAddress(e.target.value)}
                           className="w-full bg-black border border-white/5 rounded-2xl p-6 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 transition-all h-32 resize-none"
                           placeholder="0x..."
                        />
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <button type="button" onClick={() => setView('LIST')} className="flex-1 py-6 bg-slate-900 text-slate-500 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest italic">Abort</button>
                     <button type="submit" className="flex-[2] py-6 bg-white text-slate-950 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.4em] italic shadow-2xl hover:bg-indigo-50 active:scale-95">Link_Identity_Node</button>
                  </div>
               </form>
            </div>
          )}
        </div>
        
        <div className="p-10 bg-black/40 text-center border-t border-white/5">
           <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.8em] italic">
             PLUTO_SECURE_TUNNEL_ESTABLISHED
           </p>
        </div>
      </div>
    </div>
  );
};

export default WalletSelector;
