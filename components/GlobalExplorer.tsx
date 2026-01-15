
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile } from '../types';
import { generateRegistrySeed } from '../constants';

interface GlobalExplorerProps {
  onBack: () => void;
  isPublished?: boolean;
  user?: UserProfile | null;
  onSelectNode: (node: any) => void;
  initialQuery?: string;
}

const GlobalExplorer: React.FC<GlobalExplorerProps> = ({ onBack, isPublished, user, onSelectNode, initialQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [nodes, setNodes] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 50;
  const [isLoading, setIsLoading] = useState(true);
  const [throughput, setThroughput] = useState(1420);
  const [registryStats, setRegistryStats] = useState({ capacity: 20000, active: 19842, syncLatency: '1.4ms' });

  // Initialize and scale the "Registry Server"
  useEffect(() => {
    const initRegistry = () => {
      setIsLoading(true);
      let registry = [];
      const cached = localStorage.getItem('pluto_full_registry_v2');
      
      if (cached) {
        registry = JSON.parse(cached);
      } else {
        // Generate 20,000 nodes if first run
        registry = generateRegistrySeed();
        localStorage.setItem('pluto_full_registry_v2', JSON.stringify(registry));
      }

      // Layer in real-time user-minted nodes from the public registry
      const publicRegistry = JSON.parse(localStorage.getItem('pluto_public_registry') || '[]');
      const combined = [...publicRegistry, ...registry];
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
      
      setNodes(unique);
      setIsLoading(false);
    };

    initRegistry();

    const interval = setInterval(() => {
      setThroughput(prev => Math.floor(prev + (Math.random() * 50 - 25)));
      setRegistryStats(prev => ({
        ...prev,
        active: Math.min(20000, prev.active + (Math.random() > 0.5 ? 1 : -1)),
        syncLatency: (1.2 + Math.random() * 0.5).toFixed(2) + 'ms'
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredNodes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return nodes;
    return nodes.filter(n => 
      n.name.toLowerCase().includes(query) || 
      n.id.toLowerCase().includes(query) ||
      (n.symbol && n.symbol.toLowerCase().includes(query))
    );
  }, [nodes, searchQuery]);

  const paginatedNodes = useMemo(() => {
    return filteredNodes.slice(0, page * itemsPerPage);
  }, [filteredNodes, page]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-8 font-mono relative overflow-hidden">
      {/* Network Pulse Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      <div className="max-w-6xl mx-auto relative z-10 animate-in fade-in duration-1000">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 border-b border-slate-800 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center font-black text-white shadow-[0_0_60px_rgba(79,70,229,0.4)] text-2xl italic border border-white/10">P</div>
              <div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Registry_Service</h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[9px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">
                    Node_Capacity_Active
                  </div>
                  <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Shard: Mainnet-Alpha-01</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
            <div className="relative w-full md:w-96 group">
              <div className="absolute -inset-1 bg-indigo-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              <input 
                type="text"
                placeholder="Search 20,000+ Identities..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-900/80 backdrop-blur-3xl border border-slate-800 rounded-2xl px-14 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono shadow-inner"
              />
              <svg className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <button 
              onClick={onBack}
              className="px-10 py-5 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all active:scale-95 shadow-2xl shrink-0 italic"
            >
              ← Terminate Session
            </button>
          </div>
        </header>

        {/* Global Server Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-3xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/30"></div>
            <p className="text-[10px] text-slate-500 font-black mb-3 uppercase tracking-[0.4em]">Registry Capacity</p>
            <p className="text-4xl font-black text-white tracking-tighter italic">{registryStats.capacity.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-3xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/30"></div>
            <p className="text-[10px] text-slate-500 font-black mb-3 uppercase tracking-[0.4em]">Active Peer Load</p>
            <p className="text-4xl font-black text-emerald-400 tracking-tighter italic">{registryStats.active.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-3xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/30"></div>
            <p className="text-[10px] text-slate-500 font-black mb-3 uppercase tracking-[0.4em]">Sync Throughput</p>
            <p className="text-4xl font-black text-indigo-400 tracking-tighter italic">{throughput} r/s</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-3xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/30"></div>
            <p className="text-[10px] text-slate-500 font-black mb-3 uppercase tracking-[0.4em]">P2P Latency</p>
            <p className="text-4xl font-black text-white tracking-tighter italic">{registryStats.syncLatency}</p>
          </div>
        </div>

        <div className="bg-slate-900/20 border border-slate-800 rounded-[3.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl border-t-indigo-500/20 min-h-[600px]">
          <div className="px-12 py-10 bg-slate-950/60 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h3 className="text-xs font-black uppercase tracking-[0.6em] text-slate-400 italic">Distributed Ledger Index</h3>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-[10px] font-mono font-black text-slate-700 uppercase tracking-widest">
              RESOLVING_SHARD_01 • MATCHES: {filteredNodes.length.toLocaleString()}
            </div>
          </div>
          
          {isLoading ? (
            <div className="py-60 flex flex-col items-center justify-center space-y-12">
               <div className="w-24 h-24 border-8 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
               <p className="text-indigo-400 font-black uppercase tracking-[0.6em] animate-pulse">Hydrating 20k Nodes...</p>
            </div>
          ) : paginatedNodes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black text-slate-600 uppercase tracking-[0.6em] bg-slate-950/40">
                  <tr>
                    <th className="px-12 py-8">Protocol Entity</th>
                    <th className="px-12 py-8">Web3 Status</th>
                    <th className="px-12 py-8">Integrity</th>
                    <th className="px-12 py-8 text-right">Liquidity Pool</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {paginatedNodes.map((node) => (
                    <tr 
                      key={node.id} 
                      onClick={() => onSelectNode(node)}
                      className="cursor-pointer hover:bg-indigo-600/10 transition-all group relative border-l-4 border-l-transparent hover:border-l-indigo-500"
                    >
                      <td className="px-12 py-10">
                        <div className="flex items-center gap-6">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all shadow-inner border border-white/5 ${node.status === 'LIVE' || node.tier === 1 ? 'bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)]' : 'bg-slate-800 text-slate-500'}`}>
                             {node.symbol?.[0] || node.name[0]}
                           </div>
                           <div>
                             <p className={`font-black tracking-tighter text-2xl uppercase italic ${node.status === 'LIVE' || node.tier === 1 ? 'text-white' : 'text-slate-200'}`}>{node.name}</p>
                             <div className="flex items-center gap-3 mt-1.5">
                               <p className="text-[9px] text-slate-700 font-mono uppercase tracking-widest">{node.id}</p>
                               {node.tier === 1 && <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Genesis_Seed</span>}
                               {node.tier === 2 && <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Institutional</span>}
                             </div>
                           </div>
                        </div>
                      </td>
                      <td className="px-12 py-10">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${node.status === 'Operational' || node.status === 'LIVE' ? 'bg-emerald-500' : 'bg-slate-700'} ${node.status === 'LIVE' ? 'animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]' : ''}`}></div>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${
                            node.status === 'LIVE' || node.status === 'Operational' ? 'text-emerald-400' : 'text-slate-600'
                          }`}>
                            {node.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-12 py-10">
                        <div className="flex items-center gap-5">
                          <div className="w-40 h-1.5 bg-slate-900 rounded-full overflow-hidden shadow-inner">
                            <div className={`h-full transition-all duration-[2s] ${node.health > 90 ? 'bg-indigo-500' : 'bg-orange-500'}`} style={{ width: `${node.health}%` }}></div>
                          </div>
                          <span className="text-[10px] font-black text-slate-600 font-mono">{node.health}%</span>
                        </div>
                      </td>
                      <td className="px-12 py-10 text-right">
                        <p className="font-mono font-black text-white text-2xl tracking-tighter italic group-hover:text-indigo-400 transition-colors">{node.tvl}</p>
                        <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest mt-0.5 italic">Managed_Reserves</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredNodes.length > paginatedNodes.length && (
                <div className="p-16 flex justify-center bg-slate-950/20">
                   <button 
                     onClick={() => setPage(p => p + 1)}
                     className="px-12 py-6 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-black text-white uppercase tracking-[0.4em] hover:bg-slate-800 transition-all italic shadow-2xl"
                   >
                     Load More Peer Results ↓
                   </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-60 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
               <div className="w-32 h-32 bg-slate-900/50 rounded-full flex items-center justify-center text-slate-800 border-2 border-slate-800/50 border-dashed animate-pulse">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
               </div>
               <div className="space-y-4">
                  <p className="text-3xl font-black text-slate-600 uppercase italic tracking-tighter">Null_Resolution_Match</p>
                  <p className="text-xs text-slate-800 uppercase tracking-[0.4em] max-w-sm mx-auto">Verify identity broadcast on mainnet to appear in decentralized registry index.</p>
               </div>
            </div>
          )}
        </div>

        <div className="mt-24 border-t border-slate-800/50 pt-16 flex flex-col md:flex-row justify-between items-center opacity-40 hover:opacity-100 transition-opacity gap-8">
           <div className="text-[9px] font-black text-slate-700 uppercase tracking-[0.8em] italic">
             Distributed Registry Hub • 20,442 Active Connections • Sharding Active
           </div>
           <div className="flex gap-8">
              {['Auto_Scale: ON', 'Consensus: 100%', 'Sync: OPTIMAL'].map(t => (
                <span key={t} className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.4em] border border-indigo-500/20 px-4 py-1.5 rounded-lg">{t}</span>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalExplorer;
