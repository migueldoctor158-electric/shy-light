export type Role = 'Administrador' | 'Supervisor' | 'Técnico';

export interface UserAccount {
  id: string;
  registrationCode: string;
  name: string;
  email: string;
  role: Role;
  status: 'Ativo' | 'Inativo';
  phone: string;
  region: string;
  createdAt: string;
  lastAccess?: string;
  password?: string;
  requiresPasswordChange?: boolean;
}

export type PoleStatus =
  | 'active_100'
  | 'active_dimmed'
  | 'auto'
  | 'turned_off'
  | 'maintenance'
  | 'comm_fault'
  | 'emergency';

export interface Pole {
  id: string;
  code: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  powerWattage: number; // e.g. 150 (Watts)
  fixtureType: 'LED' | 'Vapor de Sódio' | 'Vapor Metálico' | 'Sólido Inteligente';
  status: PoleStatus;
  dimmingLevel: number; // 0, 25, 50, 75, 100
  isAuto: boolean;
  nodeId: string | null;
  gatewayId: string | null;
  installDate: string;
  notes: string;
  currentVoltage: number; // Volts
  currentAmperes: number; // Amperes
  powerFactor: number; // 0.85 - 0.99
  kwhToday: number;
  kwhMonth: number;
  lastCommunication: string;
}

export interface TelemanagementNode {
  id: string;
  serialNumber: string;
  model: string;
  firmware: string;
  gatewayId: string;
  poleId: string | null;
  status: 'online' | 'offline' | 'warning';
  signalRssi: number; // dBm e.g. -68
  activationDate: string;
  lastCommunication: string;
}

export interface Gateway {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  status: 'online' | 'offline';
  connectedNodesCount: number;
  lastCommunication: string;
  firmwareVersion: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  targetAction: 'power_100' | 'power_50' | 'power_75' | 'power_25' | 'turn_off' | 'auto_schedule';
  targetTime: string; // "18:00" (Horário de Início)
  endTime?: string; // "23:30" (Horário de Término / Reativação)
  recurrence: 'daily' | 'weekdays' | 'weekends' | 'specific_dates' | 'holidays' | 'monthly';
  monthlyDay?: number; // 1-31 (Ex: dia 15 de cada mês)
  specificDates?: string[];
  eventDate?: string;
  isStargazingModel?: boolean;
  targetFilter: {
    city?: string;
    neighborhood?: string;
    gatewayId?: string;
    fixtureType?: string;
  };
  enabled: boolean;
  lastExecuted?: string;
}

export interface ServiceOrder {
  id: string;
  poleId: string;
  poleCode: string;
  title: string;
  description: string;
  priority: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  technician: string;
  createdAt: string;
  scheduledDate: string;
  completedAt?: string;
  photoUrl?: string;
  partsUsed: { name: string; quantity: number }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Luminária' | 'Nódulo' | 'Gateway' | 'Cabo/Acessório' | 'Fusível/Relé';
  quantity: number;
  minQuantity: number;
  unitCost: number;
}

export interface SystemAlert {
  id: string;
  type: 'pole_offline' | 'gateway_offline' | 'electrical_fault' | 'comm_failure' | 'abnormal_consumption' | 'emergency_on' | 'emergency_off';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  channelsSent: ('dashboard' | 'email' | 'sms' | 'whatsapp' | 'push')[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: Role;
  action: string;
  details: string;
  ipAddress: string;
}

export interface EmergencyState {
  active: boolean;
  activatedAt?: string;
  activatedBy?: string;
  reason?: string;
}

export interface UserRoleProfile {
  role: Role;
  name: string;
  description: string;
  permissions: string[];
}

export interface EnergyMetric {
  timeLabel: string;
  kwhReal: number;
  kwhBaseline: number;
  savingsPercent: number;
}

export interface MQTTMessage {
  topic: string;
  payload: string;
  timestamp: string;
}
