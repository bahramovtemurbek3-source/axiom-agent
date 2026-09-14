import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  displayName: string;
  passwordHash: string;
  salt: string;
  avatar: string;
  bio: string;
  language: string;
  timezone: string;
  theme: string;
  voice: string;
  voiceSpeed: number;
  voicePitch: number;
  autoSpeak: boolean;
  createdAt: string;
  lastActive: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface ConversationRecord {
  id: string;
  userId: string;
  title: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  userId: string;
  sender: 'user' | 'jarvis' | 'system';
  text: string;
  substeps?: string[];
  completedBadge?: boolean;
  time: string;
  timestamp: number;
  thought?: string;
  sources?: Array<{ title: string; url: string; snippet?: string }>;
  embeddedCard?: {
    type: 'youtube' | 'folder' | 'google' | 'file';
    title: string;
    url?: string;
    subtitle?: string;
  };
}

export interface TaskRecord {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'youtube' | 'files' | 'system' | 'search' | 'text' | 'browser' | 'terminal' | 'general' | 'minecraft' | 'coding';
  status: 'Pending' | 'Planning' | 'Running' | 'Waiting' | 'Completed' | 'Failed' | 'Cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  createdTime: string;
  startedTime?: string;
  completedTime?: string;
  error?: string;
  logs: string[];
}

export interface ScheduledTaskRecord {
  id: string;
  userId: string;
  title: string;
  command: string;
  schedule: string; // e.g. "Every day at 20:00"
  frequency: 'once' | 'daily' | 'weekly' | 'hourly';
  nextRun: string;
  lastRun?: string;
  enabled: boolean;
  category: string;
  createdAt: string;
}

