
import React, { useState, useEffect } from 'react';

interface PublicNodeViewProps {
  node: any;
  onBack: () => void;
}

const PublicNodeView: React.FC<PublicNodeViewProps> = ({ node, onBack }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Generate dummy historical TVL data
    const base = parseFloat(node.tvl.replace(/[^0-9.]/g, '')) * 1000000;
    const history = Array.from({ length: 24 }).map((_, i) => ({
      val: base * (0.95 + Math.random() * 0.1)
    }));
    setData(history);
  }, [node]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 p-8 font-mono relative overflow-hidden animate-in fade-in duration-500">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.08),transparent_50%)] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-16">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all"
          >
            ← Back to Index
          </button>
          <div className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">
            Node: {node.id}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-4">
              <h1 className="text-6xl font-black text-white tracking-tighter uppercase">{node.name}</h1>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
                Institutional protocol published to the decentralized Web3 index. Automated asset management with high-frequency settlement nodes.
              </p>
            </div>

            <div className="bg-slate-900/30 border border-slate-800 rounded-[3rem] p-12 backdrop-blur-md relative overflow-hidden group">
               <div className="absolute top-8 right-8 text-[10px] font-black text-slate-700 uppercase tracking-widest">TVL_HISTORICAL_24H</div>
               <div className="flex items-end gap-2 h-48 mb-8">
                 {data.map((d, i) => (
                   <div 
                    key={i} 
                    className="flex-1 bg-indigo-500/20 rounded-t-lg hover:bg-indigo-500 transition-all duration-300 group-hover:opacity-80" 
                    style={{ height: `${(d.val / (Math.max(...data.map(x => x.val)) || 1)) * 100}%` }}
                   />
                 ))}
               </div>
               <div className="flex justify-between items-center">
                 <div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Value Locked</p>
                   <p className="text-5xl font-black text-white tracking-tighter">{node.tvl}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Aggregate Health</p>
                   <p className="text-2xl font-black text-emerald-400">{node.health}%</p>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 bg-slate-900/20 border border-slate-800 rounded-[2.5rem]">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Oracle Consensus</h3>
                  <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Node_Cluster_0{i}</span>
                        <span className="text-emerald-500 font-black">VALIDATED</span>
                      </div>
                    ))}
                  </div>
               </div>
               <div className="p-8 bg-slate-900/20 border border-slate-800 rounded-[2.5rem]">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Security Audit</h3>
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                     <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Status: Passed</p>
                     <p className="text-[9px] text-slate-500">Verified by Pluto Engineering Group</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-8 sticky top-12">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl">
              <h3 className="text-slate-950 text-2xl font-black tracking-tighter mb-4 uppercase">Protocol Info</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-10 font-medium">
                Public access point for protocol transparency. All assets are cryptographically secured and verifiable on the decentralized ledger.
              </p>
              <div className="space-y-6">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Sync</p>
                   <p className="text-sm font-black text-slate-900">4 Minutes Ago</p>
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Settlement Layer</p>
                   <p className="text-sm font-black text-indigo-600">Pluto-L2-Mainnet</p>
                </div>
                <button className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all">
                  Contact Entity
                </button>
              </div>
            </div>

            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] flex items-center gap-4">
               <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
               </div>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Encrypted Communication Enabled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicNodeView;
