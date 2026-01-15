
import React, { useState, useEffect, useCallback } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { UserProfile, UserRole, AuthMethod } from './types';
import { INITIAL_USER_STATE, INITIAL_CREATOR_STATE } from './constants';
import LandingPage from './components/LandingPage';
import AuthFlow from './components/AuthFlow';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import TradeView from './components/TradeView';
import WalletView from './components/WalletView';
import GlobalExplorer from './components/GlobalExplorer';
import PublicNodeView from './components/PublicNodeView';
import SecurityAI from './components/SecurityAI';
import SupportCenter from './components/SupportCenter';
import ForexPerps from './components/ForexPerps';
import WalletSelector from './components/WalletSelector';
import { BrowserProvider, formatEther } from 'ethers';

type AppView = 'LANDING' | 'AUTH' | 'DASHBOARD' | 'TRADE' | 'FOREX_PERPS' | 'WALLET' | 'SETTINGS' | 'ADMIN' | 'GLOBAL_EXPLORER' | 'PUBLIC_NODE' | 'SECURITY_AI' | 'SUPPORT';

interface ProtocolNotification {
  id: string;
  title: string;
  message: string;
  type: 'EMAIL' | 'SMS' | 'SYSTEM';
}

interface RegisteredPeer {
  identifier: string;
  passwordHash: string;
  profile: UserProfile;
}

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('LANDING');
  const [viewHistory, setViewHistory] = useState<AppView[]>(['LANDING']);
  const [explorerQuery, setExplorerQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [notifications, setNotifications] = useState<ProtocolNotification[]>([]);
  const [isGlobalWalletSelectorOpen, setIsGlobalWalletSelectorOpen] = useState(false);

  // Persistent States
  const [peerRegistry, setPeerRegistry] = useState<RegisteredPeer[]>(() => {
    try {
      const saved = localStorage.getItem('pluto_peer_registry');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem('pluto_user_session');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch { return null; }
  });
  
  const [isPublished, setIsPublished] = useState(() => {
    return localStorage.getItem('pluto_protocol_published') === 'true';
  });

  const [authMode, setAuthMode] = useState<{method: AuthMethod, role: UserRole, initialData: string}>({
    method: AuthMethod.EMAIL,
    role: UserRole.USER,
    initialData: ''
  });

  useEffect(() => {
    localStorage.setItem('pluto_peer_registry', JSON.stringify(peerRegistry));
  }, [peerRegistry]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('pluto_user_session', JSON.stringify(user));
      // Keep registry in sync with current user state
      const identifier = user.email || user.phone || user.id;
      setPeerRegistry(prev => prev.map(p => {
        if (p.identifier === identifier) {
          return { ...p, profile: user };
        }
        return p;
      }));
    } else {
      localStorage.removeItem('pluto_user_session');
    }
  }, [user]);

  const addNotification = useCallback((title: string, message: string, type: 'EMAIL' | 'SMS' | 'SYSTEM' = 'EMAIL') => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const navigateTo = (newView: AppView) => {
    if (newView === view) return;
    setViewHistory(prev => [...prev, newView]);
    setView(newView);
    setIsAdvancedOpen(false);
    setIsSidebarOpen(false);
  };

  const handleBack = () => {
    if (viewHistory.length <= 1) return;
    const newHistory = [...viewHistory];
    newHistory.pop();
    const previousView = newHistory[newHistory.length - 1];
    setViewHistory(newHistory);
    setView(previousView);
  };

  const handleAuthComplete = (loggedInUser: UserProfile, password?: string) => {
    const identifier = loggedInUser.email || loggedInUser.phone || loggedInUser.id;
    if (password) {
      setPeerRegistry(prev => {
        const filtered = prev.filter(p => p.identifier !== identifier);
        return [...filtered, { identifier, passwordHash: btoa(password), profile: loggedInUser }];
      });
    }
    setUser(loggedInUser);
    addNotification('Identity Verified', `Authorized peer session for ${identifier}. Handshake confirmed.`, 'EMAIL');
    navigateTo(loggedInUser.role === UserRole.CREATOR ? 'ADMIN' : 'DASHBOARD');
  };

  const handleGlobalWalletSelect = async (providerId: string, customAddress?: string) => {
    if (!user) return;
    setIsGlobalWalletSelectorOpen(false);
    
    if (!customAddress && (providerId === 'metamask' || providerId === 'coinbase' || providerId === 'phantom')) {
      try {
        const provider = new BrowserProvider((window as any).ethereum);
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        const balance = await provider.getBalance(address);
        const ethAmount = parseFloat(formatEther(balance));

        const updatedUser: UserProfile = { 
          ...user, 
          web3Address: address,
          walletProvider: providerId.toUpperCase(),
          wallet: {
            ...user.wallet,
            assets: [
              ...user.wallet.assets.filter(a => a.symbol !== 'ETH'),
              { symbol: 'ETH', amount: ethAmount }
            ]
          }
        };
        setUser(updatedUser);
        addNotification('Core Synced', `${providerId.toUpperCase()} identity sharded to protocol layer.`, 'SYSTEM');
      } catch (err: any) {
        addNotification('Handshake Failed', 'EVM bridge refused connection.', 'SYSTEM');
      }
    } else {
      const mockAddr = customAddress || '0x' + Math.random().toString(16).slice(2, 42);
      const updatedUser: UserProfile = { 
        ...user, 
        web3Address: mockAddr,
        walletProvider: providerId.toUpperCase(),
        wallet: {
          ...user.wallet,
          assets: [
            ...user.wallet.assets.filter(a => a.symbol !== 'ETH'),
            { symbol: 'ETH', amount: customAddress ? 0 : 4.2 }
          ]
        }
      };
      setUser(updatedUser);
      addNotification('Bridge Active', `Node identity established for ${providerId.toUpperCase()}.`, 'SYSTEM');
    }
  };

  const handleAdminDirectLogin = () => {
    setUser(INITIAL_CREATOR_STATE);
    addNotification('Sovereign Override', 'Administrative console accessed via direct bypass.', 'SYSTEM');
    navigateTo('ADMIN');
  };

  const handleLogout = () => {
    setUser(null);
    setIsPublished(false);
    localStorage.removeItem('pluto_user_session');
    localStorage.removeItem('pluto_protocol_published');
    setView('LANDING');
    setViewHistory(['LANDING']);
  };

  const handleOpenExplorer = (query: string = '') => {
    setExplorerQuery(query);
    navigateTo('GLOBAL_EXPLORER');
  };

  const renderContent = () => {
    if (view === 'GLOBAL_EXPLORER') {
      return (
        <GlobalExplorer 
          onBack={handleBack} 
          isPublished={isPublished} 
          user={user}
          initialQuery={explorerQuery}
          onSelectNode={(node) => {
            setSelectedNode(node);
            navigateTo('PUBLIC_NODE');
          }}
        />
      );
    }

    if (view === 'PUBLIC_NODE') {
      return <PublicNodeView node={selectedNode} onBack={handleBack} />;
    }

    if (!user) {
      if (view === 'AUTH') {
        return <AuthFlow 
          method={authMode.method} 
          role={authMode.role} 
          initialData={authMode.initialData}
          onBack={handleBack} 
          onComplete={handleAuthComplete} 
          addNotification={addNotification}
          peerRegistry={peerRegistry}
        />;
      }
      return <LandingPage 
        isPublished={isPublished}
        onStart={(role, method, initialData = '') => {
          setAuthMode({ method, role, initialData });
          navigateTo('AUTH');
        }} 
        onAdminSecret={handleAdminDirectLogin}
        onOpenExplorer={handleOpenExplorer}
      />;
    }

    switch (view) {
      case 'ADMIN':
        return user.role === UserRole.CREATOR ? (
          <AdminDashboard 
            user={user} 
            setUser={setUser} 
            peerRegistry={peerRegistry.map(p => ({ identifier: p.identifier, profile: p.profile }))}
            setPeerRegistry={setPeerRegistry as any}
            onPublish={() => {
              setIsPublished(true);
              addNotification('Protocol Published', 'Governance terminal is now live on the decentralized index.', 'EMAIL');
            }} 
            onViewPublic={() => {
              const tvl = user.wallet.balanceUsd + user.wallet.assets.reduce((acc, a) => acc + (a.amount * 2400), 0);
              setSelectedNode({ 
                id: user.web3Address || user.id, 
                name: (user.email?.split('@')[0].toUpperCase() || 'CREATOR') + ' PROTOCOL', 
                tvl: tvl === 0 ? '$0.00' : `$${tvl.toLocaleString()}`, 
                status: 'LIVE', 
                health: 100 
              });
              navigateTo('PUBLIC_NODE');
            }}
          />
        ) : null;
      case 'TRADE':
        return <TradeView user={user} setUser={setUser} addNotification={addNotification} />;
      case 'FOREX_PERPS':
        return <ForexPerps user={user} setUser={setUser} addNotification={addNotification} />;
      case 'WALLET':
        return <WalletView user={user} setUser={setUser} onConnect={() => setIsGlobalWalletSelectorOpen(true)} />;
      case 'SETTINGS':
        return <Settings user={user} setUser={setUser} addNotification={addNotification} />;
      case 'SECURITY_AI':
        return <SecurityAI user={user} />;
      case 'SUPPORT':
        return <SupportCenter />;
      case 'DASHBOARD':
      default:
        return <Dashboard user={user} onConnectWallet={() => setIsGlobalWalletSelectorOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-white selection:bg-indigo-500 selection:text-white relative">
      <SpeedInsights />
      {isGlobalWalletSelectorOpen && (
        <WalletSelector onSelect={handleGlobalWalletSelect} onClose={() => setIsGlobalWalletSelectorOpen(false)} />
      )}

      {/* Global Sync Overlay Trigger (Bottom Right Floating) */}
      {user && !user.web3Address && (
        <button 
          onClick={() => setIsGlobalWalletSelectorOpen(true)}
          className="fixed bottom-32 right-8 z-[150] px-10 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] italic shadow-[0_0_50px_rgba(79,70,229,0.6)] hover:bg-indigo-500 hover:scale-110 transition-all animate-bounce border-2 border-white/20"
        >
          Bridge_Node_✓
        </button>
      )}

      {/* Toast Overlay */}
      <div className="fixed top-8 right-8 z-[200] space-y-4 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="w-80 p-6 bg-slate-950/90 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex gap-4 animate-in slide-in-from-right-10 duration-500 pointer-events-auto">
            <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${n.type === 'EMAIL' ? 'bg-indigo-500/10 text-indigo-400' : n.type === 'SMS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
               {n.type === 'EMAIL' ? (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
               ) : n.type === 'SMS' ? (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
               ) : (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
               )}
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">{n.type === 'EMAIL' ? 'Protocol_Dispatch' : n.type === 'SMS' ? 'Handshake_Update' : 'Admin_Override'}</p>
              <h4 className="font-black text-white text-sm uppercase italic">{n.title}</h4>
              <p className="text-[10px] leading-relaxed text-slate-400">{n.message}</p>
            </div>
          </div>
        ))}
      </div>

      {isPublished && !['LANDING', 'GLOBAL_EXPLORER', 'PUBLIC_NODE', 'AUTH'].includes(view) && (
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500 animate-pulse sticky top-0 z-[60]"></div>
      )}

      {viewHistory.length > 1 && (
        <button 
          onClick={handleBack}
          className="fixed top-8 left-8 z-[100] w-14 h-14 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:scale-105 transition-all shadow-2xl group animate-in slide-in-from-left-10 duration-500"
        >
          <svg className="w-6 h-6 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </button>
      )}

      {user && !['GLOBAL_EXPLORER', 'PUBLIC_NODE'].includes(view) && (
        <>
          <Navbar 
            user={user} 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            onNavigate={(v) => navigateTo(v as AppView)} 
            onLogout={handleLogout} 
            isPublished={isPublished} 
            onConnectWallet={() => setIsGlobalWalletSelectorOpen(true)}
          />
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} user={user} onNavigate={(v) => navigateTo(v as AppView)} onLogout={handleLogout} currentView={view} />
        </>
      )}
      
      <main className={`flex-1 transition-all duration-500 ${ (user && !['GLOBAL_EXPLORER', 'PUBLIC_NODE', 'LANDING', 'AUTH'].includes(view)) ? 'md:ml-64 p-4 md:p-8' : ''}`}>
        <div className="max-w-7xl mx-auto h-full">
          {renderContent()}
        </div>
      </main>

      {user && !['AUTH', 'LANDING', 'GLOBAL_EXPLORER'].includes(view) && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] w-full max-w-lg px-6 animate-in slide-in-from-bottom-10 duration-700">
           <div className="bg-slate-950/80 backdrop-blur-3xl border border-white/5 p-2 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex items-center justify-between relative overflow-visible">
              <button onClick={() => navigateTo(user.role === UserRole.CREATOR ? 'ADMIN' : 'DASHBOARD')} className={`flex-1 py-4 flex flex-col items-center gap-1 rounded-[1.5rem] transition-all ${['DASHBOARD', 'ADMIN'].includes(view) ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-300'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                <span className="text-[8px] font-black uppercase tracking-widest italic">Home</span>
              </button>
              <button onClick={() => navigateTo('FOREX_PERPS')} className={`flex-1 py-4 flex flex-col items-center gap-1 rounded-[1.5rem] transition-all ${view === 'FOREX_PERPS' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-300'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2v2m0 16v2m10-10h-2M4 12H2"/></svg>
                <span className="text-[8px] font-black uppercase tracking-widest italic">Forex</span>
              </button>
              <button onClick={() => navigateTo('WALLET')} className={`flex-1 py-4 flex flex-col items-center gap-1 rounded-[1.5rem] transition-all ${view === 'WALLET' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-300'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                <span className="text-[8px] font-black uppercase tracking-widest italic">Vault</span>
              </button>
              <div className="relative">
                <button onClick={() => setIsAdvancedOpen(!isAdvancedOpen)} className={`flex-1 px-8 py-4 flex flex-col items-center gap-1 rounded-[1.5rem] transition-all ${isAdvancedOpen ? 'bg-white text-slate-950' : 'text-slate-600 hover:text-slate-300'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                  <span className="text-[8px] font-black uppercase tracking-widest italic">Docs</span>
                </button>
                {isAdvancedOpen && (
                  <div className="absolute bottom-24 right-0 w-64 bg-slate-950 border border-white/10 rounded-[2.5rem] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-200">
                     <div className="space-y-2">
                        <button onClick={() => navigateTo('SECURITY_AI')} className="w-full flex items-center gap-4 p-4 hover:bg-indigo-600 rounded-2xl transition-all group">
                           <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:text-white">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                           </div>
                           <span className="text-xs font-black uppercase tracking-widest italic">Sovereign AI</span>
                        </button>
                        <button onClick={() => navigateTo('SUPPORT')} className="w-full flex items-center gap-4 p-4 hover:bg-indigo-600 rounded-2xl transition-all group">
                           <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:text-white">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                           </div>
                           <span className="text-xs font-black uppercase tracking-widest italic">Cluster Help</span>
                        </button>
                     </div>
                  </div>
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
