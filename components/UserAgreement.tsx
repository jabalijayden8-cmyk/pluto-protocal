
import React, { useState } from 'react';

interface UserAgreementProps {
  onAccept: () => void;
  onDecline: () => void;
}

const UserAgreement: React.FC<UserAgreementProps> = ({ onAccept, onDecline }) => {
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  const SECTIONS = [
    {
      title: "1.0 PROTOCOL DEFINITIONS",
      content: "The 'Pluto Protocol' refers to the decentralized institutional terminal and associated MPC (Multi-Party Computation) custody nodes. By initializing a peer node, the User becomes a 'Sovereign Participant' in the Pluto Liquidity Index. 'Simulation Phase' denotes the current beta environment where assets are synthetic and used for operational verification."
    },
    {
      title: "2.0 RISK DISCLOSURE & VOLATILITY",
      content: "Digital assets are subject to extreme market fluctuations. The Pluto Protocol provides tools for execution but does not provide financial advice. User acknowledges that loss of MPC key shards or institutional passwords results in permanent loss of access to the associated node and its assets. There is no centralized 'Password Reset' mechanism in the Sovereign Layer."
    },
    {
      title: "3.0 IDENTITY & PRIVACY (ZKP)",
      content: "Pluto utilizes Zero-Knowledge Proofs (ZKP) for identity attestation. Personal Identifiable Information (PII) is encrypted locally and never stored on-chain in an unmasked state. Verification signals sent via SMS or Email are processed through secure institutional gateways only for the purpose of node attestation."
    },
    {
      title: "4.0 CUSTODY & MPC ARCHITECTURE",
      content: "Assets managed within the Pluto Terminal are secured via a distributed custody model. The User maintains primary signing authority. Pluto Engineering does not have the technical capability to unilaterally move Peer assets. All transactions are final upon broadcast to the decentralized ledger."
    },
    {
      title: "5.0 INSTITUTIONAL COMPLIANCE",
      content: "User agrees to comply with all local and international regulations regarding digital asset management. Attempting to utilize the protocol for illicit activities will result in the immediate revocation of the node's whitelist status from the Global Explorer Index."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto mt-4 p-1 rounded-[4rem] bg-gradient-to-b from-indigo-500/20 to-transparent animate-in zoom-in-95 duration-700 shadow-2xl relative">
      <div className="bg-[#030712] rounded-[3.8rem] p-12 md:p-16 border border-white/5 backdrop-blur-3xl relative overflow-hidden">
        {/* Subtle Background Seal */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
          <span className="text-[25rem] font-black italic">PLUTO</span>
        </div>

        <div className="relative z-10 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">The_Sovereign_Charter</h2>
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-12 bg-slate-800"></span>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.5em] italic">Institutional Terms of Operation v4.2</p>
              <span className="h-px w-12 bg-slate-800"></span>
            </div>
          </div>

          <div className="h-[450px] overflow-y-auto px-8 py-10 bg-black/40 rounded-[3rem] border border-white/5 custom-scrollbar font-mono text-[12px] leading-relaxed text-slate-400 space-y-10">
            {SECTIONS.map((section, idx) => (
              <section key={idx} className="space-y-4">
                <h3 className="text-white font-black tracking-widest uppercase italic border-b border-indigo-500/20 pb-2">{section.title}</h3>
                <p className="pl-4 border-l border-slate-800">{section.content}</p>
              </section>
            ))}
            <div className="pt-10 border-t border-slate-800 text-center opacity-40">
              <p className="italic uppercase tracking-tighter text-[10px]">*** END OF CHARTER DOCUMENTATION ***</p>
              <p className="text-[8px] mt-2 font-bold">DIGITALLY SIGNED VIA PLUTO-SYSTEM-ROOT</p>
            </div>
          </div>

          <div className="space-y-8">
            <label className="flex items-center gap-4 group cursor-pointer p-6 bg-slate-900/40 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={hasAcknowledged}
                  onChange={() => setHasAcknowledged(!hasAcknowledged)}
                  className="peer appearance-none w-8 h-8 rounded-xl border-2 border-slate-700 bg-slate-950 checked:bg-indigo-600 checked:border-indigo-500 transition-all cursor-pointer"
                />
                <svg className="absolute w-5 h-5 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
              </div>
              <span className="text-xs font-black text-slate-500 group-hover:text-white uppercase tracking-widest transition-colors italic">
                I acknowledge the institutional risks and sovereign responsibilities defined above.
              </span>
            </label>

            <div className="flex flex-col md:flex-row gap-6">
              <button 
                onClick={onDecline} 
                className="flex-1 py-6 bg-slate-950 border border-slate-800 text-slate-500 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest italic hover:bg-rose-600/10 hover:text-rose-500 hover:border-rose-500/20 transition-all active:scale-95"
              >
                Decline_Handshake
              </button>
              <button 
                onClick={onAccept}
                disabled={!hasAcknowledged}
                className={`flex-[2] py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.6em] italic shadow-2xl transition-all active:scale-95 ${
                  hasAcknowledged 
                  ? 'bg-white text-slate-950 hover:bg-indigo-50 shadow-white/10' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                Initialize_Protocol_✓
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAgreement;
