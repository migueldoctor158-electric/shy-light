import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Eye,
  KeyRound,
  History,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  Users,
  HardHat,
  Shield,
  Edit3,
  Trash2,
  X,
  UserPlus,
  Check,
  MapPin,
  Phone,
  Mail,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { AuditLog, UserRoleProfile, UserAccount, Role } from '../types';

interface SecurityAuditProps {
  logs?: AuditLog[];
  roles?: UserRoleProfile[];
  users?: UserAccount[];
  onAddUser?: (user: UserAccount) => void;
  onUpdateUser?: (user: UserAccount) => void;
  onDeleteUser?: (userId: string) => void;
  initialOpenAddModal?: boolean;
  onResetInitialOpenModal?: () => void;
}

export const SecurityAudit: React.FC<SecurityAuditProps> = ({
  logs = [],
  roles = [],
  users = [],
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  initialOpenAddModal = false,
  onResetInitialOpenModal
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'logs'>('users');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(initialOpenAddModal);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Quick Password Generator
  const [generatedPassword, setGeneratedPassword] = useState<string>('SkyLight#2026');

  const [formData, setFormData] = useState<Partial<UserAccount>>({
    name: '',
    email: '',
    role: 'Técnico',
    status: 'Ativo',
    phone: '(11) 98888-7777',
    region: 'Setor Norte - Central',
    registrationCode: 'TEC-3005'
  });

  // Delete Confirmation State
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);

  React.useEffect(() => {
    if (initialOpenAddModal) {
      handleOpenAddModal();
      if (onResetInitialOpenModal) onResetInitialOpenModal();
    }
  }, [initialOpenAddModal]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newPass = `SkyLight#${code}`;
    setGeneratedPassword(newPass);
    showToast(`Nova senha temporária gerada: ${newPass}`);
  };

  const handleOpenAddModal = () => {
    setEditingUserId(null);
    const randNum = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      name: '',
      email: '',
      role: 'Técnico',
      status: 'Ativo',
      phone: '(11) 98888-7777',
      region: 'Setor Norte - Central',
      registrationCode: `TEC-${randNum}`
    });
    generateRandomPassword();
    setIsModalOpen(true);
  };

  const handleRoleSelectChange = (newRole: Role) => {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const rolePrefix = newRole === 'Administrador' ? 'ADM' : newRole === 'Supervisor' ? 'SUP' : 'TEC';
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      registrationCode: `${rolePrefix}-${randNum}`
    }));
  };

  const handleOpenEditModal = (u: UserAccount) => {
    setEditingUserId(u.id);
    setFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      phone: u.phone,
      region: u.region
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingUserId) {
      const updatedUser: UserAccount = {
        id: editingUserId,
        registrationCode: users.find((u) => u.id === editingUserId)?.registrationCode || 'USR-000',
        name: formData.name,
        email: formData.email,
        role: (formData.role as Role) || 'Técnico',
        status: (formData.status as any) || 'Ativo',
        phone: formData.phone || '',
        region: formData.region || 'Todas',
        createdAt: users.find((u) => u.id === editingUserId)?.createdAt || '2026-01-01',
        lastAccess: 'Hoje (Atualizado)'
      };
      onUpdateUser?.(updatedUser);
      showToast(`Cadastro do usuário "${updatedUser.name}" atualizado!`);
    } else {
      const rolePrefix = formData.role === 'Administrador' ? 'ADM' : formData.role === 'Supervisor' ? 'SUP' : 'TEC';
      const newUser: UserAccount = {
        id: `USR-${Math.floor(100 + Math.random() * 900)}`,
        registrationCode: `${rolePrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
        name: formData.name,
        email: formData.email,
        role: (formData.role as Role) || 'Técnico',
        status: (formData.status as any) || 'Ativo',
        phone: formData.phone || '',
        region: formData.region || 'Todas',
        createdAt: new Date().toISOString().split('T')[0],
        lastAccess: 'Novo Cadastro',
        password: 'senha',
        requiresPasswordChange: true
      };
      onAddUser?.(newUser);
      showToast(`Novo usuário "${newUser.name}" cadastrado como ${newUser.role}!`);
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (u: UserAccount) => {
    const updated: UserAccount = {
      ...u,
      status: u.status === 'Ativo' ? 'Inativo' : 'Ativo'
    };
    onUpdateUser?.(updated);
    showToast(`Status de "${u.name}" alterado para ${updated.status}.`);
  };

  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    onDeleteUser?.(deletingUser.id);
    showToast(`Usuário "${deletingUser.name}" removido do sistema.`);
    setDeletingUser(null);
  };

  // Filter Users
  const filteredUsers = (users || []).filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.registrationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.region.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  // Filter Logs
  const filteredLogs = (logs || []).filter(
    (l) =>
      (l.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.details || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-blue-500/50 flex items-center space-x-3 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
            <span>Gestão de Usuários, Permissões (RBAC) e Segurança</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cadastro enxuto focado nos perfis operacionais: <strong>Administrador</strong>, <strong>Supervisor</strong> e <strong>Técnico de Campo</strong>.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Novo Usuário</span>
        </button>
      </div>

      {/* Role Hierarchy Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-800/60 p-5 rounded-2xl shadow-md text-white space-y-3">
        <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider flex items-center space-x-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <span>Estrutura de Perfis & Escopo de Acesso Simplificado</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
            <p className="font-bold text-blue-300 flex items-center space-x-1.5">
              <span>👑 Administrador</span>
            </p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Controle global irrestrito: comandos em massa, acionamento emergencial, criação de automações, gestão financeira e cadastro de usuários.
            </p>
          </div>

          <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
            <p className="font-bold text-emerald-300 flex items-center space-x-1.5">
              <span>👁️ Supervisor</span>
            </p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Supervisão operacional completa: monitoramento da rede, controle individual de postes, agendamentos, relatórios e ordens de serviço.
            </p>
          </div>

          <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
            <p className="font-bold text-amber-300 flex items-center space-x-1.5">
              <HardHat className="w-3.5 h-3.5 text-amber-400 inline" />
              <span>🛠️ Técnico de Campo</span>
            </p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Interface simplificada e direta: Mapa de postes, lista/specs de postes, nóulos, gateways, vinculação de hardware e manutenção/OS.
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuários Cadastrados ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'roles'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Matriz de Permissões RBAC ({roles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'logs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Logs de Auditoria ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar usuário por nome, email, matrícula ou setor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500">Filtrar Cargo:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todos os Cargos</option>
                <option value="Administrador">Administrador</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Técnico">Técnico</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Matrícula / Usuário</th>
                    <th className="py-3.5 px-4">Cargo / Perfil RBAC</th>
                    <th className="py-3.5 px-4">E-mail Institucional</th>
                    <th className="py-3.5 px-4">Setor / Região</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Último Acesso</th>
                    <th className="py-3.5 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-mono text-[10px] font-bold rounded border border-slate-200">
                              {u.registrationCode}
                            </span>
                            <span className="font-bold text-slate-900">{u.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-slate-300" />
                            <span>{u.phone}</span>
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.role === 'Administrador' && (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold text-[10px] inline-flex items-center space-x-1">
                            <Shield className="w-3 h-3 text-blue-600" />
                            <span>Administrador</span>
                          </span>
                        )}
                        {u.role === 'Supervisor' && (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[10px] inline-flex items-center space-x-1">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>Supervisor</span>
                          </span>
                        )}
                        {u.role === 'Técnico' && (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold text-[10px] inline-flex items-center space-x-1">
                            <HardHat className="w-3 h-3 text-amber-600" />
                            <span>Técnico de Campo</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-700">{u.email}</td>

                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.region}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <button onClick={() => handleToggleStatus(u)}>
                          {u.status === 'Ativo' ? (
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[10px] hover:bg-emerald-100 transition">
                              ● Ativo
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-full font-bold text-[10px] hover:bg-slate-200 transition">
                              ○ Inativo
                            </span>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">{u.lastAccess || 'Hoje'}</td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200"
                            title="Editar Dados do Usuário"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeletingUser(u)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition border border-slate-200"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        Nenhum usuário cadastrado encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES MATRIX */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(roles || []).map((r) => (
            <div
              key={r.role}
              className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className={`p-3 rounded-xl w-max border ${
                  r.role === 'Administrador'
                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                    : r.role === 'Supervisor'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {r.role === 'Técnico' ? <HardHat className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                </div>

                <h3 className="text-base font-bold text-slate-900">{r.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{r.description}</p>

                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Permissões Habilitadas:
                  </span>
                  {(r.permissions || []).map((p) => (
                    <div key={p} className="flex items-center space-x-1.5 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="capitalize">{p.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Nível RBAC</span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded font-mono text-[10px] font-bold border border-slate-200">
                  {r.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar logs por usuário, ação ou IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Usuário</th>
                    <th className="py-3.5 px-4">Perfil</th>
                    <th className="py-3.5 px-4">Ação / Operação</th>
                    <th className="py-3.5 px-4">Endereço IP</th>
                    <th className="py-3.5 px-4">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{log.timestamp}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{log.userName}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-semibold border border-blue-200/60">
                          {log.userRole}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{log.action}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{log.ipAddress}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create or Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-xs space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {editingUserId ? 'Editar Cadastro de Usuário' : 'Novo Cadastro de Usuário'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Defina o perfil de permissões e as credenciais do operador.
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nome Completo do Operador</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Roberto Alves"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código / Matrícula</label>
                  <input
                    type="text"
                    required
                    value={formData.registrationCode || 'TEC-3001'}
                    onChange={(e) => setFormData({ ...formData, registrationCode: e.target.value })}
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail Institucional</label>
                <input
                  type="email"
                  required
                  placeholder="roberto.alves@skylight.gov.br"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cargo / Perfil de Acesso</label>
                  <select
                    value={formData.role || 'Técnico'}
                    onChange={(e) => handleRoleSelectChange(e.target.value as Role)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Administrador">👑 Administrador (Acesso Total)</option>
                    <option value="Supervisor">👁️ Supervisor (Operacional)</option>
                    <option value="Técnico">🛠️ Técnico (Campo e Módulos)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Inicial da Conta</label>
                  <select
                    value={formData.status || 'Ativo'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Ativo">Ativo (Permite Login)</option>
                    <option value="Inativo">Inativo (Bloqueado)</option>
                  </select>
                </div>
              </div>

              {/* Role Scope Description Box */}
              <div className="p-3 rounded-xl border bg-slate-50 border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Escopo do Perfil Selecionado:</span>
                {formData.role === 'Administrador' && (
                  <p className="text-slate-700 text-[11px] font-medium leading-relaxed">
                    👑 <strong>Administrador:</strong> Acesso irrestrito a todos os módulos, comandos em massa, acionamento de emergência, relatórios e gestão de usuários.
                  </p>
                )}
                {formData.role === 'Supervisor' && (
                  <p className="text-slate-700 text-[11px] font-medium leading-relaxed">
                    👁️ <strong>Supervisor:</strong> Controle total da operação de telegestão, agendamentos, aprovação de ordens de serviço e monitoramento.
                  </p>
                )}
                {formData.role === 'Técnico' && (
                  <p className="text-slate-700 text-[11px] font-medium leading-relaxed">
                    🛠️ <strong>Técnico:</strong> Focado em infraestrutura: Mapa de postes, lista/specs de postes, nódulos, gateways, vinculação e manutenção/OS.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 98888-7777"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Região de Atuação</label>
                  <input
                    type="text"
                    placeholder="Ex: Zona Norte / Jardins"
                    value={formData.region || ''}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['Todas', 'Jardins / Centro', 'Setor Sul', 'Paulista'].map((reg) => (
                      <button
                        type="button"
                        key={reg}
                        onClick={() => setFormData({ ...formData, region: reg })}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-medium transition"
                      >
                        + {reg}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Password Credentials Section */}
              {!editingUserId && (
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 text-[11px] flex items-center space-x-1">
                      <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                      <span>Senha Inicial Gerada</span>
                    </span>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[10px] text-blue-700 hover:underline font-bold"
                    >
                      Gerar Outra
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-blue-200 px-3 py-1.5 rounded-lg">
                    <span className="font-mono font-bold text-slate-800 tracking-wider text-xs">{generatedPassword}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(generatedPassword);
                        showToast(`Senha "${generatedPassword}" copiada para a área de transferência!`);
                      }}
                      className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-bold px-2 py-1 rounded transition"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition flex items-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{editingUserId ? 'Salvar Alterações' : 'Concluir Cadastro'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete User Confirmation */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-xs space-y-4 text-slate-800">
            <div className="flex items-center space-x-3 text-rose-600 font-bold text-base border-b border-slate-100 pb-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <span>Confirmar Exclusão de Usuário</span>
            </div>

            <p className="text-slate-600">
              Tem certeza que deseja remover o usuário <strong>"{deletingUser.name}"</strong> ({deletingUser.registrationCode}) do sistema?
            </p>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 transition shadow"
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
