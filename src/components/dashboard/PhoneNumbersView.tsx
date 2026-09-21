import React, { useState } from 'react';
import { PhoneNumber, Agent, Call } from '../../types';
import {
  Phone,
  Plus,
  CheckCircle2,
  Globe,
  Shield,
  RefreshCw,
  X,
  Radio,
  Zap,
  PhoneCall,
  Volume2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface PhoneNumbersViewProps {
  phoneNumbers: PhoneNumber[];
  agents: Agent[];
  onAssignAgent: (phoneId: string, agentId: string) => void;
  onAddNumber: (newNumber: PhoneNumber) => void;
  onDispatchCall?: (params: { agentId: string; callerName?: string; callerNumber?: string; scenario?: string }) => Promise<Call>;
}

export const PhoneNumbersView: React.FC<PhoneNumbersViewProps> = ({
  phoneNumbers,
  agents,
  onAssignAgent,
  onAddNumber,
  onDispatchCall,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<'IN' | 'US' | 'GB' | 'SG'>('IN');
  const [friendlyName, setFriendlyName] = useState('New Inbound Reception Line');
  const [assignedAgentId, setAssignedAgentId] = useState(agents[0]?.id || '');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [testingPhoneId, setTestingPhoneId] = useState<string | null>(null);
  const [testNotification, setTestNotification] = useState<string | null>(null);

  const handleBuyNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProvisioning(true);

    try {
      const assignedAgent = agents.find((a) => a.id === assignedAgentId);
      let generatedNumber = '+91 80 4719 ' + (3300 + phoneNumbers.length);
      if (selectedCountry === 'US') {
        generatedNumber = '+1 (800) 459-' + (2900 + phoneNumbers.length);
      } else if (selectedCountry === 'GB') {
        generatedNumber = '+44 20 7946 ' + (990 + phoneNumbers.length);
      } else if (selectedCountry === 'SG') {
        generatedNumber = '+65 6789 ' + (1100 + phoneNumbers.length);
      }

      const newNum: PhoneNumber = {
        id: `phone_${Date.now()}`,
        businessId: 'biz_apollo_01',
        number: generatedNumber,
        country: selectedCountry,
        friendlyName: friendlyName || 'Dedicated Clinical Inbound Line',
        status: 'active',
        direction: 'both',
        assignedAgentId,
        assignedAgentName: assignedAgent?.name,
        forwardingNumber: '+91 80 4719 3205',
        provider: 'OmniDimension',
        providerNumberId: `omni_num_${selectedCountry.toLowerCase()}_${Date.now()}`,
        monthlyCost: selectedCountry === 'US' ? 20 : 15,
      };

      onAddNumber(newNum);
      setIsProvisioning(false);
      setIsModalOpen(false);
      setTestNotification(`Number ${generatedNumber} provisioned on OmniDimension trunk and assigned to ${assignedAgent?.name || 'Agent'}!`);
      setTimeout(() => setTestNotification(null), 4000);
    } catch (err: any) {
      setIsProvisioning(false);
      alert('Failed to provision carrier number: ' + err.message);
    }
  };

  const handleSimulateInboundCall = async (pn: PhoneNumber) => {
    if (!onDispatchCall) return;
    setTestingPhoneId(pn.id);
    try {
      const targetAgentId = pn.assignedAgentId || agents[0]?.id;
      const agent = agents.find((a) => a.id === targetAgentId) || agents[0];
      await onDispatchCall({
        agentId: agent.id,
        callerName: 'Sunita Mehra (Patient)',
        callerNumber: '+91 98450 77665',
        scenario: `Incoming consultation call to ${pn.friendlyName || pn.number}`,
      });
      setTestingPhoneId(null);
      setTestNotification(`Inbound test call received on ${pn.number}! Connected to ${agent.name} and logged in Call Logs.`);
      setTimeout(() => setTestNotification(null), 4000);
    } catch (err: any) {
      setTestingPhoneId(null);
      alert('Inbound test call failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. TITLE HEADER & CARRIER TRUNK SUMMARY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#123047] tracking-tight">Dedicated Carrier Phone Numbers</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFFAF1] text-[#38A85B] border border-[#65C978]/30 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              OmniDimension Tier-1 Gateway
            </span>
          </div>
          <p className="text-xs text-[#52636D] mt-0.5">
            Provision local Bangalore DIDs, US toll-free lines, or international numbers with instant AI agent routing.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#38A85B] hover:bg-[#2f8f4d] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          Provision New Number
        </button>
      </div>

      {/* Notification banner */}
      {testNotification && (
        <div className="p-4 rounded-2xl bg-[#EFFAF1] border border-[#65C978]/40 text-xs font-semibold text-[#123047] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#38A85B] shrink-0" />
          <span>{testNotification}</span>
        </div>
      )}

      {/* 2. NUMBERS TABLE */}
      <div className="bg-white rounded-2xl border border-[#DDEBEF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5FAFC] border-b border-[#DDEBEF] text-[#82919A] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-6">Phone Number & Label</th>
                <th className="py-3.5 px-6">Assigned AI Agent</th>
                <th className="py-3.5 px-6">Country / Provider</th>
                <th className="py-3.5 px-6">Carrier Status</th>
                <th className="py-3.5 px-6 text-right">Inbound Test & Fallback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDEBEF] text-[#123047]">
              {phoneNumbers.map((pn) => {
                const isTesting = testingPhoneId === pn.id;
                return (
                  <tr key={pn.id} className="hover:bg-[#F5FAFC] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#123047]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#EEF8FC] text-[#2189C8] flex items-center justify-center">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-mono font-bold text-[#123047]">{pn.number}</p>
                          <p className="text-[11px] font-sans font-normal text-[#82919A]">{pn.friendlyName || 'Main Center Line'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <select
                        value={pn.assignedAgentId || ''}
                        onChange={(e) => onAssignAgent(pn.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#DDEBEF] text-xs font-semibold text-[#123047] bg-white focus:outline-none focus:border-[#2189C8]"
                      >
                        <option value="">Unassigned</option>
                        {agents.map((ag) => (
                          <option key={ag.id} value={ag.id}>
                            {ag.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#123047]">
                          {pn.country === 'IN' ? '🇮🇳 India (+91)' : pn.country === 'US' ? '🇺🇸 US (+1)' : pn.country === 'GB' ? '🇬🇧 UK (+44)' : '🇸🇬 Singapore'}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#82919A] font-mono mt-0.5">
                        {pn.provider || 'OmniDimension'}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#38A85B] bg-[#EFFAF1] px-2 py-0.5 rounded-full border border-[#65C978]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#38A85B] animate-pulse" />
                        SIP Trunk Active
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSimulateInboundCall(pn)}
                          disabled={isTesting}
                          className="px-3 py-1.5 rounded-xl bg-[#EEF8FC] hover:bg-[#2189C8] text-[#2189C8] hover:text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Simulate inbound patient call"
                        >
                          {isTesting ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              Dialing In...
                            </>
                          ) : (
                            <>
                              <PhoneCall className="w-3 h-3" />
                              Test Inbound Call
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. PROVISION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#123047]/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#DDEBEF] relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-[#82919A] hover:text-[#123047]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#123047] mb-1">Provision Dedicated DID Number</h3>
            <p className="text-xs text-[#52636D] mb-5">
              Instantly allocate a clean carrier telephone number mapped to an Auris AI voice agent.
            </p>

            <form onSubmit={handleBuyNumber} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#123047] mb-1">Country / Region</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { code: 'IN', label: '🇮🇳 India (+91)' },
                    { code: 'US', label: '🇺🇸 USA Toll-Free' },
                    { code: 'GB', label: '🇬🇧 UK (+44)' },
                    { code: 'SG', label: '🇸🇬 Singapore (+65)' },
                  ].map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setSelectedCountry(c.code as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                        selectedCountry === c.code
                          ? 'border-[#2189C8] bg-[#EEF8FC] text-[#2189C8]'
                          : 'border-[#DDEBEF] text-[#52636D] hover:bg-[#F5FAFC]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123047] mb-1">Line Purpose / Friendly Name</label>
                <input
                  type="text"
                  required
                  value={friendlyName}
                  onChange={(e) => setFriendlyName(e.target.value)}
                  placeholder="e.g. Apollo Diagnostics Bangalore"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DDEBEF] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123047] mb-1">Assign to Voice Agent</label>
                <select
                  value={assignedAgentId}
                  onChange={(e) => setAssignedAgentId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DDEBEF] text-xs"
                >
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.voiceName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F5FAFC] border border-[#DDEBEF] text-xs text-[#52636D] space-y-1">
                <div className="flex justify-between font-bold text-[#123047]">
                  <span>Monthly Carrier Fee</span>
                  <span>{selectedCountry === 'US' ? '$20.00 / month' : '$15.00 / month'}</span>
                </div>
                <p className="text-[11px] text-[#82919A]">
                  Includes inbound SIP termination, caller-ID validation, and sub-280ms latency routing.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#DDEBEF] text-xs font-bold text-[#52636D] hover:bg-[#F5FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProvisioning}
                  className="flex-1 py-2.5 rounded-xl bg-[#38A85B] hover:bg-[#2f8f4d] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isProvisioning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Provisioning DID...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirm & Allocate
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
