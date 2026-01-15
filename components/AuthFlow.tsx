
import React, { useState, useEffect } from 'react';
import { UserRole, AuthMethod, UserProfile } from '../types';
import { VERIFICATION_CODE, INITIAL_USER_STATE, INITIAL_CREATOR_STATE } from '../constants';
import UserAgreement from './UserAgreement';
import WalletSelector from './WalletSelector';

interface AuthFlowProps {
  method: AuthMethod;
  role: UserRole;
  initialData?: string;
  onBack: () => void;
  onComplete: (user: UserProfile, password?: string) => void;
  addNotification: (title: string, message: string, type: 'EMAIL' | 'SMS' | 'SYSTEM') => void;
  peerRegistry?: { identifier: string; passwordHash: string; profile: UserProfile }[];
}

const AuthFlow: React.FC<AuthFlowProps> = ({ method, role, initialData = '', onBack, onComplete, addNotification, peerRegistry = [] }) => {
  const [step, setStep] = useState<'INITIAL' | 'VERIFY' | 'LOGIN_PASSWORD' | 'PASSWORD_SETUP' | 'USER_AGREEMENT' | 'WEB3_FLOW' | 'GOOGLE_OAUTH' | 'SUCCESS'>(
    method === AuthMethod.WEB3 ? 'WEB3_FLOW' : (method === AuthMethod.GOOGLE ? 'GOOGLE_OAUTH' : 'INITIAL')
  );
  
  const [identifier, setIdentifier] = useState(initialData);
  const [currentMethod, setCurrentMethod] = useState<AuthMethod>(method);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isExistingPeer, setIsExistingPeer] = useState(false);

  useEffect(() => {
    if (step === 'GOOGLE_OAUTH') {
      setIsProcessing(true);
      const googleLogs = [
        'Connecting to accounts.google.com...',
        'Requesting OAuth2 Token...',
        'Institutional Whitelist Check: PASS',
        'Identity Cluster Synchronized.'
      ];
      googleLogs.forEach((log, i) => setTimeout(() => setLogs(prev => [...prev, log]), i * 600));
      
      setTimeout(() => {
        setIsProcessing(false);
        const email = 'verified_user@gmail.com';
        setIdentifier(email);
        
        // Check if user exists after Google Auth
        const existing = peerRegistry.find(p => p.identifier === email);
        if (existing) {
          setIsExistingPeer(true);
          setStep('LOGIN_PASSWORD');
        } else {
          setStep('VERIFY');
          addNotification('Attestation Sent', 'A secure verification code was dispatched to your Google Email address.', 'EMAIL');
        }
      }, 3000);
    }
  }, [step]);

  useEffect(() => {
    if (initialData && step === 'INITIAL') {
       handleNext();
    }
  }, []);

  const handleNext = () => {
    if (!identifier) {
      setError('Required field');
      return;
    }
    setError('');
    
    // Check if peer exists in registry
    const existing = peerRegistry.find(p => p.identifier === identifier);
    setIsExistingPeer(!!existing);

    setIsProcessing(true);
    const isPhone = currentMethod === AuthMethod.PHONE;
    const routingLogs = isPhone ? [
      'Establishing Global SMS Bridge...',
      'Routing via Mobile Hub...',
      'SMS Attestation Dispatched.'
    ] : [
      'Securing Email Dispatch Rail...',
      'Encryption Handshake Complete...',
      'Email Attestation Dispatched.'
    ];

    routingLogs.forEach((log, i) => setTimeout(() => setLogs(prev => [...prev, log]), i * 400));
    
    setTimeout(() => {
      setIsProcessing(false);
      if (existing) {
        setStep('LOGIN_PASSWORD');
      } else {
        setStep('VERIFY');
        addNotification('Code Dispatched', `Your verification code was sent to ${identifier} via ${isPhone ? 'SMS' : 'Secure Email'}.`, isPhone ? 'SMS' : 'EMAIL');
      }
    }, 1800);
  };

  const handleVerify = () => {
    if (code === VERIFICATION_CODE) {
      setError('');
      setStep('PASSWORD_SETUP');
    } else {
      setError('Invalid code. Protocol Bypass: 196405');
    }
  };

  const handlePasswordSetup = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters for institutional clearance.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Security Hash Mismatch: Passwords do not match.');
      return;
    }
    setError('');
    setStep('USER_AGREEMENT');
  };

  const handleLoginPassword = () => {
    const peer = peerRegistry.find(p => p.identifier === identifier);
    if (peer && btoa(password) === peer.passwordHash) {
      onComplete(peer.profile);
    } else {
      setError('Access Denied: Invalid Security Seal (Password).');
    }
  };

  const handleAcceptAgreement = () => {
    const baseUser = role === UserRole.CREATOR ? INITIAL_CREATOR_STATE : INITIAL_USER_STATE;
    const finalUser: UserProfile = {
      ...baseUser,
      email: currentMethod === AuthMethod.EMAIL || currentMethod === AuthMethod.GOOGLE ? identifier : baseUser.email,
      phone: currentMethod === AuthMethod.PHONE ? identifier : undefined,
    };
    onComplete(finalUser, password);
  };

  const handleWalletLink = (providerId: string) => {
    // Fixed: access web3Address via p.profile.web3Address instead of p directly
    const existing = peerRegistry.find(p => p.profile.web3Address && p.profile.web3Address.length > 0); // Simplified check
    if (existing) {
      onComplete(existing.profile);
    } else {
      setStep('USER_AGREEMENT');
    }
  };

  if (step === 'USER_AGREEMENT') {
    return <UserAgreement onAccept={handleAcceptAgreement} onDecline={onBack} />;
  }

  if (step === 'PASSWORD_SETUP' || step === 'LOGIN_PASSWORD') {
    return (
      <div className="max-w-md mx-auto mt-20 p-12 bg-slate-900/50 rounded-[4rem] border border-slate-800 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 shadow-2xl">
         <div className="mb-10 text-center">
            <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
               {step === 'PASSWORD_SETUP' ? 'Security_Seal' : 'Handshake_Key'}
            </h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic">
               {step === 'PASSWORD_SETUP' ? 'Define Access Signature' : 'Authorized Peer Login'}
            </p>
         </div>

         <div className="space-y-8">
            <div className="space-y-4">
               <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest px-2 italic">Access Key (Password)</label>
               <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••••••" 
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
               />
               {step === 'PASSWORD_SETUP' && (
                 <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="Confirm Security Key" 
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                 />
               )}
            </div>

            {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">{error}</p>}

            <button 
               onClick={step === 'PASSWORD_SETUP' ? handlePasswordSetup : handleLoginPassword} 
               className="w-full py-6 bg-white text-slate-950 rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] hover:bg-indigo-50 transition-all italic shadow-2xl active:scale-95"
            >
               {step === 'PASSWORD_SETUP' ? 'Finalize_Seal' : 'Authorize_Session'}
            </button>
            
            <button onClick={() => setStep('INITIAL')} className="w-full text-[9px] font-black text-slate-700 uppercase tracking-widest hover:text-white transition-colors">Abort Access</button>
         </div>
      </div>
    );
  }

  if (step === 'GOOGLE_OAUTH') {
    return (
      <div className="max-w-xl mx-auto mt-20 p-16 bg-slate-900/60 rounded-[4rem] border border-slate-800 text-center animate-in zoom-in-95 duration-700 shadow-2xl backdrop-blur-3xl">
         <div className="flex flex-col items-center gap-12">
            <div className="relative">
              <div className="w-32 h-32 border-8 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/></svg>
              </div>
            </div>
            <div className="space-y-6 w-full">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Google_Handshake</h3>
               <div className="bg-black/40 rounded-3xl p-6 font-mono text-[10px] text-left space-y-2 border border-white/5 shadow-inner min-h-[120px]">
                  {logs.map((log, i) => (
                    <p key={i} className="text-indigo-400 animate-in slide-in-from-left-2 duration-300 tracking-widest">{`> ${log}`}</p>
                  ))}
               </div>
            </div>
         </div>
      </div>
    );
  }

  if (step === 'WEB3_FLOW') {
    return <WalletSelector onSelect={handleWalletLink} onClose={onBack} />;
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-12 bg-slate-900/50 rounded-[4rem] border border-slate-800 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 shadow-2xl relative">
      {isProcessing && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 rounded-[4rem] flex flex-col items-center justify-center p-12 space-y-8">
           <div className="w-12 h-12 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
           <div className="w-full space-y-2 font-mono text-[9px] text-indigo-400 text-left">
              {logs.map((log, i) => <p key={i} className="animate-in fade-in duration-300">{`SYNC: ${log}`}</p>)}
           </div>
        </div>
      )}

      <div className="mb-10 text-center">
        <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">Identity_Sync</h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic">Node Attestation Required</p>
      </div>

      <div className="space-y-8">
        {step === 'INITIAL' ? (
          <>
            <div className="flex bg-slate-950 p-1 rounded-2xl gap-1">
              <button onClick={() => setCurrentMethod(AuthMethod.EMAIL)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentMethod === AuthMethod.EMAIL ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-600'}`}>Email</button>
              <button onClick={() => setCurrentMethod(AuthMethod.PHONE)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentMethod === AuthMethod.PHONE ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-600'}`}>Mobile</button>
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest px-2 italic">Routing Channel</label>
              <input 
                type="text" 
                value={identifier} 
                onChange={(e) => setIdentifier(e.target.value)} 
                placeholder={currentMethod === AuthMethod.EMAIL ? "explorer@pluto-node.io" : "+1 000 000 0000"} 
                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono shadow-inner"
              />
            </div>
            <button onClick={handleNext} className="w-full py-6 bg-white text-slate-950 rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] hover:bg-indigo-50 transition-all italic shadow-2xl active:scale-95">Request_Attestation</button>
            <button onClick={onBack} className="w-full text-[9px] font-black text-slate-700 uppercase tracking-widest hover:text-white transition-colors">Terminate Terminal</button>
          </>
        ) : (
          <div className="space-y-10 animate-in zoom-in-95 duration-500">
             <div className="text-center space-y-6">
                <p className="text-xs text-slate-400 font-medium">Verification dispatched via <span className="text-indigo-400 font-black italic">{currentMethod === AuthMethod.PHONE ? 'SMS' : 'Email'}</span> to <span className="text-indigo-400 font-black italic">{identifier}</span></p>
                <div className="relative group">
                   <input 
                      type="text" 
                      value={code} 
                      maxLength={6} 
                      onChange={(e) => setCode(e.target.value)} 
                      placeholder="000000" 
                      className="w-full bg-slate-950 border border-white/5 rounded-3xl py-8 text-center text-5xl font-mono font-black tracking-[0.6em] text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 shadow-inner"
                   />
                </div>
                {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest animate-pulse">{error}</p>}
             </div>
             <button onClick={handleVerify} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] hover:bg-indigo-500 transition-all shadow-2xl italic active:scale-95 shadow-indigo-600/20">Verify_Protocol_Seal</button>
             <button onClick={() => setStep('INITIAL')} className="w-full text-[9px] font-black text-slate-700 uppercase tracking-widest hover:text-white transition-colors">Resend_Attestation_Signal</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthFlow;
