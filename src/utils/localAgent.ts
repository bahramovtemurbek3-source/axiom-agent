// Client-side Local Agent Manager with Real Heartbeat & Tool Execution

export type AgentStatus = 'connected' | 'connecting' | 'disconnected';

export interface LocalAgentDetails {
  status: AgentStatus;
  latency: number;
  agentVersion: string;
  platform: string;
  os: string;
  hostname: string;
  uptime?: number;
  lastHeartbeat?: number;
  port: number;
  error?: string;
}

const DEFAULT_PORT = 4141;

class LocalAgentClient {
  private status: AgentStatus = 'connecting';
  private details: LocalAgentDetails = {
    status: 'connecting',
    latency: 0,
    agentVersion: '2.5.0',
    platform: 'macOS',
    os: 'macOS (Darwin)',
    hostname: 'MacBook',
    port: DEFAULT_PORT,
  };
  private consecutiveFailures = 0;
  private listeners: Array<(status: AgentStatus, details: LocalAgentDetails) => void> = [];
  private timer: any = null;
  private isChecking = false;

  constructor() {
    // Start heartbeat immediately
    if (typeof window !== 'undefined') {
      this.checkHeartbeat();
      this.timer = setInterval(() => {
        this.checkHeartbeat();
      }, 3500);
    }
  }

  public subscribe(fn: (status: AgentStatus, details: LocalAgentDetails) => void) {
    this.listeners.push(fn);
    fn(this.status, this.details);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    for (const fn of this.listeners) {
      try {
        fn(this.status, this.details);
      } catch (e) {
        console.error('Agent listener error:', e);
      }
    }
  }

  public getStatus(): AgentStatus {
    return this.status;
  }

  public getDetails(): LocalAgentDetails {
    return { ...this.details };
  }

  // Real heartbeat ping-pong check
  public async checkHeartbeat(): Promise<boolean> {
    if (this.isChecking) return this.status === 'connected';
    this.isChecking = true;

    const start = performance.now();
    let data: any = null;
    let connected = false;

    // 1. Try direct localhost fetch (browser -> 127.0.0.1:4141)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`http://127.0.0.1:${DEFAULT_PORT}/ping`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        data = await res.json();
        connected = true;
      }
    } catch (directErr) {
      // Direct fetch may fail if mixed content is blocked or agent is down
      // Fallback: 2. Try proxy via backend (/api/local-agent/ping)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const proxyRes = await fetch('/api/local-agent/ping', {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (proxyRes.ok) {
          const proxyJson = await proxyRes.json();
          if (proxyJson.connected) {
            data = proxyJson.agent;
            connected = true;
          }
        }
      } catch (proxyErr) {
        // Both failed
      }
    }

    const latency = Math.round(performance.now() - start);

    if (connected && data) {
      this.consecutiveFailures = 0;
      this.status = 'connected';
      this.details = {
        status: 'connected',
        latency,
        agentVersion: data.agentVersion || '2.5.0',
        platform: data.platform || 'darwin',
        os: data.os || (data.platform === 'darwin' ? 'macOS' : 'Computer'),
        hostname: data.hostname || 'MacBook',
        uptime: data.uptime,
        lastHeartbeat: Date.now(),
        port: data.port || DEFAULT_PORT,
      };
    } else {
      this.consecutiveFailures++;
      // If 2 or more failures, report Disconnected; otherwise mark Connecting
      if (this.consecutiveFailures >= 2) {
        this.status = 'disconnected';
        this.details = {
          ...this.details,
          status: 'disconnected',
          error: 'Mahalliy agent bilan aloqa uzilgan (Port 4141 javob bermayapti)',
        };
      } else {
        this.status = 'connecting';
        this.details = {
          ...this.details,
          status: 'connecting',
        };
      }
    }

    this.isChecking = false;
    this.notify();
    return connected;
  }

  // Execute tool action through the real local agent
  public async executeAction(
    action: string,
    params: Record<string, any> = {},
    confirmed: boolean = false
  ): Promise<{
    success: boolean;
    connected: boolean;
    application?: string;
    verifiedRunning?: boolean;
    requiresConfirmation?: boolean;
    riskLevel?: string;
    message?: string;
    error?: string;
    stdout?: string;
    stderr?: string;
    data?: any;
  }> {
    // If agent is not connected, DO NOT fake!
    if (this.status !== 'connected') {
      // Try one immediate heartbeat before giving up
      const rechecked = await this.checkHeartbeat();
      if (!rechecked) {
        return {
          success: false,
          connected: false,
          error: '🔴 Mac agent is not connected. Iltimos, terminalda ./JarvisAI.command ni ishga tushiring.',
        };
      }
    }

    const payload = { action, params, confirmed };

    // 1. Try direct call to 127.0.0.1:4141/execute
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout
      const res = await fetch(`http://127.0.0.1:${DEFAULT_PORT}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const result = await res.json();
        return {
          ...result,
          connected: true,
        };
      }
    } catch (directErr) {
      // 2. Try proxy via server
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        const proxyRes = await fetch('/api/local-agent/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (proxyRes.ok) {
          const proxyResult = await proxyRes.json();
          return {
            ...proxyResult,
            connected: proxyResult.connected !== false,
          };
        }
      } catch (proxyErr) {
        // Fall through
      }
    }

    // Mark as disconnected if execution failed due to network
    this.status = 'disconnected';
    this.notify();

    return {
      success: false,
      connected: false,
      error: '🔴 Mac agent bilan aloqa uzildi. Operatsiya bajarilmadi.',
    };
  }
}

export const localAgent = new LocalAgentClient();
