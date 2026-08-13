import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  ShieldAlert,
  Bell,
  Cpu,
  Radio,
  UserCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  SlidersHorizontal,
  X,
  HardHat,
  Shield,
  User,
  LogOut
} from 'lucide-react';
import { Role, EmergencyState, SystemAlert, UserAccount } from '../types';

interface HeaderBarProps {
  currentRole?: Role;
  onRoleChange?: (role: Role) => void;
  currentUser?: UserAccount;
  users?: UserAccount[];
  onSelectUser?: (user: UserAccount) => void;
  onOpenUserRegistration?: () => void;
  onLogout?: () => void;
  emergencyState?: EmergencyState;
  onOpenEmergencyModal?: () => void;
  alerts?: SystemAlert[];
  unreadAlertsCount?: number;
  onOpenAlerts?: () => void;
  connectedNodesCount?: number;
  gatewaysOnlineCount?: number;
  totalGatewaysCount?: number;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentRole = 'Administrador',
  onRoleChange,
  currentUser,
  users = [],
  onSelectUser,
  onOpenUserRegistration,
  onLogout,
  emergencyState = { active: false } as EmergencyState,
  onOpenEmergencyModal,
  alerts = [],
  unreadAlertsCount,
  onOpenAlerts,
  connectedNodesCount = 0,
  gatewaysOnlineCount = 0,
  totalGatewaysCount = 0,
  activeTab = 'dashboard',
  setActiveTab
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
          ' ' +
          now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof unreadAlertsCount === 'number') {
      setUnreadCount(unreadAlertsCount);
    } else {
      setUnreadCount((alerts || []).filter((a) => !a.read).length);
    }
  }, [alerts, unreadAlertsCount]);

  const roles: Role[] = ['Administrador', 'Supervisor', 'Técnico'];
  const isTechnician = currentRole === 'Técnico';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Emergency Active Alert Top Banner */}
      {emergencyState.active && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between text-xs sm:text-sm font-semibold animate-pulse shadow-inner">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-yellow-300 animate-bounce" />
            <span>
              🚨 MODO DE EMERGÊNCIA GLOBAL ATIVADO – Todos os postes operando em 100% de potência por determinação de {emergencyState.activatedBy || 'Operador'}.
            </span>
          </div>
          {!isTechnician && (
            <button
              onClick={onOpenEmergencyModal}
              className="bg-white text-red-700 hover:bg-slate-100 px-3 py-1 rounded-md text-xs font-bold transition shadow"
            >
              Gerenciar Emergência
            </button>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab && setActiveTab(isTechnician ? 'map' : 'dashboard')}>
              <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
                <Lightbulb className="w-5 h-5 fill-white/20" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    Sky Light
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-600 border border-blue-200 rounded-full">
                    Telegestão PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">Iluminação Pública Inteligente</p>
              </div>
            </div>

            {/* Quick Status Badges */}
            <div className="hidden lg:flex items-center space-x-2 pl-4 border-l border-slate-200">
              <div className="px-3 py-1 bg-green-50 text-green-700 border border-green-200/80 rounded-full text-xs font-bold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Rede Operacional ({gatewaysOnlineCount}/{totalGatewaysCount} GWs)
              </div>

              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium">
                <Cpu className="w-3.5 h-3.5 text-blue-500" />
                <span>Nódulos: <strong className="text-slate-900">{connectedNodesCount}</strong></span>
              </div>
            </div>
          </div>

          {/* Center / Right Control Panel */}
          <div className="flex items-center space-x-3">
            {/* Real-time Clock */}
            <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>{currentTime || 'Carregando...'}</span>
            </div>

            {/* Global Emergency Button (Disabled or Active for Technician) */}
            {!isTechnician ? (
              <button
                onClick={onOpenEmergencyModal}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition shadow-sm ${
                  emergencyState.active
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 animate-pulse'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">
                  {emergencyState.active ? 'EMERGÊNCIA ATIVA' : 'EMERGÊNCIA'}
                </span>
              </button>
            ) : (
              <div
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-400"
                title="Apenas Administradores e Supervisores autorizam emergência global"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                <span>Modo Leitura / Técnico</span>
              </div>
            )}

            {/* Alerts Notifications Button */}
            <button
              onClick={onOpenAlerts}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 transition shadow-sm"
              title="Alertas e Notificações"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User & Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center space-x-2 border px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isTechnician
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                }`}
              >
                {isTechnician ? (
                  <HardHat className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                )}
                <div className="flex flex-col text-left">
                  <span className="font-bold leading-tight max-w-[110px] truncate">
                    {currentUser ? currentUser.name.split(' ')[0] : 'Usuário'}
                  </span>
                  <span className="text-[9px] text-slate-500 leading-none">
                    {currentRole}
                  </span>
                </div>
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100 mb-1">
                    Ações da Conta
                  </div>

                  {!isTechnician && onOpenUserRegistration && (
                    <div className="border-t border-slate-100 pt-2 mt-1 px-2">
                      <button
                        onClick={() => {
                          onOpenUserRegistration();
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition shadow-sm"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>+ Cadastrar Novo Usuário</span>
                      </button>
                    </div>
                  )}

                  {onLogout && (
                    <div className="border-t border-slate-100 pt-2 mt-2 px-2 pb-1">
                      <button
                        onClick={() => {
                          onLogout();
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 font-bold py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sair do Sistema</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
