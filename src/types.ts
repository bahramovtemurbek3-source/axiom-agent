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

