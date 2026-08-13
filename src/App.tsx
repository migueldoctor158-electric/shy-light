import React, { useState, useEffect } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { LoginScreen } from './components/LoginScreen';
import { NavigationTabs } from './components/NavigationTabs';
import { DashboardOverview } from './components/DashboardOverview';
import { SmartMap } from './components/SmartMap';
import { PolesManager } from './components/PolesManager';
import { NodesManager } from './components/NodesManager';
import { GatewaysManager } from './components/GatewaysManager';
import { PairingManager } from './components/PairingManager';
import { IndividualControl } from './components/IndividualControl';
import { BatchControl } from './components/BatchControl';
import { AutomationEngine } from './components/AutomationEngine';
import { MaintenanceManager } from './components/MaintenanceManager';
import { AlertsManager } from './components/AlertsManager';
import { ReportsManager } from './components/ReportsManager';
import { SecurityAudit } from './components/SecurityAudit';
import { EmergencyModal } from './components/EmergencyModal';

import {
  INITIAL_POLES,
  INITIAL_GATEWAYS,
  INITIAL_NODES,
  INITIAL_AUTOMATIONS,
  INITIAL_SERVICE_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_ALERTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ROLE_PROFILES,
  INITIAL_USERS
} from './data/mockData';

import {
  Role,
  Pole,
  Gateway,
  TelemanagementNode,
  EmergencyState,
  AutomationRule,
  ServiceOrder,
  InventoryItem,
  SystemAlert,
  AuditLog,
  UserAccount
} from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Load session from localStorage on mount
  useEffect(() => {
    const sessionUser = localStorage.getItem('skylight_session');
    if (sessionUser) {
      try {
        const user = JSON.parse(sessionUser);
        setCurrentUser(user);
        setCurrentRole(user.role);
        setIsAuthenticated(true);
      } catch (e) {
        // Invalid session data
        localStorage.removeItem('skylight_session');
      }
    }
  }, []);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<Role>('Administrador');

  // Registration Modal Trigger State
  const [initialOpenAddUserModal, setInitialOpenAddUserModal] = useState<boolean>(false);

  // Application Master Data State
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserAccount>(INITIAL_USERS[0]);
  const [poles, setPoles] = useState<Pole[]>(INITIAL_POLES);
  const [gateways, setGateways] = useState<Gateway[]>(INITIAL_GATEWAYS);
  const [nodes, setNodes] = useState<TelemanagementNode[]>(INITIAL_NODES);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(INITIAL_AUTOMATIONS);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(INITIAL_SERVICE_ORDERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [alerts, setAlerts] = useState<SystemAlert[]>(INITIAL_ALERTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // User Management Handlers
  const handleAddUser = (newUser: UserAccount) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleSelectUser = (user: UserAccount) => {
    setCurrentUser(user);
    handleRoleChange(user.role);
  };

  const handleRoleChange = (role: Role) => {
    setCurrentRole(role);
    if (role === 'Técnico') {
      const technicianAllowedTabs = ['map', 'poles', 'nodes', 'pairing', 'gateways', 'maintenance'];
      if (!technicianAllowedTabs.includes(activeTab)) {
        setActiveTab('map');
      }
    }
  };

  const handleLogin = (user: UserAccount, rememberMe: boolean) => {
    setCurrentUser(user);
    handleRoleChange(user.role);
    setIsAuthenticated(true);

    if (rememberMe) {
      localStorage.setItem('skylight_session', JSON.stringify(user));
    }

    // Add Audit Log
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN_USUARIO_SUCESSO',
      details: `Login realizado via tela de autenticação. Sessão iniciada.`,
      ipAddress: '189.40.12.11'
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('skylight_session');
    // Optionally reset active tab or just leave it
    setActiveTab('dashboard');
  };

  // Focus pole on map
  const [selectedMapPoleId, setSelectedMapPoleId] = useState<string | null>(null);

  // Global Emergency State
  const [emergencyState, setEmergencyState] = useState<EmergencyState>({
    active: false,
    activatedAt: undefined,
    activatedBy: undefined,
    reason: ''
  });

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);

  // Emergency Handlers
  const handleActivateEmergency = (reason: string, operatorName?: string) => {
    setEmergencyState({
      active: true,
      activatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      activatedBy: operatorName || 'Eng. Roberto Alves (Operador Chefe)',
      reason
    });

    // Set all poles to 100% power
    setPoles((prev) =>
      prev.map((p) => ({
        ...p,
        dimmingLevel: 100,
        status: 'active_100',
        isAuto: false
      }))
    );

    // Record Audit Log
    const newAuditLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: operatorName || 'Eng. Roberto Alves',
      userRole: currentRole,
      action: 'ACIONAMENTO_EMERGENCIA_GLOBAL',
      ipAddress: '189.40.12.11',
      details: `Modo de Emergência acionado. Motivo: ${reason}`
    };
    setAuditLogs((prev) => [newAuditLog, ...prev]);

    // Add Alert
    const newAlert: SystemAlert = {
      id: `ALT-EMG-${Date.now()}`,
      type: 'emergency_on',
      severity: 'critical',
      title: 'MODO DE EMERGÊNCIA GLOBAL ATIVADO',
      message: `Toda a iluminação pública foi forçada para 100% de potência. Motivo: ${reason}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      read: false,
      channelsSent: ['dashboard', 'email', 'sms', 'whatsapp', 'push']
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleDeactivateEmergency = () => {
    setEmergencyState({
      active: false,
      activatedAt: undefined,
      activatedBy: undefined,
      reason: ''
    });

    // Return poles to auto
    setPoles((prev) =>
      prev.map((p) => ({
        ...p,
        status: 'auto',
        isAuto: true
      }))
    );

    // Record Audit Log
    const newAuditLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: 'Eng. Roberto Alves',
      userRole: currentRole,
      action: 'DESATIVACAO_EMERGENCIA_GLOBAL',
      ipAddress: '189.40.12.11',
      details: 'Modo de emergência desativado. Rede retornada ao modo automático.'
    };
    setAuditLogs((prev) => [newAuditLog, ...prev]);
  };

  // Pole Handlers
  const handleAddPole = (newPole: Pole) => {
    setPoles((prev) => [...prev, newPole]);
  };

  const handleUpdatePole = (updatedPole: Pole) => {
    setPoles((prev) => prev.map((p) => (p.id === updatedPole.id ? updatedPole : p)));
  };

  const handleDeletePole = (poleId: string) => {
    setPoles((prev) => prev.filter((p) => p.id !== poleId));
  };

  const handleBatchUpdatePoles = (poleIds: string[], updates: Partial<Pole>) => {
    setPoles((prev) =>
      prev.map((p) => {
        if (poleIds.includes(p.id)) {
          return {
            ...p,
            ...updates,
            lastCommunication: new Date().toISOString().replace('T', ' ').substring(0, 19)
          };
        }
        return p;
      })
    );
  };

  // Node Handlers
  const handleAddNode = (newNode: TelemanagementNode) => {
    setNodes((prev) => [...prev, newNode]);
  };

  const handleUpdateNode = (updatedNode: TelemanagementNode) => {
    setNodes((prev) => prev.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
  };

  // Gateway Handlers
  const handleAddGateway = (newGw: Gateway) => {
    setGateways((prev) => [...prev, newGw]);
  };

  const handleUpdateGateway = (updatedGw: Gateway) => {
    setGateways((prev) => prev.map((g) => (g.id === updatedGw.id ? updatedGw : g)));
  };

  const handleDeleteGateway = (gwId: string) => {
    setGateways((prev) => prev.filter((g) => g.id !== gwId));
  };

  // Pairing Handler
  const handlePairPoleNode = (poleId: string, nodeId: string) => {
    setPoles((prev) =>
      prev.map((p) => (p.id === poleId ? { ...p, nodeId } : p))
    );
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, poleId } : n))
    );
  };

  const handleUnpairPoleNode = (poleId: string, nodeId: string) => {
    setPoles((prev) =>
      prev.map((p) => (p.id === poleId ? { ...p, nodeId: null } : p))
    );
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, poleId: null } : n))
    );
  };

  // Automation Rule Handlers
  const handleAddRule = (rule: AutomationRule) => {
    setAutomationRules((prev) => [...prev, rule]);
  };

  const handleUpdateRule = (updatedRule: AutomationRule) => {
    setAutomationRules((prev) =>
      prev.map((r) => (r.id === updatedRule.id ? updatedRule : r))
    );
  };

  const handleToggleRule = (ruleId: string) => {
    setAutomationRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    setAutomationRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const handleExecuteRule = (rule: AutomationRule) => {
    const targetBairro = rule.targetFilter?.neighborhood;
    
    setPoles((prevPoles) =>
      prevPoles.map((p) => {
        if (targetBairro && targetBairro !== 'all' && p.neighborhood !== targetBairro) {
          return p;
        }

        let newStatus = p.status;
        let newDimming = p.dimmingLevel;
        let newVoltage = p.currentVoltage;

        if (rule.targetAction === 'turn_off') {
          newStatus = 'off';
          newDimming = 0;
          newVoltage = 0;
        } else if (rule.targetAction === 'power_100') {
          newStatus = 'auto';
          newDimming = 100;
          newVoltage = 220;
        } else if (rule.targetAction === 'power_75') {
          newStatus = 'auto';
          newDimming = 75;
          newVoltage = 220;
        } else if (rule.targetAction === 'power_50') {
          newStatus = 'auto';
          newDimming = 50;
          newVoltage = 220;
        }

        return {
          ...p,
          status: newStatus,
          dimmingLevel: newDimming,
          currentVoltage: newVoltage,
          isAuto: true
        };
      })
    );

    const timeNow = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setAutomationRules((prev) =>
      prev.map((r) =>
        r.id === rule.id
          ? { ...r, lastExecuted: `Executado manualmente às ${timeNow}` }
          : r
      )
    );
  };

  // Maintenance Handlers
  const handleAddServiceOrder = (order: ServiceOrder) => {
    setServiceOrders((prev) => [order, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: any) => {
    setServiceOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const handleUpdateInventoryQty = (itemId: string, qtyDelta: number) => {
    setInventory((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + qtyDelta) } : i))
    );
  };

  // Alerts Handlers
  const handleMarkAllAlertsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const handleAddAlert = (alert: SystemAlert) => {
    setAlerts((prev) => [alert, ...prev]);
  };

  // Map Navigation Focus
  const handleSelectPoleForMap = (poleId: string) => {
    setSelectedMapPoleId(poleId);
    setActiveTab('map');
  };

  const unreadAlertsCount = (alerts || []).filter((a) => !a.read).length;

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} mockUsers={users} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Header Bar */}
      <HeaderBar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        currentUser={currentUser}
        users={users}
        onSelectUser={handleSelectUser}
        onOpenUserRegistration={() => {
          setActiveTab('security');
          setInitialOpenAddUserModal(true);
        }}
        onLogout={handleLogout}
        emergencyState={emergencyState}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        alerts={alerts}
        unreadAlertsCount={unreadAlertsCount}
        onOpenAlerts={() => setActiveTab('alerts')}
        connectedNodesCount={(nodes || []).filter((n) => n.status === 'online' || n.status === 'warning').length}
        gatewaysOnlineCount={(gateways || []).filter((g) => g.status === 'online').length}
        totalGatewaysCount={(gateways || []).length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Primary Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        unreadAlertsCount={unreadAlertsCount}
        currentRole={currentRole}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            poles={poles}
            gateways={gateways}
            nodes={nodes}
            emergencyState={emergencyState}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'map' && (
          <SmartMap
            poles={poles}
            nodes={nodes}
            gateways={gateways}
            emergencyState={emergencyState}
            selectedPoleIdFromParent={selectedMapPoleId}
            onUpdatePole={handleUpdatePole}
          />
        )}

        {activeTab === 'poles' && (
          <PolesManager
            poles={poles}
            gateways={gateways}
            nodes={nodes}
            onAddPole={handleAddPole}
            onUpdatePole={handleUpdatePole}
            onDeletePole={handleDeletePole}
            onSelectPoleForMap={handleSelectPoleForMap}
          />
        )}

        {activeTab === 'nodes' && (
          <NodesManager
            nodes={nodes}
            gateways={gateways}
            onAddNode={handleAddNode}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
          />
        )}

        {activeTab === 'gateways' && (
          <GatewaysManager
            gateways={gateways}
            nodes={nodes}
            onAddGateway={handleAddGateway}
            onUpdateGateway={handleUpdateGateway}
            onDeleteGateway={handleDeleteGateway}
          />
        )}

        {activeTab === 'pairing' && (
          <PairingManager
            poles={poles}
            nodes={nodes}
            gateways={gateways}
            onPair={handlePairPoleNode}
            onUnpair={handleUnpairPoleNode}
          />
        )}

        {activeTab === 'individual' && (
          <IndividualControl
            poles={poles}
            nodes={nodes}
            gateways={gateways}
            onUpdatePole={handleUpdatePole}
            onSelectPoleForMap={handleSelectPoleForMap}
          />
        )}

        {activeTab === 'batch' && (
          <BatchControl
            poles={poles}
            gateways={gateways}
            onBatchUpdatePoles={handleBatchUpdatePoles}
          />
        )}

        {(activeTab === 'automation' || activeTab === 'automations') && (
          <AutomationEngine
            rules={automationRules}
            poles={poles}
            onAddRule={handleAddRule}
            onUpdateRule={handleUpdateRule}
            onToggleRule={handleToggleRule}
            onDeleteRule={handleDeleteRule}
            onExecuteRule={handleExecuteRule}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceManager
            orders={serviceOrders}
            inventory={inventory}
            poles={poles}
            onAddOrder={handleAddServiceOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateInventoryQty={handleUpdateInventoryQty}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsManager
            alerts={alerts}
            onMarkAllRead={handleMarkAllAlertsRead}
            onAddAlert={handleAddAlert}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsManager
            poles={poles}
            gateways={gateways}
            nodes={nodes}
            orders={serviceOrders}
          />
        )}

        {activeTab === 'security' && (
          <SecurityAudit
            logs={auditLogs}
            roles={INITIAL_ROLE_PROFILES}
            users={users}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </main>

      {/* Sleek Interface Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 mt-auto">
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> MQTT: Conectado</span>
          <span>Latência: 14ms</span>
          <span className="hidden md:inline">Buffer: 0.02%</span>
        </div>
        <div className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
          SKY LIGHT v2.8.0-PRO • PLATAFORMA INTEGRADA DE TELEGESTÃO URBANA
        </div>
      </footer>

      {/* Global Emergency Control Modal */}
      {isEmergencyModalOpen && (
        <EmergencyModal
          isOpen={isEmergencyModalOpen}
          emergencyState={emergencyState}
          currentRole={currentRole}
          onClose={() => setIsEmergencyModalOpen(false)}
          onActivateEmergency={handleActivateEmergency}
          onDeactivateEmergency={handleDeactivateEmergency}
        />
      )}
    </div>
  );
}
