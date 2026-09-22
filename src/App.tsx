/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

import { aurisApi } from './services/apiService';
import {
  mockCurrentUser,
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

  // Dynamic Live State initialized with safe presets, then synced with backend API
  const [currentUser, setCurrentUser] = useState<User>(mockCurrentUser);
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
        if (data.agents && data.agents.length > 0) {
          setAgents(data.agents);
        }
        if (data.calls && data.calls.length > 0) {
          setCalls(data.calls);
        }
        if (data.scheduledCalls && data.scheduledCalls.length > 0) {
          setScheduledCalls(data.scheduledCalls);
        }
        if (data.phoneNumbers && data.phoneNumbers.length > 0) {
          setPhoneNumbers(data.phoneNumbers);
        }
        if (data.campaigns && data.campaigns.length > 0) {
          setCampaigns(data.campaigns);
        }
        if (data.knowledgeItems && data.knowledgeItems.length > 0) {
          setKnowledgeItems(data.knowledgeItems);
        }
        if (data.billing) {
          setBillingInfo(data.billing);
        }
      })
      .catch((err) => {
        console.warn('Backend API bootstrap sync note:', err);
      });

    // Also fetch scheduled calls specifically to ensure up-to-date state
    aurisApi
      .getScheduledCalls()
      .then((sc) => {
        if (isMounted && sc && sc.length > 0) {
          setScheduledCalls(sc);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Actions
  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setAppMode('dashboard');
  };

  const handleLogout = () => {
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
    setAgents((prev) => prev.filter((ag) => ag.id !== agentId));
    try {
      await aurisApi.deleteAgent(agentId);
    } catch (e) {
      console.error('Failed to delete agent on backend:', e);
    }
  };

  // Carrier Telephony Dispatch Call Handler
  const handleDispatchCall = async (params: {
    agentId: string;
    callerName?: string;
    callerNumber?: string;
    scenario?: string;
  }): Promise<Call> => {
    const createdCall = await aurisApi.dispatchCall(params);
    setCalls((prev) => [createdCall, ...prev]);

    // Update agent call count
    setAgents((prev) =>
      prev.map((ag) =>
        ag.id === params.agentId ? { ...ag, callsCount: ag.callsCount + 1 } : ag
      )
    );

    return createdCall;
  };

  // Phone handlers
  const handleAssignAgentToPhone = async (phoneId: string, agentId: string) => {
    setPhoneNumbers((prev) =>
      prev.map((pn) => (pn.id === phoneId ? { ...pn, assignedAgentId: agentId } : pn))
    );
  };

  const handleAddPhoneNumber = async (newNumber: PhoneNumber) => {
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
  // RENDER: DASHBOARD VIEW
  // ==========================================
  if (appMode === 'dashboard') {
    return (
      <DashboardLayout
        currentView={dashboardView}
        onSelectView={(view) => setDashboardView(view)}
        currentUser={currentUser}
        currentBusiness={currentBusiness}
        availableBusinesses={availableBusinesses}
        onSelectBusiness={(biz) => setCurrentBusiness(biz)}
        onLogout={handleLogout}
        onBackToWebsite={() => {
          setAppMode('public');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCreateAgent={() => setDashboardView('create-agent')}
        onOpenWebVoice={() => setDashboardView('web-voice')}
      >
        {dashboardView === 'dashboard' && (
          <DashboardHome
            agents={agents}
            calls={calls}
            onOpenCreateAgent={() => setDashboardView('create-agent')}
            onNavigateToCalls={() => setDashboardView('calls')}
            onNavigateToAgents={() => setDashboardView('agents')}
            onOpenCallDetails={() => {
              setDashboardView('calls');
            }}
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
            onSelectAgent={() => {
              setDashboardView('agents');
            }}
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

        {dashboardView === 'architecture' && <ResourcesPage />}

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
        onNavigate={(tab: string) => {
          setPublicPage(tab as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={(mode) => handleOpenAuth(mode)}
        onEnterDemoDashboard={() => setAppMode('dashboard')}
      />

      {/* Main Public Page Content with Page Transition */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={publicPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            {publicPage === 'home' && (
              <Home
                onGetStarted={() => handleOpenAuth('signup')}
                onWatchDemo={() => {
                  setPublicPage('product');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onExploreIndustry={() => {
                  setPublicPage('solutions');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenDashboard={() => setAppMode('dashboard')}
              />
            )}

            {publicPage === 'product' && (
              <ProductPage
                onGetStarted={() => handleOpenAuth('signup')}
                onOpenPlayground={() => {
                  setAppMode('dashboard');
                  setDashboardView('web-voice');
                }}
              />
            )}

            {publicPage === 'solutions' && (
              <SolutionsPage
                onSelectSolution={() => handleOpenAuth('signup')}
                onGetStarted={() => handleOpenAuth('signup')}
              />
            )}

            {publicPage === 'pricing' && (
              <PricingPage
                onSelectPlan={() => handleOpenAuth('signup')}
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
