import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Lock, X } from 'lucide-react';
import { Role, EmergencyState } from '../types';

interface EmergencyModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  emergencyState?: EmergencyState;
  currentRole?: Role;
  onActivateEmergency?: (reason: string, operatorName: string) => void;
  onDeactivateEmergency?: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen = true,
  onClose,
  emergencyState = { active: false } as EmergencyState,
  currentRole = 'Administrador',
  onActivateEmergency,
  onDeactivateEmergency
}) => {
  const [reason, setReason] = useState<string>('Operação de Segurança do Município / Evento Crítico');
  const [operatorName, setOperatorName] = useState<string>('Operador em Turno');

  if (!isOpen) return null;

  const canManageEmergency = ['Administrador', 'Supervisor', 'Operador'].includes(currentRole);

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onActivateEmergency?.(reason, operatorName);
    onClose?.();
  };

  const handleDeactivate = () => {
    onDeactivateEmergency?.();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-800 text-xs">
        {/* Modal Header */}
        <div
          className={`p-5 flex items-center justify-between border-b ${
            emergencyState.active
              ? 'bg-rose-600 text-white border-rose-700'
              : 'bg-slate-50 border-slate-100 text-slate-900'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-xl ${
                emergencyState.active ? 'bg-white text-rose-600 font-bold' : 'bg-rose-100 text-rose-700'
              }`}
            >
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {emergencyState.active ? 'Desativar Modo Emergência' : 'Acionar Modo de Emergência Global'}
              </h3>
              <p className={`text-xs ${emergencyState.active ? 'text-rose-100' : 'text-slate-500'}`}>
                Sky Light Telecontrol Systems
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${emergencyState.active ? 'text-white hover:bg-rose-700' : 'text-slate-400 hover:text-slate-700'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {!canManageEmergency ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3 text-xs">
              <Lock className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold">Acesso Restrito</p>
                <p className="text-xs text-amber-800 mt-1">
                  Seu perfil atual ({currentRole}) não possui permissão para alterar o modo de emergência.
                </p>
              </div>
            </div>
          ) : emergencyState.active ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-rose-700 text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>EMERGÊNCIA EM ANDAMENTO</span>
                </div>
                <p className="text-xs text-slate-700">
                  <strong>Ativado em:</strong> {emergencyState.activatedAt || 'Recente'}
                </p>
                <p className="text-xs text-slate-700">
                  <strong>Responsável:</strong> {emergencyState.activatedBy || 'Operador'}
                </p>
                <p className="text-xs text-slate-700">
                  <strong>Motivo:</strong> {emergencyState.reason || 'Segurança Pública'}
                </p>
              </div>

              <button
                onClick={handleDeactivate}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>NORMALIZAR REDE (RETORNAR ÀS AUTOMAÇÕES)</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleActivate} className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed">
                <p className="font-bold mb-1">Atenção Especial:</p>
                Ao acionar a emergência global, todos os postes sob telegestão serão forçados imediatamente ao nível de 100% de iluminação, sobrescrevendo qualquer regra de dimerização ou agendamento.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Motivo do Acionamento de Emergência</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome do Operador Responsável</label>
                <input
                  type="text"
                  required
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-white font-bold bg-rose-600 hover:bg-rose-500 shadow-md transition flex items-center space-x-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>CONFIRMAR EMERGÊNCIA GLOBAL</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
