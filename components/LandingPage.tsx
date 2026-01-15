
import React, { useState, useEffect } from 'react';
import { UserRole, AuthMethod } from '../types';

interface LandingPageProps {
  onStart: (role: UserRole, method: AuthMethod, initialData?: string) => void;
  onAdminSecret: () => void;
  onOpenExplorer?: (query?: string) => void;
  isPublished?: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onAdminSecret, onOpenExplorer, isPublished }) => {
  const [stats, setStats] = useState({ nodes: 14209, tvl: 892.4, blocks: 19442012 });
  const [quickInput, setQuickInput] = useState('');
  const [secretCount, setSecretCount] = useState(0);
  const [qrActive, setQrActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        tvl: prev.tvl + (Math.random() - 0.4) * 0.01,
        blocks: prev.blocks + 1
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogoClick = () => {
    const nextCount = secretCount + 1;
    setSecretCount(nextCount);
    if (nextCount >= 5) {
      onAdminSecret();
      setSecretCount(0);
    }
    const timer = setTimeout(() => setSecretCount(0), 2000);
    return () => clearTimeout(timer);
  };

  const handleQRClick = () => {
    // Instant Handshake for testing purposes
    onStart(UserRole.USER, AuthMethod.EMAIL, 'test.peer@pluto.network');
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    // Detection logic for unified input
    const isEmail = quickInput.includes('@');
    const method = isEmail ? AuthMethod.EMAIL : AuthMethod.PHONE;
    onStart(UserRole.USER, method, quickInput);
  };

  // Generate a mock QR grid
  const QRGrid = () => (
    <div className="w-full h-full grid grid-cols-6 grid-rows-6 gap-0.5 p-1 bg-white rounded-lg">
      {Array.from({ length: 36 }).map((_, i) => {
        // Create corners and random noise
        const isCorner = (i === 0 || i === 1 || i === 6 || i === 7) || // Top Left
                         (i === 4 || i === 5 || i === 10 || i === 11) || // Top Right
                         (i === 24 || i === 25 || i === 30 || i === 31); // Bottom Left
        const rand = Math.random() > 0.4;
        return (
          <div 
            key={i} 
            className={`rounded-[1px] transition-all duration-500 ${isCorner || rand ? 'bg-slate-950' : 'bg-transparent'}`}
          ></div>
        );
      })}
    </div>
  );

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden bg-[#030712]">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.06),transparent_50%)] pointer-events-none"></div>
      
      {/* Network Header */}
      <div className="absolute top-12 left-0 right-0 flex justify-center px-6">
        <div className="flex items-center gap-8 bg-slate-900/40 backdrop-blur-3xl border border-white/5 px-10 py-3 rounded-full shadow-2xl max-w-4xl w-full justify-between">
           <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mainnet:</span>
                 <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">L-1_Optimal</span>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TVL:</span>
                 <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">${stats.tvl.toFixed(1)}B</span>
              </div>
           </div>
           
           <div className="flex items-center gap-6">
              <button 
                onClick={() => onStart(UserRole.USER, AuthMethod.EMAIL)}
                className="text-[10px] font-black text-white hover:text-indigo-400 transition-colors uppercase tracking-[0.3em] italic"
              >
                Sign_In
              </button>
              <div className="w-px h-4 bg-slate-800"></div>
              <button 
                onClick={() => onStart(UserRole.USER, AuthMethod.EMAIL)}
                className="px-6 py-2 bg-white text-slate-950 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all italic"
              >
                Join
              </button>
           </div>
        </div>
      </div>

      <div className="z-10 max-w-5xl w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-20">
        <div className="flex justify-center items-center gap-8">
          <button 
            onClick={handleLogoClick}
            className={`w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_80px_rgba(99,102,241,0.4)] hover:scale-105 transition-all duration-500 border border-white/10 relative overflow-hidden group active:scale-95`}
          >
            <span className="text-5xl font-black text-white italic relative z-10 select-none">P</span>
          </button>

          {/* Interactive Test QR Code */}
          <div className="relative group">
             <button 
                onClick={handleQRClick}
                onMouseEnter={() => setQrActive(true)}
                onMouseLeave={() => setQrActive(false)}
                className="w-24 h-24 bg-white/5 border border-white/10 p-2.5 rounded-[2rem] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-500 shadow-2xl relative overflow-hidden active:scale-95"
             >
                <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                <QRGrid />
                
                {/* Scan Line Animation */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,1)] z-20 animate-[scan_2s_ease-in-out_infinite]"></div>
             </button>
             
             {/* Tooltip */}
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-4 py-2 rounded-xl text-[9px] font-black text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-2xl">
                Test_Instant_Handshake_✓
             </div>
          </div>
        </div>
        
        <div className="relative inline-block">
          <h1 className="text-8xl md:text-[11rem] font-black tracking-tighter text-white leading-none selection:bg-indigo-500 px-4 uppercase italic">
            PLUTO
          </h1>
          <div className="h-1.5 w-32 bg-indigo-600 mx-auto rounded-full mt-6 shadow-[0_0_20px_rgba(79,70,229,1)]"></div>
        </div>

        <p className="text-slate-500 text-xl font-medium tracking-tight max-w-2xl mx-auto leading-relaxed">
           Institutional liquidity aggregation and secure MPC custody. 
           <span className="block text-indigo-400 font-bold uppercase text-xs tracking-[0.4em] mt-3 italic">Sync your node to the global index</span>
        </p>

        {/* Unified Sign-Up/Login Terminal */}
        <div className="space-y-6">
          <div className="max-w-xl mx-auto w-full bg-slate-900/30 backdrop-blur-3xl border border-white/5 p-2 rounded-[2.5rem] shadow-2xl group focus-within:border-indigo-500/50 transition-all border-t-white/10">
            <form onSubmit={handleQuickSubmit} className="flex flex-col md:flex-row gap-2">
              <input 
                type="text"
                placeholder="Email or Mobile Number..."
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                className="flex-1 bg-transparent px-8 py-6 text-xl text-white focus:outline-none placeholder:text-slate-700 font-medium"
              />
              <button 
                type="submit"
                className="px-12 py-6 bg-white text-slate-950 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 italic shadow-xl"
              >
                Get Started
              </button>
            </form>
          </div>
          
          <div className="flex items-center justify-center gap-4">
             <span className="text-slate-700 text-[10px] font-black uppercase tracking-widest">Already a peer?</span>
             <button 
                onClick={() => onStart(UserRole.USER, AuthMethod.EMAIL)}
                className="text-indigo-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em] italic underline underline-offset-8"
             >
               Sign In to Node
             </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
          <button 
            onClick={() => onStart(UserRole.USER, AuthMethod.GOOGLE)}
            className="w-full sm:w-80 px-10 py-6 bg-slate-950 border border-slate-800 text-white rounded-[1.75rem] font-black text-xs hover:bg-slate-900 transition-all active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.3em] italic shadow-2xl"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google_Auth
          </button>
          <button 
            onClick={() => onStart(UserRole.USER, AuthMethod.WEB3)}
            className="w-full sm:w-80 px-10 py-6 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-[1.75rem] font-black text-xs hover:bg-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.3em] italic shadow-2xl shadow-indigo-600/5"
          >
            Web3_Sync_Node
          </button>
        </div>

        <div className="pt-24">
          <button 
            onClick={() => onOpenExplorer && onOpenExplorer()}
            className="text-slate-700 hover:text-indigo-400 transition-all text-[11px] font-black uppercase tracking-[0.8em] italic border-b border-transparent hover:border-indigo-500/50 pb-2"
          >
            Search_Global_Index_v2
          </button>
        </div>
      </div>

      <div className="absolute bottom-12 left-0 right-0 px-12 flex justify-between items-center opacity-40">
         <div className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-widest">
            Last Block: #{stats.blocks} • Handshake: SECURED
         </div>
         <div className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-widest">
            Identity Cluster: GLOBAL-01
         </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
