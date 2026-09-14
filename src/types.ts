export type HostOS = 'macOS' | 'Windows' | 'Linux';

export type ActionType =
  | 'shell'
  | 'click'
  | 'double_click'
  | 'type'
  | 'key'
  | 'scroll'
  | 'screenshot'
  | 'read_file'
  | 'write_file'
  | 'done';

export type DoneStatus = 'DONE' | 'BLOCKED' | 'NEED CONFIRMATION';

export interface AgentAction {
  action: ActionType;
  command?: string;
  x?: number;
  y?: number;
  button?: 'left' | 'right';
  text?: string;
  combo?: string;
  amount?: number;
  reason?: string;
  path?: string;
  content?: string;
  status?: DoneStatus;
  summary?: string;
}

export interface AgentTurnResponse {
  think: string;
  action: ActionType;
  command?: string;
  x?: number;
  y?: number;
  button?: 'left' | 'right';
  text?: string;
  combo?: string;
  amount?: number;
  reason?: string;
  path?: string;
  content?: string;
  status?: DoneStatus;
  summary?: string;
  [key: string]: unknown;
}

export interface TurnRecord {
  id: string;
  turnIndex: number;
  timestamp: string;
  hostInput: {
    task: string;
    os: HostOS;
    screenshotDescription: string;
    previousResult: string;
  };
  agentOutput: AgentTurnResponse;
  executionResult: {
    success: boolean;
    output: string;
    actionType: ActionType;
  };
}

export interface VirtualFile {
  name: string;
  path: string;
  content: string;
  size: number;
  updatedAt: string;
  isDirectory?: boolean;
}

export interface VirtualProcess {
  pid: number;
  name: string;
  cpu: string;
  mem: string;
  status: 'running' | 'sleeping' | 'stopped';
}

export interface VirtualDesktopState {
  os: HostOS;
  activeWindow: 'terminal' | 'files' | 'editor' | 'monitor';
  mousePos: { x: number; y: number };
  mouseClick?: { x: number; y: number; button: 'left' | 'right'; timestamp: number };
  typedBuffer: string;
  terminalHistory: Array<{ prompt: string; command: string; output: string }>;
  files: Record<string, VirtualFile>;
  processes: VirtualProcess[];
  isLocked: boolean;
  killSwitchEngaged: boolean;
  fullAccessGranted: boolean;
  isRunning?: boolean;
  cpuUsage?: number;
  memoryUsage?: number;
}

export interface JarvisMessage {
  id: string;
  sender: 'user' | 'jarvis' | 'system';
  text: string;
  timestamp: string;
  isVoice?: boolean;
  actionTriggered?: string;
  telemetryNote?: string;
  thought?: string;
  sources?: Array<{ title: string; url: string; snippet?: string }>;
  isDeepThink?: boolean;
  isWebSearch?: boolean;
  modelUsed?: string;
}

export interface ConnectedDevice {
  id: string;
  name: string;
  os: HostOS;
  platform?: string;
  connectedAt: string;
  lastPing: string;
  ip?: string;
  fullAccess: boolean;
  permissions: {
    terminal: boolean;
    monitoring: boolean;
    files: boolean;
    voiceControl: boolean;
  };
  metrics?: {
    cpu?: number;
    memory?: number;
  };
}

export interface JarvisTelemetry {
  arcReactorPower: number; // 0-100%
  coreTempCelsius: number;
  neuralSync: number; // 0-100%
  cpuLoad: number;
  ramUsage: number;
  securityClearance: 'LEVEL 10 (FULL ROOT/UNRESTRICTED)';
  fullAccess: boolean;
  activeProtocols: string[];
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  displayName: string;
  email: string;
  avatar: string;
  handle?: string;
  bio?: string;
  role?: string;
  plan?: string;
  memberSince?: string;
  storageUsedGB?: number;
  storageTotalGB?: number;
  language?: string;
  timezone?: string;
  theme?: string;
  voice?: string;
  voiceSpeed?: number;
  voicePitch?: number;
  autoSpeak?: boolean;
  createdAt?: string;
  lastActive?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'browser' | 'files' | 'terminal' | 'system' | 'app' | 'screenshot' | 'clipboard' | 'coding' | 'git' | 'minecraft';
  icon: string;
  description: string;
  permissionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  enabled: boolean;
  requiresConfirmation: boolean;
  executionCount: number;
  lastUsed?: string;
}

export interface ScheduledTaskItem {
  id: string;
  title: string;
  command: string;
  schedule: string;
  frequency: 'once' | 'daily' | 'weekly' | 'hourly';
  nextRun: string;
  lastRun?: string;
  enabled: boolean;
  category: string;
  createdAt: string;
}

export interface MemoryItem {
  id: string;
  category: 'preference' | 'fact' | 'instruction' | 'system';
  key: string;
  value: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface UserSettings {
  general: {
    language: string;
    theme: string;
    timezone: string;
    startupBehavior: string;
    interfacePreferences: string;
  };
  ai: {
    model: string;
    responseStyle: 'balanced' | 'concise' | 'detailed' | 'analytical';
    temperature: number;
    contextLength: number;
    memoryBehavior: 'always' | 'session' | 'disabled';
    taskExecutionConfirmation: boolean;
  };
  voice: {
    voiceEnabled: boolean; // Voice Assistant ON/OFF
    voiceInputEnabled: boolean; // Voice Input ON/OFF
    voiceOutputEnabled: boolean; // Voice Output ON/OFF
    autoSpeak: boolean; // Auto Speak ON/OFF
    gender: 'male' | 'female';
    language: string;
    selectedVoice: string;
    speechSpeed: number;
    pitch: number;
    volume: number;
    microphone: string;
    speaker: string;
    pushToTalk: boolean;
  };
  developer: {
    executionMode: 'real' | 'simulation';
    agentPort: number;
    agentHost: string;
    requireConfirmationForDangerous: boolean;
  };
  notifications: {
    taskCompletion: boolean;
    taskFailure: boolean;
    reminders: boolean;
    systemNotifications: boolean;
    soundEffects: boolean;
    desktopNotifications: boolean;
  };
  privacy: {
    saveConversationHistory: boolean;
    allowLongTermMemory: boolean;
    telemetryEnabled: boolean;
  };
}

export type AgentConnectionState = 'connected' | 'connecting' | 'disconnected';

export interface LocalAgentInfo {
  status: AgentConnectionState;
  agentVersion: string;
  platform: string;
  os: string;
  hostname: string;
  uptime?: number;
  lastHeartbeat?: number;
  latency?: number;
  port: number;
  error?: string;
  token?: string;
}


