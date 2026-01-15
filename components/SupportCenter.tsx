
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

const SupportCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DOCUMENTATION' | 'AI_ASSISTANT'>('DOCUMENTATION');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Identity Verified. Support Cluster 04 is online. How can I assist with your Pluto Terminal handshake today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: "You are the Pluto Protocol Handshake Assistant. Your role is to provide elite technical support for the Pluto Institutional Terminal. You are expert in: 1. MPC Custody Architecture. 2. Decentralized Registry Indexing. 3. Zero-Knowledge Proof (ZKP) Identity. 4. Real-time liquidity routing. Be concise, technical, and professional. Avoid fluff.",
          temperature: 0.5,
        },
      });

      const text = response.text;
      setMessages(prev => [...prev, { role: 'ai', text: text || "System Timeout: Support node latency too high." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Protocol Error: Secure tunnel disconnected. Verify API project status." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const Documentation = () => (
    <div className="space-y-12 animate-in fade-in duration-700">
      <section className="space-y-6">
        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">01. Identity Attestation</h3>
        <p className="text-slate-400 leading-relaxed font-medium italic border-l-2 border-indigo-500 pl-6">
          Your node identity is anchored via a unique Sovereign Peer ID. All institutional credentials are encrypted locally using Pluto's local-first privacy shield. Lost passwords cannot be recovered via central authority.
        </p>
      </section>

      <section className="space-y-6">
        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">02. Liquidity Execution</h3>
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] space-y-4">
          <p className="text-sm text-slate-300">
            Trades on the <span className="text-indigo-400 font-black italic">Execution_Desk</span> are routed through optimal institutional exchanges.
          </p>
          <ul className="space-y-3 text-[11px] text-slate-500 font-mono list-disc ml-4 uppercase tracking-widest italic">
            <li>DEX Routing: Real-time price discovery via aggregated liquidity pools.</li>
            <li>Atomic Swaps: P2P settlement via the Smart Contract Bridge.</li>
            <li>Slippage Control: Institutional tolerance is set to 0.5% by default.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">03. Vault Security (MPC)</h3>
        <p className="text-slate-400 leading-relaxed font-medium italic border-l-2 border-emerald-500 pl-6">
          Pluto utilizes Multi-Party Computation (MPC) to split your private keys across distributed validator nodes. No single entity ever holds your full signature, ensuring institutional-grade protection against lateral network threats.
        </p>
      </section>

      <section className="space-y-6">
        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">04. Global Registry v2</h3>
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] space-y-4">
          <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase tracking-widest italic">
            The Global Explorer Index tracks 20,000+ peers. Publishing your protocol node enables inbound institutional interest and proves network health via real-time integrity scores.
          </p>
        </div>
      </section>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-24">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-4 mb-4">
             <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-[0_0_40px_rgba(79,70,229,0.5)] border border-indigo-400/30">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
             </div>
             <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic leading-none">Support_Cluster</h1>
          </div>
          <p className="text-slate-500 text-lg font-medium">Documentation & Intelligent Handshake Assistance.</p>
        </div>
        
        <div className="flex bg-slate-900/40 p-2 rounded-[2rem] border border-white/5">
           {(['DOCUMENTATION', 'AI_ASSISTANT'] as const).map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-10 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.4em] transition-all italic ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-600 hover:text-slate-300'}`}
             >
               {tab.replace('_', ' ')}
             </button>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {activeTab === 'DOCUMENTATION' ? (
            <Documentation />
          ) : (
            <div className="bg-slate-900/40 border border-slate-800/50 rounded-[4rem] flex flex-col h-[700px] shadow-2xl backdrop-blur-3xl overflow-hidden">
               <div className="p-8 border-b border-white/5 bg-slate-950/40 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-lg"></div>
                     <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Reasoning Node: FLASH-3</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-700 tracking-widest uppercase">ENCRYPTED_LINK_ESTABLISHED</span>
               </div>
               
               <div className="flex-1 overflow-y-auto p-10 space-y-8 font-mono text-xs">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-6 rounded-[2rem] border ${msg.role === 'user' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl italic' : 'bg-black/40 border-white/5 text-slate-300'}`}>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                       <div className="px-8 py-4 bg-black/40 border border-white/5 rounded-full flex gap-2">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                       </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
               </div>

               <div className="p-8 border-t border-white/5 bg-slate-950/40">
                  <div className="relative group">
                    <input 
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask Pluto AI about fees, security, or node routing..."
                      className="w-full bg-black/80 border border-white/10 rounded-[2.5rem] px-10 py-6 text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner font-mono text-xs italic"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!input.trim()}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white text-slate-950 rounded-2xl hover:bg-indigo-50 transition-all shadow-xl active:scale-95 disabled:opacity-30"
                    >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
                    </button>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900/60 border border-indigo-500/20 rounded-[3rem] p-10 shadow-2xl">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] italic mb-8">System_Vitals</h3>
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase">P2P Latency</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">1.2ms</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Handshake Stability</span>
                    <span className="text-[10px] font-mono font-bold text-indigo-400">OPTIMAL</span>
                 </div>
                 <div className="pt-6 border-t border-white/5">
                    <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest leading-relaxed italic">
                       Support Nodes are decentralized. All logs are cryptographically scrubbed after 24 hours.
                    </p>
                 </div>
              </div>
           </div>

           <div className="p-10 bg-indigo-600/5 border border-indigo-500/20 rounded-[3rem]">
              <p className="text-[11px] font-black text-indigo-300 uppercase tracking-widest mb-4 italic">Institutional Alert</p>
              <p className="text-xs text-indigo-400/80 leading-relaxed font-medium uppercase tracking-tight">
                Pluto Terminal Beta is operating on synthetic mainnet. No real assets are processed in this session.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;