export interface SkillRecord {
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

export interface MemoryRecord {
  id: string;
  userId: string;
  category: 'preference' | 'fact' | 'instruction' | 'system';
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface UserSettingsRecord {
  userId: string;
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
    voiceEnabled: boolean;
    voiceInputEnabled?: boolean;
    voiceOutputEnabled?: boolean;
    gender: 'male' | 'female';
    language: string;
    selectedVoice: string;
    speechSpeed: number;
    pitch: number;
    volume: number;
    microphone: string;
    speaker: string;
    autoSpeak: boolean;
    pushToTalk: boolean;
  };
  developer?: {
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

export interface DatabaseSchema {
  users: UserRecord[];
  sessions: SessionRecord[];
  conversations: ConversationRecord[];
  messages: MessageRecord[];
  tasks: TaskRecord[];
  scheduledTasks: ScheduledTaskRecord[];
  skills: SkillRecord[];
  memories: MemoryRecord[];
  notifications: NotificationRecord[];
  settings: Record<string, UserSettingsRecord>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'jarvis-db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing helper using standard Node crypto
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, generatedSalt, 64).toString('hex');
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const newHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(newHash, 'hex'));
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Default Skills List with permission levels
export const DEFAULT_SKILLS: SkillRecord[] = [
  {
    id: 'skill-browser',
    name: 'Browser Automation Skill',
    category: 'browser',
    icon: 'Globe',
    description: 'Open web pages, search Google, extract site text, navigate URLs, and inspect web apps.',
    permissionLevel: 'MEDIUM',
    enabled: true,
    requiresConfirmation: false,
    executionCount: 14,
    lastUsed: 'Just now',
  },
  {
    id: 'skill-files',
    name: 'Filesystem Skill',
    category: 'files',
    icon: 'Folder',
    description: 'Create, read, move, copy, search, and manage files in the operating system.',
    permissionLevel: 'MEDIUM',
    enabled: true,
    requiresConfirmation: false,
    executionCount: 38,
    lastUsed: '10 min ago',
  },
  {
    id: 'skill-terminal',
    name: 'Terminal & CMD Skill',
    category: 'terminal',
    icon: 'Terminal',
    description: 'Execute PowerShell, Bash, and shell commands with root privilege inspection.',
    permissionLevel: 'HIGH',
    enabled: true,
    requiresConfirmation: true,
    executionCount: 22,
    lastUsed: '15 min ago',
  },
  {
    id: 'skill-system',
    name: 'System Diagnostics & Metrics',
    category: 'system',
    icon: 'Cpu',
    description: 'Read real-time CPU, RAM, disk, battery status, and OS running processes.',
    permissionLevel: 'LOW',
    enabled: true,
    requiresConfirmation: false,
    executionCount: 95,
    lastUsed: '1 min ago',
  },
  {
    id: 'skill-app',
    name: 'App Launcher & Window Control',
    category: 'app',
    icon: 'LayoutGrid',
    description: 'Launch, focus, and close desktop applications (Code, Chrome, Finder, Spotify).',
    permissionLevel: 'MEDIUM',
    enabled: true,
    requiresConfirmation: false,
    executionCount: 29,
    lastUsed: '30 min ago',
  },
  {
    id: 'skill-screenshot',
    name: 'Screen Vision & OCR Skill',
    category: 'screenshot',
    icon: 'Camera',
    description: 'Capture screen frame snapshots for vision verification and OCR inspection.',
    permissionLevel: 'LOW',
    enabled: true,
    requiresConfirmation: false,
    executionCount: 8,
    lastUsed: '1 hour ago',
  },
  {
    id: 'skill-clipboard',
    name: 'Clipboard Sync Skill',
    category: 'clipboard',
    icon: 'Clipboard',
    description: 'Read and write text snippets to and from the system clipboard.',
    permissionLevel: 'LOW',
    enabled: true,
    requiresConfirmation: false,
    executionCount: 16,
    lastUsed: '2 hours ago',
  },
  {
    id: 'skill-coding',
    name: 'Code Generation & Review Skill',
    category: 'coding',
    icon: 'Code',
    description: 'Write, debug, refactor, and run scripts in JavaScript, Python, TypeScript, and Rust.',
    permissionLevel: 'MEDIUM',
    enabled: true,
    requiresConfirmation: false,
    executionCount: 42,
    lastUsed: '25 min ago',
  },
  {
    id: 'skill-git',
    name: 'Git Version Control Skill',
    category: 'git',
    icon: 'GitBranch',
    description: 'Inspect git status, diff branches, stage files, and prepare commit messages safely.',
    permissionLevel: 'MEDIUM',
    enabled: true,
    requiresConfirmation: false,
    executionCount: 11,
    lastUsed: 'Yesterday',
  },
  {
    id: 'skill-minecraft',
    name: 'Minecraft Server & Mods Skill',
    category: 'minecraft',
    icon: 'Boxes',
    description: 'Manage Fabric/Forge server backups, inspect logs, crash dumps, and edit mod configs.',
    permissionLevel: 'HIGH',
    enabled: true,
    requiresConfirmation: true,
    executionCount: 5,
    lastUsed: '3 hours ago',
  },
];

// Initial seed default user (Temurbek) so existing sessions seamlessly work
const DEFAULT_SALT = crypto.randomBytes(16).toString('hex');
const DEFAULT_HASH = crypto.scryptSync('jarvis123', DEFAULT_SALT, 64).toString('hex');

const DEFAULT_USER: UserRecord = {
  id: 'usr-temurbek',
  username: 'temurbek',
  email: 'temurbek@gmail.com',
  displayName: 'Temurbek',
  passwordHash: DEFAULT_HASH,
  salt: DEFAULT_SALT,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  bio: 'Axiom Agent Owner & Lead Developer',
  language: 'uz',
  timezone: 'Asia/Tashkent',
  theme: 'dark',
  voice: 'uz-UZ',
  voiceSpeed: 1.0,
  voicePitch: 1.0,
  autoSpeak: true,
  createdAt: new Date('2025-06-01T00:00:00.000Z').toISOString(),
  lastActive: new Date().toISOString(),
};

const DEFAULT_SETTINGS: UserSettingsRecord = {
  userId: DEFAULT_USER.id,
  general: {
    language: 'uz',
    theme: 'dark',
    timezone: 'Asia/Tashkent',
    startupBehavior: 'dashboard',
    interfacePreferences: 'holographic',
  },
  ai: {
    model: 'gemini-3.8-flash',
    responseStyle: 'detailed',
    temperature: 0.7,
    contextLength: 8,
    memoryBehavior: 'always',
    taskExecutionConfirmation: true,
  },
  voice: {
    voiceEnabled: true,
    voiceInputEnabled: true,
    voiceOutputEnabled: true,
    gender: 'male',
    language: 'uz',
    selectedVoice: 'default',
    speechSpeed: 1.0,
    pitch: 1.0,
    volume: 1.0,
    microphone: 'Default Microphone',
    speaker: 'Default Speakers',
    autoSpeak: true,
    pushToTalk: false,
  },
  developer: {
    executionMode: 'real',
    agentPort: 4141,
    agentHost: '127.0.0.1',
    requireConfirmationForDangerous: true,
  },
  notifications: {
    taskCompletion: true,
    taskFailure: true,
    reminders: true,
    systemNotifications: true,
    soundEffects: true,
    desktopNotifications: true,
  },
  privacy: {
    saveConversationHistory: true,
    allowLongTermMemory: true,
    telemetryEnabled: true,
  },
};

const DEFAULT_CONVERSATION: ConversationRecord = {
  id: 'conv-main',
  userId: DEFAULT_USER.id,
  title: 'Asosiy Muloqot (JARVIS)',
  pinned: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_TASKS: TaskRecord[] = [
  {
    id: 't-1',
    userId: DEFAULT_USER.id,
    title: 'YouTube ochish',
    description: 'Brauzer orqali YouTube rasmiy portalini ishga tushirish',
    category: 'youtube',
    status: 'Completed',
    priority: 'medium',
    progress: 100,
    createdTime: '01:24',
    completedTime: '01:24',
    logs: ['Tizim brauzerini aniqlash', 'https://youtube.com manzilini ochish', 'Muvaffaqiyatli yuklandi'],
  },
  {
    id: 't-2',
    userId: DEFAULT_USER.id,
    title: 'Fayllarni ochish',
    description: 'Fayllar tizimi katalogini ko\'rsatish va tahlil qilish',
    category: 'files',
    status: 'Completed',
    priority: 'low',
    progress: 100,
    createdTime: '01:26',
    completedTime: '01:26',
    logs: ['Explorer/Finder ishga tushirildi', 'Hujjatlar papkasi ochildi'],
  },
  {
    id: 't-3',
    userId: DEFAULT_USER.id,
    title: "Tizim ma'lumotlarini tahlil qilish",
    description: 'CPU va RAM resurslarining holatini real vaqtda tekshirish',
    category: 'system',
    status: 'Completed',
    priority: 'high',
    progress: 100,
    createdTime: '01:10',
    completedTime: '01:10',
    logs: ['CPU yuklamasi: 12%', 'RAM: 36%', 'Tarmoq: Stable'],
  },
  {
    id: 't-4',
    userId: DEFAULT_USER.id,
    title: "Google'da qidiruv amalga oshirish",
    description: 'Internet tarmog\'idan kerakli maqola va yangiliklarni qidirish',
    category: 'search',
    status: 'Completed',
    priority: 'medium',
    progress: 100,
    createdTime: '00:45',
    completedTime: '00:45',
    logs: ['DuckDuckGo / Google qidiruv ulanishi', 'Natijalar olindi'],
  },
  {
    id: 't-5',
    userId: DEFAULT_USER.id,
    title: 'Yangi hisobot matnini yozish',
    description: 'Loyiha hujjatlari uchun qisqacha tavsif yaratish',
    category: 'text',
    status: 'Completed',
    priority: 'medium',
    progress: 100,
    createdTime: '00:30',
    completedTime: '00:30',
    logs: ['Matn generatsiya qilindi', 'Faylga saqlandi'],
  },
];

const DEFAULT_SCHEDULED: ScheduledTaskRecord[] = [
  {
    id: 'sched-1',
    userId: DEFAULT_USER.id,
    title: 'Minecraft server backupini qilish',
    command: 'tar -czf ~/minecraft_backups/world_$(date +%Y%m%d).tar.gz ~/minecraft/world',
    schedule: 'Har kuni soat 20:00 da',
    frequency: 'daily',
    nextRun: 'Bugun 20:00',
    lastRun: 'Kecha 20:00',
    enabled: true,
    category: 'minecraft',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sched-2',
    userId: DEFAULT_USER.id,
    title: 'Tizim keshini tozalash (Auto-Cache Purge)',
    command: 'rm -rf /tmp/axiom_cache/*',
    schedule: 'Har hafta yakshanba 03:00 da',
    frequency: 'weekly',
    nextRun: 'Yakshanba 03:00',
    lastRun: '7 kun oldin',
    enabled: true,
    category: 'system',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_MEMORIES: MemoryRecord[] = [
  {
    id: 'mem-1',
    userId: DEFAULT_USER.id,
    category: 'preference',
    key: 'Preferred Language',
    value: 'O\'zbek tili (Uzbek), rus va ingliz tillari ham qo\'llab-quvvatlanadi',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    userId: DEFAULT_USER.id,
    category: 'fact',
    key: 'Primary Computer',
    value: 'MacBook Air M1 (macOS Sonoma / Linux uplink)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mem-3',
    userId: DEFAULT_USER.id,
    category: 'instruction',
    key: 'Command Execution Safety',
    value: '10 tadan ortiq faylni o\'chirish yoki qaytmas harakatlar oldidan har doim "confirm" tasdig\'ini so\'rash',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: 'notif-1',
    userId: DEFAULT_USER.id,
    title: 'JARVIS Tizimi Tayyor',
    message: 'Neyron yadro va ovozli interfeys to\'liq ishga tushdi.',
    type: 'success',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    userId: DEFAULT_USER.id,
    title: 'Kompyuter Ulanishi Faol',
    message: 'MacBook-M1 bilan terminal va fayllar ko\'prigi o\'rnatildi.',
    type: 'info',
    read: false,
    createdAt: new Date().toISOString(),
  },
];

class DatabaseManager {
  private db: DatabaseSchema;

  constructor() {
    this.db = this.load();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all arrays exist
        return {
          users: parsed.users || [DEFAULT_USER],
          sessions: parsed.sessions || [],
          conversations: parsed.conversations || [DEFAULT_CONVERSATION],
          messages: parsed.messages || [],
          tasks: parsed.tasks || DEFAULT_TASKS,
          scheduledTasks: parsed.scheduledTasks || DEFAULT_SCHEDULED,
          skills: parsed.skills || DEFAULT_SKILLS,
          memories: parsed.memories || DEFAULT_MEMORIES,
          notifications: parsed.notifications || DEFAULT_NOTIFICATIONS,
          settings: parsed.settings || { [DEFAULT_USER.id]: DEFAULT_SETTINGS },
        };
      } catch (err) {
        console.warn('Error loading db file, re-initializing:', err);
      }
    }

    const initial: DatabaseSchema = {
      users: [DEFAULT_USER],
      sessions: [],
      conversations: [DEFAULT_CONVERSATION],
      messages: [],
      tasks: DEFAULT_TASKS,
      scheduledTasks: DEFAULT_SCHEDULED,
      skills: DEFAULT_SKILLS,
      memories: DEFAULT_MEMORIES,
      notifications: DEFAULT_NOTIFICATIONS,
      settings: { [DEFAULT_USER.id]: DEFAULT_SETTINGS },
    };
    this.save(initial);
    return initial;
  }

  private save(data?: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data || this.db, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write jarvis db file:', e);
    }
  }

  // Users
  getUserById(id: string): UserRecord | undefined {
    return this.db.users.find((u) => u.id === id);
  }

  getUserByUsernameOrEmail(identifier: string): UserRecord | undefined {
    const lower = identifier.toLowerCase().trim();
    return this.db.users.find(
      (u) => u.username.toLowerCase() === lower || u.email.toLowerCase() === lower
    );
  }

  createUser(params: {
    username: string;
    email: string;
    displayName: string;
    passwordHash: string;
    salt: string;
  }): UserRecord {
    const newUser: UserRecord = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: params.username,
      email: params.email,
      displayName: params.displayName || params.username,
      passwordHash: params.passwordHash,
      salt: params.salt,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      bio: 'JARVIS AI Operator',
      language: 'uz',
      timezone: 'Asia/Tashkent',
      theme: 'dark',
      voice: 'uz-UZ',
      voiceSpeed: 1.0,
      voicePitch: 1.0,
      autoSpeak: true,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    this.db.users.push(newUser);

    // Create default settings for user
    this.db.settings[newUser.id] = {
      ...DEFAULT_SETTINGS,
      userId: newUser.id,
    };

    // Create default conversation
    this.db.conversations.push({
      id: `conv-${Date.now()}`,
      userId: newUser.id,
      title: 'Asosiy Muloqot (JARVIS)',
      pinned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.save();
    return newUser;
  }

  updateUser(id: string, updates: Partial<UserRecord>): UserRecord | undefined {
    const user = this.getUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates, { lastActive: new Date().toISOString() });
    this.save();
    return user;
  }

  deleteUser(id: string): boolean {
    const index = this.db.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    this.db.users.splice(index, 1);
    this.db.sessions = this.db.sessions.filter((s) => s.userId !== id);
    this.db.conversations = this.db.conversations.filter((c) => c.userId !== id);
    this.db.messages = this.db.messages.filter((m) => m.userId !== id);
    this.db.tasks = this.db.tasks.filter((t) => t.userId !== id);
    this.db.scheduledTasks = this.db.scheduledTasks.filter((s) => s.userId !== id);
    this.db.memories = this.db.memories.filter((m) => m.userId !== id);
    delete this.db.settings[id];
    this.save();
    return true;
  }

  // Sessions
  createSession(userId: string): SessionRecord {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    const session: SessionRecord = {
      token,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt,
    };
    this.db.sessions.push(session);
    this.save();
    return session;
  }

  getSession(token: string): SessionRecord | undefined {
    const session = this.db.sessions.find((s) => s.token === token);
    if (!session) return undefined;
    if (new Date(session.expiresAt) < new Date()) {
      this.deleteSession(token);
      return undefined;
    }
    return session;
  }

  deleteSession(token: string): void {
    this.db.sessions = this.db.sessions.filter((s) => s.token !== token);
    this.save();
  }

  getUserSessions(userId: string): SessionRecord[] {
    return this.db.sessions.filter((s) => s.userId === userId);
  }

  // Settings
  getSettings(userId: string): UserSettingsRecord {
    if (!this.db.settings[userId]) {
      this.db.settings[userId] = {
        ...DEFAULT_SETTINGS,
        userId,
      };
      this.save();
    }
    return this.db.settings[userId];
  }

  updateSettings(userId: string, partial: Partial<UserSettingsRecord>): UserSettingsRecord {
    const current = this.getSettings(userId);
    this.db.settings[userId] = {
      ...current,
      ...partial,
      general: { ...current.general, ...(partial.general || {}) },
      ai: { ...current.ai, ...(partial.ai || {}) },
      voice: { ...current.voice, ...(partial.voice || {}) },
      developer: { ...(current.developer || DEFAULT_SETTINGS.developer!), ...(partial.developer || {}) },
      notifications: { ...current.notifications, ...(partial.notifications || {}) },
      privacy: { ...current.privacy, ...(partial.privacy || {}) },
    };
    this.save();
    return this.db.settings[userId];
  }

  // Conversations
  getConversations(userId: string): ConversationRecord[] {
    return this.db.conversations
      .filter((c) => c.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  createConversation(userId: string, title?: string): ConversationRecord {
    const conv: ConversationRecord = {
      id: `conv-${Date.now()}`,
      userId,
      title: title || 'Yangi Suhbat',
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.db.conversations.unshift(conv);
    this.save();
    return conv;
  }

  updateConversation(id: string, updates: Partial<ConversationRecord>): ConversationRecord | undefined {
    const conv = this.db.conversations.find((c) => c.id === id);
    if (!conv) return undefined;
    Object.assign(conv, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return conv;
  }

  deleteConversation(id: string): boolean {
    const index = this.db.conversations.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.db.conversations.splice(index, 1);
    this.db.messages = this.db.messages.filter((m) => m.conversationId !== id);
    this.save();
    return true;
  }

  // Messages
  getMessages(conversationId: string): MessageRecord[] {
    return this.db.messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  addMessage(msg: Omit<MessageRecord, 'id' | 'timestamp'>): MessageRecord {
    const newMsg: MessageRecord = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    this.db.messages.push(newMsg);

    // Update conversation updatedAt
    const conv = this.db.conversations.find((c) => c.id === msg.conversationId);
    if (conv) {
      conv.updatedAt = new Date().toISOString();
    }

    this.save();
    return newMsg;
  }

  clearMessages(conversationId: string): void {
    this.db.messages = this.db.messages.filter((m) => m.conversationId !== conversationId);
    this.save();
  }

  // Tasks
  getTasks(userId: string): TaskRecord[] {
    return this.db.tasks.filter((t) => t.userId === userId);
  }

  createTask(task: Omit<TaskRecord, 'id' | 'createdTime'>): TaskRecord {
    const newTask: TaskRecord = {
      ...task,
      id: `task-${Date.now()}`,
      createdTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    this.db.tasks.unshift(newTask);
    this.save();
    return newTask;
  }

  updateTask(id: string, updates: Partial<TaskRecord>): TaskRecord | undefined {
    const task = this.db.tasks.find((t) => t.id === id);
    if (!task) return undefined;
    Object.assign(task, updates);
    this.save();
    return task;
  }

  deleteTask(id: string): boolean {
    const idx = this.db.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    this.db.tasks.splice(idx, 1);
    this.save();
    return true;
  }

  // Scheduled Tasks
  getScheduledTasks(userId: string): ScheduledTaskRecord[] {
    return this.db.scheduledTasks.filter((s) => s.userId === userId);
  }

  createScheduledTask(task: Omit<ScheduledTaskRecord, 'id' | 'createdAt'>): ScheduledTaskRecord {
    const newSched: ScheduledTaskRecord = {
      ...task,
      id: `sched-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.db.scheduledTasks.unshift(newSched);
    this.save();
    return newSched;
  }

  updateScheduledTask(id: string, updates: Partial<ScheduledTaskRecord>): ScheduledTaskRecord | undefined {
    const sched = this.db.scheduledTasks.find((s) => s.id === id);
    if (!sched) return undefined;
    Object.assign(sched, updates);
    this.save();
    return sched;
  }

  deleteScheduledTask(id: string): boolean {
    const idx = this.db.scheduledTasks.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.db.scheduledTasks.splice(idx, 1);
    this.save();
    return true;
  }

  // Skills
  getSkills(): SkillRecord[] {
    return this.db.skills;
  }

  updateSkill(id: string, updates: Partial<SkillRecord>): SkillRecord | undefined {
    const skill = this.db.skills.find((s) => s.id === id);
    if (!skill) return undefined;
    Object.assign(skill, updates);
    this.save();
    return skill;
  }

  // Memories
  getMemories(userId: string): MemoryRecord[] {
    return this.db.memories.filter((m) => m.userId === userId);
  }

  addMemory(memory: Omit<MemoryRecord, 'id' | 'createdAt' | 'updatedAt'>): MemoryRecord {
    const newMem: MemoryRecord = {
      ...memory,
      id: `mem-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.db.memories.push(newMem);
    this.save();
    return newMem;
  }

  deleteMemory(id: string): boolean {
    const idx = this.db.memories.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    this.db.memories.splice(idx, 1);
    this.save();
    return true;
  }

  clearMemories(userId: string): void {
    this.db.memories = this.db.memories.filter((m) => m.userId !== userId);
    this.save();
  }

  // Notifications
  getNotifications(userId: string): NotificationRecord[] {
    return this.db.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addNotification(notif: Omit<NotificationRecord, 'id' | 'createdAt' | 'read'>): NotificationRecord {
    const newNotif: NotificationRecord = {
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.db.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  markNotificationAsRead(id: string): void {
    const notif = this.db.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
    }
  }

  markAllNotificationsRead(userId: string): void {
    this.db.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    this.save();
  }

  clearNotifications(userId: string): void {
    this.db.notifications = this.db.notifications.filter((n) => n.userId !== userId);
    this.save();
  }
}

export const db = new DatabaseManager();
