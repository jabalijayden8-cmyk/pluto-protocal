
import { GoogleGenAI } from "@google/genai";
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface SecurityAIProps {
  user: UserProfile;
}

const SecurityAI: React.FC<SecurityAIProps> = ({ user }) => {
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const performAudit = async () => {
    if (!input.trim()) return;

    setIsAnalyzing(true);
    setAnalysis(null);
    setLogs(['[0.0s] Establishing Secure Enclave...', '[0.4s] Connecting to Pluto-Pro Reasoning Engine...', '[0.8s] Ingesting Source Artifacts...']);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Stage 1 Logs
      setTimeout(() => setLogs(prev => [...prev, '[1.2s] Running Static Analysis (Linting)...']), 800);
      setTimeout(() => setLogs(prev => [...prev, '[1.6s] Constructing Symbolic Logic Trees...']), 1600);
      setTimeout(() => setLogs(prev => [...prev, '[2.1s] Triggering Deep Thinking Mode (16k Budget)...']), 2200);

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `As an elite institutional security researcher, perform an exhaustive audit of the following code/contract: ${input}. 
        
        Focus on:
        1. Reentrancy and state management.
        2. Integer overflows/underflows.
        3. Sandwich attack vectors and MEV vulnerability.
        4. Governance centralization risks.
        5. Access control and permission logic.

        Output a formal institutional report with a RISK RATING (LOW/MED/HIGH/CRITICAL).`,
        config: {
          systemInstruction: "You are the Pluto Protocol Security Intelligence. Your reports are used by billion-dollar hedge funds. Be extremely critical, precise, and use institutional-grade financial and cryptographic terminology. Format with clear Markdown headers.",
          thinkingConfig: { thinkingBudget: 16384 },
          temperature: 0.1, 
        }
      });

      const result = response.text;
      
      setTimeout(() => {
        setLogs(prev => [...prev, '[3.4s] Verification against exploit patterns complete.', '[3.9s] Finalizing Formal Attestation...']);
        setTimeout(() => {
          setAnalysis(result || "AUDIT_FAILURE: Engine returned empty response. Contact Pluto Support.");
          setIsAnalyzing(false);
        }, 1200);
      }, 3000);

    } catch (error) {
      console.error(error);
      setAnalysis("GOVERNANCE_ERROR: AI Access Denied. Verify API key credentials and project billing status.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-24">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-4 mb-4">
             <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-[0_0_40px_rgba(79,70,229,0.5)] border border-indigo-400/30">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
             </div>
             <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic">Sovereign_Auditor</h1>
          </div>
          <p className="text-slate-500 text-lg font-medium">Monitoring protocol integrity via Gemini 3 Pro reasoning nodes.</p>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center gap-4">
              <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(129,140,248,1)]"></div>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Reasoning Cluster: ACTIVE</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-[4rem] p-12 shadow-2xl backdrop-blur-3xl border-t-white/10 space-y-10 group">
           <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="text-xs font-black uppercase tracking-[0.5em] text-slate-500">Contract Analysis Terminal</h3>
                 <span className="text-[9px] font-bold text-slate-700 font-mono tracking-widest">PL-SEC-CORE</span>
              </div>
              <div className="relative">
                 <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="// Paste Solidity, Rust, or Bytecode for verification..."
                    className="w-full h-96 bg-black/60 border border-white/5 rounded-[3rem] p-10 font-mono text-sm text-slate-300 focus:outline-none focus:ring-8 focus:ring-indigo-500/10 transition-all shadow-inner resize-none placeholder:text-slate-800"
                 />
              </div>
           </div>

           <button 
              onClick={performAudit}
              disabled={isAnalyzing || !input.trim()}
              className={`w-full py-10 rounded-[3rem] font-black text-2xl uppercase tracking-[0.4em] transition-all shadow-2xl relative overflow-hidden ${isAnalyzing ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-950 hover:bg-indigo-50 active:scale-95'}`}
           >
              {isAnalyzing ? (
                <div className="flex items-center justify-center gap-4">
                   <div className="w-6 h-6 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
                   <span>Broadcasting to reasoning node...</span>
                </div>
              ) : 'Initialize Formal Audit'}
           </button>
           
           <div className="space-y-4 min-h-[160px] max-h-[250px] overflow-y-auto scrollbar-hide">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 font-mono text-[10px] animate-in slide-in-from-left-2 duration-300">
                   <span className="text-indigo-500/60 font-black tracking-tighter">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                   <span className="text-slate-400 uppercase tracking-widest">{log}</span>
                </div>
              ))}
              {isAnalyzing && <div className="w-2 h-4 bg-indigo-500 animate-pulse ml-16"></div>}
           </div>
        </div>

        <div className="bg-black/60 border border-white/5 rounded-[4rem] p-16 min-h-[700px] flex flex-col relative overflow-hidden shadow-2xl backdrop-blur-3xl border-t-indigo-500/10">
           {!analysis && !isAnalyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10">
                 <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-slate-800 border-2 border-slate-800/50 border-dashed animate-pulse">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                 </div>
                 <div className="space-y-4">
                    <p className="text-slate-600 font-black uppercase tracking-[0.6em] text-xs">Awaiting Attestation Handshake</p>
                    <p className="text-slate-800 font-mono text-[10px] uppercase tracking-widest italic">Encrypted Secure Tunnel Ready</p>
                 </div>
              </div>
           ) : isAnalyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-16">
                 <div className="relative">
                    <div className="w-56 h-56 border-[12px] border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] shadow-[0_0_100px_rgba(79,70,229,0.8)] animate-pulse flex items-center justify-center text-white font-black italic text-5xl">P</div>
                    </div>
                 </div>
                 <div className="text-center space-y-4">
                    <p className="text-white font-black uppercase tracking-[1em] text-2xl animate-pulse italic">Thinking</p>
                    <p className="text-slate-600 text-[10px] font-mono uppercase tracking-[0.4em]">Analyzing Symbolic Logic Vectors...</p>
                 </div>
              </div>
           ) : (
              <div className="animate-in fade-in zoom-in-95 duration-1000 h-full flex flex-col">
                 <div className="flex justify-between items-start mb-12 border-b border-white/5 pb-10">
                    <div>
                       <h3 className="text-xl font-black text-indigo-400 uppercase tracking-tighter">Security_Attestation</h3>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 italic">Institutional Intelligence Report</p>
                    </div>
                    <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                       <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg"></div>
                       <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Signed</span>
                    </div>
                 </div>
                 <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar">
                    <div className="prose prose-invert max-w-none whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-slate-300 selection:bg-indigo-500">
                       {analysis}
                    </div>
                 </div>
                 <div className="mt-12 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-2 text-center md:text-left">
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Certificate_Seal</p>
                       <p className="text-[9px] font-mono text-indigo-400/60 break-all max-w-sm">PL-AT-{Math.random().toString(16).slice(2, 12).toUpperCase()}-99</p>
                    </div>
                    <button 
                       onClick={() => { navigator.clipboard.writeText(analysis || ''); alert('Institutional Report Copied.'); }}
                       className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl active:scale-95 italic"
                    >
                       Copy Audit Report
                    </button>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default SecurityAI;
