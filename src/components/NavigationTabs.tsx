import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Building2,
  Cpu,
  Link2,
  Radio,
  Sliders,
  Layers,
  CalendarClock,
  Wrench,
  Bell,
  FileSpreadsheet,
  ShieldCheck,
  HardHat
} from 'lucide-react';
import { Role } from '../types';

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onChangeTab?: (tab: string) => void;
  unreadAlertsCount?: number;
  alertsCount?: number;
  currentRole?: Role;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  setActiveTab,
  onChangeTab,
  unreadAlertsCount,
  alertsCount,
  currentRole = 'Administrador'
}) => {
  const handleTabClick = (tabId: string) => {
    if (onChangeTab) onChangeTab(tabId);
    if (setActiveTab) setActiveTab(tabId);
  };

  const badgeValue = unreadAlertsCount !== undefined ? unreadAlertsCount : (alertsCount || 0);

  const allTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Mapa Inteligente', icon: MapPin },
    { id: 'poles', label: 'Postes', icon: Building2 },
    { id: 'nodes', label: 'Nódulos', icon: Cpu },
    { id: 'pairing', label: 'Vinculação', icon: Link2 },
    { id: 'gateways', label: 'Gateways', icon: Radio },
    { id: 'individual', label: 'Controle Individual', icon: Sliders },
    { id: 'batch', label: 'Controle em Massa', icon: Layers },
    { id: 'automations', label: 'Automações', icon: CalendarClock },
    { id: 'maintenance', label: 'Manutenção', icon: Wrench },
    { id: 'alerts', label: 'Alertas', icon: Bell, badge: badgeValue },
    { id: 'reports', label: 'Relatórios', icon: FileSpreadsheet },
    { id: 'security', label: 'Segurança & Usuários', icon: ShieldCheck }
  ];

  // Técnico access restrictions: only field infrastructure & maintenance
  const isTechnician = currentRole === 'Técnico';
  const technicianAllowedTabs = ['map', 'poles', 'nodes', 'pairing', 'gateways', 'maintenance'];

  const visibleTabs = isTechnician
    ? allTabs.filter((t) => technicianAllowedTabs.includes(t.id))
    : allTabs;

  return (
    <div className="bg-slate-900 border-b border-slate-800 overflow-x-auto no-scrollbar shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <nav className="flex space-x-1 sm:space-x-1.5 py-2.5 min-w-max">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {isActive ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  ) : (
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
                  )}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                        isActive ? 'bg-blue-500 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {isTechnician && (
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[11px] font-bold text-amber-300">
              <HardHat className="w-3.5 h-3.5 text-amber-400" />
              <span>Modo Técnico: Foco em Infraestrutura e Manutenção de Campo</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
