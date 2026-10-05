import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/public/Navbar';
import { Footer } from './components/public/Footer';
import { Home } from './components/public/Home';
import { ProductPage } from './components/public/ProductPage';
import { SolutionsPage } from './components/public/SolutionsPage';
import { PricingPage } from './components/public/PricingPage';
import { ResourcesPage } from './components/public/ResourcesPage';
import { AboutContactPage } from './components/public/AboutContactPage';
import { AuthModal } from './components/auth/AuthModal';

import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { CreateAgentBuilder } from './components/dashboard/CreateAgentBuilder';
import { CallLogsView } from './components/dashboard/CallLogsView';
import { LeadsView } from './components/dashboard/LeadsView';
import { WebVoiceView } from './components/dashboard/WebVoiceView';
import { AgentsListView } from './components/dashboard/AgentsListView';
import { PhoneNumbersView } from './components/dashboard/PhoneNumbersView';
import { CampaignsView } from './components/dashboard/CampaignsView';
import { KnowledgeBaseView } from './components/dashboard/KnowledgeBaseView';
import { IntegrationsView } from './components/dashboard/IntegrationsView';
import { AnalyticsView } from './components/dashboard/AnalyticsView';
import { BillingView } from './components/dashboard/BillingView';
import { SettingsView } from './components/dashboard/SettingsView';
import { CallSchedulingView } from './components/dashboard/CallSchedulingView';
import { AgentPerformanceView } from './components/dashboard/AgentPerformanceView';
import { CloneVoiceView } from './components/dashboard/CloneVoiceView';
import { WhatsAppNumbersView } from './components/dashboard/WhatsAppNumbersView';
import { BroadcastCampaignView } from './components/dashboard/BroadcastCampaignView';
import { DirectPhoneCallModal } from './components/dashboard/DirectPhoneCallModal';

import { aurisApi } from './services/apiService';
import {
  subscribeAuthState,
  firebaseSignOut,
} from './services/firebase';
import {
  mockBusinesses,
  mockAgents,
  mockCalls,
  mockScheduledCalls,
  mockPhoneNumbers,
  mockCampaigns,
  mockKnowledgeItems,
} from './services/mockData';
import { User, Business, Agent, Call, PhoneNumber, Campaign, KnowledgeItem, ScheduledCall } from './types';

function AppContent() {
  // App navigation modes
  const [appMode, setAppMode] = useState<'public' | 'dashboard'>('public');
  const [publicPage, setPublicPage] = useState<'home' | 'product' | 'solutions' | 'pricing' | 'resources' | 'about'>('home');
  const [dashboardView, setDashboardView] = useState<string>('dashboard');

  // Auth Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isDirectCallOpen, setIsDirectCallOpen] = useState(false);

  // Authenticated User & Workspace State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentBusiness, setCurrentBusiness] = useState<Business>(mockBusinesses[0]);
  const [availableBusinesses, setAvailableBusinesses] = useState<Business[]>(mockBusinesses);
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [calls, setCalls] = useState<Call[]>(mockCalls);
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>(mockScheduledCalls);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>(mockPhoneNumbers);
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>(mockKnowledgeItems);
  const [billingInfo, setBillingInfo] = useState<any>(null);

  // Sync with real backend architecture on mount
  useEffect(() => {
    let isMounted = true;
    aurisApi
      .getBootstrapData()
      .then((data) => {
        if (!isMounted) return;
        if (data.business) {
          setCurrentBusiness(data.business);
          setAvailableBusinesses([data.business]);
        }
        if (data.agents && Array.isArray(data.agents)) {
          setAgents(data.agents);
        }
        if (data.calls && Array.isArray(data.calls)) {
          setCalls(data.calls);
        }
        if (data.scheduledCalls && Array.isArray(data.scheduledCalls)) {
          setScheduledCalls(data.scheduledCalls);
        }
        if (data.phoneNumbers && Array.isArray(data.phoneNumbers)) {
          setPhoneNumbers(data.phoneNumbers);
        }
        if (data.campaigns && Array.isArray(data.campaigns)) {
          setCampaigns(data.campaigns);
        }
        if (data.knowledgeItems && Array.isArray(data.knowledgeItems)) {
          setKnowledgeItems(data.knowledgeItems);
        }
        if (data.billing) {
          setBillingInfo(data.billing);
        }
      })
      .catch((err) => {
        console.warn('Backend API bootstrap sync note:', err);
      });

    // Listen to Firebase Authentication state changes
    const unsubscribeAuth = subscribeAuthState((fbUser) => {
      if (isMounted) {
        if (fbUser) {
          setCurrentUser(fbUser);
          setAppMode('dashboard');
        } else {
          setCurrentUser(null);
          setAppMode('public');
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, []);

  // Authentication Handlers
  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
    setAppMode('dashboard');
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut();
    } catch (e) {
      console.warn('Firebase signout note:', e);
    }
    setCurrentUser(null);
    setAppMode('public');
    setPublicPage('home');
  };

  // Agent handlers with backend persistence
  const handleSaveNewAgent = async (newAgent: Agent) => {
    try {
      const saved = await aurisApi.createAgent(newAgent);
      setAgents((prev) => [saved, ...prev]);
    } catch {
      setAgents((prev) => [newAgent, ...prev]);
    }
    setDashboardView('agents');
  };

  const handleToggleAgentStatus = async (agentId: string) => {
    const current = agents.find((a) => a.id === agentId);
    const newStatus = current?.status === 'active' ? 'paused' : 'active';

    setAgents((prev) =>
      prev.map((ag) => (ag.id === agentId ? { ...ag, status: newStatus } : ag))
    );

    try {
      await aurisApi.updateAgent(agentId, { status: newStatus });
    } catch (e) {
      console.error('Failed to update agent status on backend:', e);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== agentId));
    try {
      await aurisApi.deleteAgent(agentId);
    } catch (e) {
      console.error('Failed to delete agent on backend:', e);
    }
  };

  // Call Dispatch
  const handleDispatchCall = async (params: {
    agentId: string;
    callerName?: string;
    callerNumber?: string;
    scenario?: string;
  }) => {
    const newCall = await aurisApi.dispatchCall(params);
    setCalls((prev) => [newCall, ...prev]);
    return newCall;
  };

  // Phone Number Handlers
  const handleAssignAgentToPhone = async (phoneId: string, agentId: string) => {
    const targetAgent = agents.find((a) => a.id === agentId);
    setPhoneNumbers((prev) =>
      prev.map((p) =>
        p.id === phoneId
          ? { ...p, assignedAgentId: agentId, assignedAgentName: targetAgent?.name }
          : p
      )
    );
  };

  const handleAddPhoneNumber = async (newNumber: any) => {
    try {
      const created = await aurisApi.provisionPhoneNumber(newNumber);
      setPhoneNumbers((prev) => [created, ...prev]);
    } catch {
      setPhoneNumbers((prev) => [newNumber, ...prev]);
    }
  };

  // Campaign handlers
  const handleCreateCampaign = async (newCamp: Campaign) => {
    setCampaigns((prev) => [newCamp, ...prev]);
  };

  const handleToggleCampaign = async (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'running' ? 'paused' : 'running' }
          : c
      )
    );
  };

  const handleStepCampaign = async (campaignId: string) => {
    const result = await aurisApi.stepCampaign(campaignId);
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? result.campaign : c))
    );
    if (result.newCall) {
      setCalls((prev) => [result.newCall, ...prev]);
    }
    return result;
  };

  // Billing Topup Handler
  const handleTopupMinutes = async (minutes: number, amount?: number) => {
    const updated = await aurisApi.topupMinutes(minutes, amount);
    setBillingInfo(updated);
    return updated;
  };

  // Knowledge handlers
  const handleAddKnowledgeItem = (newItem: KnowledgeItem) => {
    setKnowledgeItems((prev) => [newItem, ...prev]);
  };

  const handleDeleteKnowledgeItem = (id: string) => {
    setKnowledgeItems((prev) => prev.filter((k) => k.id !== id));
  };

  // ==========================================
  // RENDER: DASHBOARD VIEW (AUTHENTICATED ONLY)
  // ==========================================
  if (appMode === 'dashboard') {
    if (!currentUser) {
      // Must be authenticated to view dashboard
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Workspace Authentication Required</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in with your Google workspace account or credentials to access your live voice agents and call telemetry.
            </p>
            <button
              onClick={() => handleOpenAuth('login')}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
            >
              Sign In to Continue
            </button>
            <button
              onClick={() => setAppMode('public')}
              className="text-xs text-slate-400 hover:text-slate-200 hover:underline block mx-auto cursor-pointer"
            >
              ← Return to Public Website
            </button>
          </div>
          <AuthModal
            isOpen={authModalOpen}
            initialMode={authModalMode}
            onClose={() => setAuthModalOpen(false)}
            onSuccess={handleLoginSuccess}
          />
        </div>
      );
    }

    return (
      <DashboardLayout
        currentView={dashboardView}
        onSelectView={(view) => setDashboardView(view)}
        currentUser={currentUser}
        currentBusiness={currentBusiness}
        availableBusinesses={availableBusinesses}
        onSelectBusiness={(biz) => setCurrentBusiness(biz)}
        onLogout={handleLogout}
        onOpenAuth={(mode) => handleOpenAuth(mode)}
        onBackToWebsite={() => {
          setAppMode('public');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCreateAgent={() => setDashboardView('create-agent')}
        onOpenWebVoice={() => setDashboardView('web-voice')}
        onOpenDirectCall={() => setIsDirectCallOpen(true)}
      >
        {dashboardView === 'dashboard' && (
          <DashboardHome
            agents={agents}
            calls={calls}
            currentUser={currentUser}
            onOpenCreateAgent={() => setDashboardView('create-agent')}
            onNavigateToCalls={() => setDashboardView('calls')}
            onNavigateToAgents={() => setDashboardView('agents')}
            onOpenCallDetails={() => setDashboardView('calls')}
            onOpenWebVoice={() => setDashboardView('web-voice')}
            onDispatchCall={handleDispatchCall}
            onNavigateToScheduling={() => setDashboardView('call-scheduling')}
            onNavigateToPerformance={() => setDashboardView('agent-performance')}
          />
        )}

        {dashboardView === 'agents' && (
          <AgentsListView
            agents={agents}
            onOpenCreateAgent={() => setDashboardView('create-agent')}
            onOpenWebVoiceWithAgent={() => setDashboardView('web-voice')}
            onToggleAgentStatus={handleToggleAgentStatus}
            onDeleteAgent={handleDeleteAgent}
            onOpenDirectCallWithAgent={() => setIsDirectCallOpen(true)}
          />
        )}

        {dashboardView === 'call-scheduling' && (
          <CallSchedulingView
            scheduledCalls={scheduledCalls}
            agents={agents}
            onRefreshCalls={() => {
              aurisApi.getScheduledCalls().then((sc) => {
                if (sc) setScheduledCalls(sc);
              });
              aurisApi.getCalls().then((c) => {
                if (c) setCalls(c);
              });
            }}
            onCallTriggered={(newCall) => {
              setCalls((prev) => [newCall, ...prev]);
            }}
          />
        )}

        {dashboardView === 'agent-performance' && (
          <AgentPerformanceView
            agents={agents}
            onSelectAgent={() => setDashboardView('agents')}
          />
        )}

        {dashboardView === 'create-agent' && (
          <CreateAgentBuilder
            onBack={() => setDashboardView('agents')}
            onSaveAgent={handleSaveNewAgent}
            availableKnowledge={knowledgeItems}
          />
        )}

        {dashboardView === 'calls' && (
          <CallLogsView
            calls={calls}
            agents={agents}
            onDispatchCall={handleDispatchCall}
          />
        )}

        {dashboardView === 'leads' && (
          <LeadsView
            agents={agents}
            onDispatchCall={handleDispatchCall}
            onNavigateToCreateAgent={() => setDashboardView('create-agent')}
          />
        )}

        {dashboardView === 'web-voice' && (
          <WebVoiceView
            agents={agents}
            onCallFinished={(newCall) => {
              setCalls((prev) => [newCall, ...prev]);
            }}
          />
        )}

        {dashboardView === 'phone-numbers' && (
          <PhoneNumbersView
            phoneNumbers={phoneNumbers}
            agents={agents}
            onAssignAgent={handleAssignAgentToPhone}
            onAddNumber={handleAddPhoneNumber}
            onDispatchCall={handleDispatchCall}
          />
        )}

        {dashboardView === 'campaigns' && (
          <CampaignsView
            campaigns={campaigns}
            agents={agents}
            onCreateCampaign={handleCreateCampaign}
            onToggleCampaign={handleToggleCampaign}
            onStepCampaign={handleStepCampaign}
          />
        )}

        {dashboardView === 'knowledge' && (
          <KnowledgeBaseView
            knowledgeItems={knowledgeItems}
            onAddItem={handleAddKnowledgeItem}
            onDeleteItem={handleDeleteKnowledgeItem}
            calls={calls}
          />
        )}

        {dashboardView === 'integrations' && <IntegrationsView />}

        {dashboardView === 'analytics' && <AnalyticsView calls={calls} />}

        {dashboardView === 'billing' && (
          <BillingView
            calls={calls}
            billingInfo={billingInfo}
            onTopup={handleTopupMinutes}
          />
        )}

        {dashboardView === 'settings' && (
          <SettingsView business={currentBusiness} currentUser={currentUser} />
        )}

        {dashboardView === 'clone-voice' && <CloneVoiceView />}

        {dashboardView === 'whatsapp' && <WhatsAppNumbersView />}

        {dashboardView === 'broadcast' && <BroadcastCampaignView />}

        {/* Direct Phone Call Modal */}
        <DirectPhoneCallModal
          isOpen={isDirectCallOpen}
          onClose={() => setIsDirectCallOpen(false)}
          agents={agents}
          onCallDispatched={(newCall) => {
            setCalls((prev) => [newCall, ...prev]);
          }}
        />
      </DashboardLayout>
    );
  }

  // ==========================================
  // RENDER: PUBLIC MARKETING SITE
  // ==========================================
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A1120] flex flex-col font-sans text-[#123047] dark:text-[#F1F5F9] transition-colors duration-200">
      {/* Public Top Navbar */}
      <Navbar
        currentTab={publicPage}
        currentUser={currentUser}
        onNavigate={(tab: string) => {
          if (tab === 'dashboard') {
            if (currentUser) {
              setAppMode('dashboard');
            } else {
              handleOpenAuth('login');
            }
          } else {
            setPublicPage(tab as any);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onOpenAuth={(mode) => handleOpenAuth(mode)}
        onLogout={handleLogout}
      />

      {/* Main Public Page Content with Page Transition */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={publicPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {publicPage === 'home' && (
              <Home
                onGetStarted={() => {
                  if (currentUser) {
                    setAppMode('dashboard');
                  } else {
                    handleOpenAuth('signup');
                  }
                }}
                onWatchDemo={() => {
                  setPublicPage('product');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onExploreIndustry={() => {
                  setPublicPage('solutions');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenDashboard={() => {
                  if (currentUser) {
                    setAppMode('dashboard');
                  } else {
                    handleOpenAuth('signup');
                  }
                }}
              />
            )}

            {publicPage === 'product' && (
              <ProductPage
                onGetStarted={() => {
                  if (currentUser) {
                    setAppMode('dashboard');
                  } else {
                    handleOpenAuth('signup');
                  }
                }}
                onOpenPlayground={() => {
                  if (currentUser) {
                    setAppMode('dashboard');
                    setDashboardView('web-voice');
                  } else {
                    handleOpenAuth('signup');
                  }
                }}
              />
            )}

            {publicPage === 'solutions' && (
              <SolutionsPage
                onSelectSolution={() => {
                  if (currentUser) {
                    setAppMode('dashboard');
                  } else {
                    handleOpenAuth('signup');
                  }
                }}
                onGetStarted={() => {
                  if (currentUser) {
                    setAppMode('dashboard');
                  } else {
                    handleOpenAuth('signup');
                  }
                }}
              />
            )}

            {publicPage === 'pricing' && (
              <PricingPage
                onSelectPlan={() => {
                  if (currentUser) {
                    setAppMode('dashboard');
                    setDashboardView('billing');
                  } else {
                    handleOpenAuth('signup');
                  }
                }}
              />
            )}

            {publicPage === 'resources' && <ResourcesPage />}

            {publicPage === 'about' && <AboutContactPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Public Footer */}
      <Footer
        onNavigate={(page: string) => {
          setPublicPage(page as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={(mode) => handleOpenAuth(mode)}
      />

      {/* Global Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
