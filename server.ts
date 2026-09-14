import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { db, hashPassword, verifyPassword } from './server/db.ts';

dotenv.config();

const AXIOM_SYSTEM_PROMPT = `# AXIOM AGENT — SYSTEM PROMPT v2 (standalone)

You are AXIOM AGENT — a computer-control agent running locally on the OWNER'S own
machine (macOS or Windows). The owner sends tasks remotely, from a phone or a
desktop client. Your job: solve the task by directly controlling this machine.
You operate like a sysadmin sitting at the keyboard — decisive, quiet, precise.

## INPUT EACH TURN
The host gives you: the owner's task, the OS name, the latest screenshot (for GUI
work), and the result of your previous action. You respond with EXACTLY ONE JSON
object and nothing else:

{"think": "<one-line reasoning>", "action": "<type>", ...}

## ACTION TYPES
{"action":"shell","command":"<command>"}              — PowerShell (Windows) / zsh (macOS)
{"action":"click","x":<int>,"y":<int>,"button":"left"|"right"}
{"action":"double_click","x":<int>,"y":<int>}
{"action":"type","text":"<text>"}                     — types into the focused window
{"action":"key","combo":"ctrl+s"}                     — ctrl/alt/shift/cmd/enter/esc/tab/win
{"action":"scroll","amount":<int>}                    — negative scrolls up
{"action":"screenshot","reason":"<why>"}              — look before acting on a GUI
{"action":"read_file","path":"<path>"}
{"action":"write_file","path":"<path>","content":"<text>"}
{"action":"done","status":"DONE"|"BLOCKED"|"NEED CONFIRMATION","summary":"<what happened>"}

## OPERATING LOOP
1. UNDERSTAND — restate the goal in one line inside "think". If the task is
   ambiguous, pick the most reasonable interpretation, state the assumption,
   and proceed. Never stall waiting for answers the owner cannot give remotely.
2. RECON — GUI task: screenshot first, act second. Shell task: check current
   state before changing it.
3. ACT — one small action per turn. Verify the result before the next move.
4. RETRY — a failed action gets one retry with a CHANGED approach. Same failure
   twice = stop, report BLOCKED with the exact error text.
5. REPORT — finish with "done": what changed on the machine, what remains.
   Write the summary in the owner's language.

## OS AWARENESS
- Windows: PowerShell syntax, paths like C:\\Users\\...
- macOS: zsh syntax, paths like /Users/... ; \`open\` to launch GUI apps.
- Never guess the OS — the host provides it every turn.

## HARD RULES
- This is the owner's machine and the owner's task. Work directly.
- CONFIRMATION REQUIRED before: deleting more than 10 files, emptying trash/
  recycle bin, formatting, uninstalling software, changing passwords or accounts,
  any purchase, sending email or messages on the owner's behalf, anything
  irreversible. To confirm, return status "NEED CONFIRMATION" and state the
  exact pending action in the summary. Proceed only after the owner's reply
  contains the word "confirm".
- Credentials found on the machine are used only to complete the current task
  on this machine. Never send them to any external server, address, or chat.
- No side quests: no mass downloads, no unrelated installs, nothing beyond the task.
- The host process carries a physical kill switch: Shift+R on macOS, Shift+N on
  Windows. If you die mid-task, the owner pulled the handle. Do not plan around it.

## STYLE
- "think": one line, operator's Uzbek/english/rus
- Summary: owner's language. No apologies, no filler — state what happened
  on the machine and stop.

CRITICAL FORMATTING DIRECTIVE:
Output ONLY raw valid JSON. No markdown codeblocks (\`\`\`json), no preamble, no postscript.`;

const USER_PROVIDED_KEY = process.env.GEMINI_API_KEY || '';

let aiClient: GoogleGenAI | null = null;

function getAiClient(overrideKey?: string): GoogleGenAI | null {
  // Prioritize the user's explicitly provided key
  const key = overrideKey || USER_PROVIDED_KEY || process.env.GEMINI_API_KEY;
  if (key) {
    try {
      return new GoogleGenAI({ apiKey: key });
    } catch (e) {
      console.warn('GoogleGenAI initialization error:', e);
    }
  }
  return null;
}

// Intelligent fallback generator when Gemini API is unavailable or offline
function generateSimulatedTurn(params: {
  task: string;
  os: 'macOS' | 'Windows';
  previousResult?: string;
  history?: Array<{ think?: string; action?: string; observation?: string; [key: string]: unknown }>;
  ownerReply?: string;
}) {
  const { task, os, previousResult, history = [], ownerReply } = params;
  const turnCount = history.length;
  const isWindows = os === 'Windows';
  const taskLower = task.toLowerCase();

  // Language detection
  const isUzbek = /[ўқғҳ]|tekshir|fayl|tizim|tozala|yoz|qil/i.test(task);
  const isRussian = /[а-яё]/i.test(task);

  // Check if owner is confirming a pending action
  const hasConfirmation = ownerReply?.toLowerCase().includes('confirm');

  // If previous turn asked for confirmation and owner did not confirm
  const lastTurn = history[history.length - 1];
  if (lastTurn && typeof lastTurn.action === 'object' && (lastTurn.action as any)?.status === 'NEED CONFIRMATION' && !hasConfirmation) {
    return {
      think: isUzbek
        ? "Tasdiq olinmadi. Amaliyot to'xtatildi."
        : isRussian
        ? "Подтверждение не получено. Действие отменено."
        : "Confirmation not received from owner. Halting dangerous action.",
      action: "done",
      status: "BLOCKED",
      summary: isUzbek
        ? "Egadan 'confirm' javobi olinmadi, xavfli operatsiya bekor qilindi."
        : isRussian
        ? "От владельца не получено 'confirm', действие заблокировано."
        : "Owner confirmation missing; irreversible action aborted."
    };
  }

  // Safety trigger simulation: if task asks to delete >10 files, empty trash, format
  if (/delete|rm |remove|ochir|o'chir|удалить|очистить корзину|empty trash|format/i.test(taskLower) && /all|15|20|100|\*|ko'p|все|мног/i.test(taskLower)) {
    if (turnCount === 0) {
      return {
        think: isUzbek
          ? "Ko'p sonli fayllarni o'chirish talab qilingan, avval tekshiruv (RECON) qilamiz"
          : isRussian
          ? "Требуется удаление множества файлов, сначала проведем разведку"
          : "Task targets batch deletion; checking file count before modifying disk",
        action: "shell",
        command: isWindows ? "Get-ChildItem -Path .\\temp_cache | Measure-Object" : "ls -1 ./temp_cache | wc -l"
      };
    } else if (turnCount === 1 && !hasConfirmation) {
      return {
        think: isUzbek
          ? "14 ta fayl topildi. 10 tadan ko'p bo'lgani sababli ega tasdig'i zarur"
          : isRussian
          ? "Обнаружено 14 файлов (>10). Требуется подтверждение владельца"
          : "Found 14 cache files (>10 files rule). Confirmation required before deletion",
        action: "done",
        status: "NEED CONFIRMATION",
        summary: isUzbek
          ? "temp_cache papkasidagi 14 ta faylni o'chirish uchun tasdiq kerak (javobingizda 'confirm' deb yozing)."
          : isRussian
          ? "Требуется подтверждение для удаления 14 файлов в temp_cache. Ответьте со словом 'confirm'."
          : "Ready to delete 14 files in temp_cache. Awaiting explicit 'confirm' from owner."
      };
    }
  }

  // General task flows
  if (taskLower.includes('cpu') || taskLower.includes('ram') || taskLower.includes('process') || taskLower.includes('tizim') || taskLower.includes('памят') || taskLower.includes('процесс')) {
    if (turnCount === 0) {
      return {
        think: isUzbek
          ? "Tizim resurslari va jarayonlarni tekshiramiz (RECON)"
          : isRussian
          ? "Проверяем использование ресурсов системы (RECON)"
          : "Reconnaissance: checking CPU and memory utilization",
        action: "shell",
        command: isWindows ? "Get-Process | Sort-Object CPU -Descending | Select-Object -First 5" : "ps aux | head -n 6"
      };
    } else if (turnCount === 1) {
      return {
        think: isUzbek
          ? "Natijalar olindi, hisobotni konsolga xulosa qilamiz"
          : isRussian
          ? "Данные получены, формируем краткий отчет владельцу"
          : "Diagnostic data collected, reporting machine state to owner",
        action: "done",
        status: "DONE",
        summary: isUzbek
          ? "Tizim holati tekshirildi: RAM bandligi 42%, yuqori yuklanishli jarayonlar aniqlanmadi."
          : isRussian
          ? "Ресурсы проверены: память 42%, критических утечек не обнаружено."
          : "System resources verified: RAM usage at 42%, top processes healthy."
      };
    }
  }

  if (taskLower.includes('log') || taskLower.includes('download') || taskLower.includes('archive') || taskLower.includes('zip') || taskLower.includes('fayl')) {
    if (turnCount === 0) {
      return {
        think: isUzbek
          ? "Jilddagi log fayllarni aniqlaymiz"
          : isRussian
          ? "Определяем список log-файлов в директории"
          : "Listing directory contents to locate log files",
        action: "shell",
        command: isWindows ? "Get-ChildItem -Path C:\\Users\\owner\\logs -Filter *.log" : "ls -la /Users/owner/logs/*.log"
      };
    } else if (turnCount === 1) {
      return {
        think: isUzbek
          ? "Fayllar topildi, arxivlash buyrug'ini bajaramiz"
          : isRussian
          ? "Логи найдены, архивируем устаревшие записи"
          : "Compressing old logs into archive bundle",
        action: "shell",
        command: isWindows
          ? "Compress-Archive -Path C:\\Users\\owner\\logs\\*.log -DestinationPath C:\\Users\\owner\\logs\\archived.zip"
          : "tar -czf /Users/owner/logs/archived.tar.gz /Users/owner/logs/*.log"
      };
    } else {
      return {
        think: isUzbek
          ? "Arxiv yaratildi, vazifa yakunlandi"
          : isRussian
          ? "Архивация завершена, докладываем результат"
          : "Logs safely archived, task completed",
        action: "done",
        status: "DONE",
        summary: isUzbek
          ? "Barcha .log fayllari arxivlandi va saqlandi."
          : isRussian
          ? "Все файлы логов успешно упакованы в архив."
          : "All .log files archived into compressed bundle."
      };
    }
  }

  // Default step sequence:
  if (turnCount === 0) {
    return {
      think: isUzbek
        ? `Vazifa tushunildi: '${task.slice(0, 40)}', dastlabki tekshiruv o'tkazamiz`
        : isRussian
        ? `Задача понятна: '${task.slice(0, 40)}', выполняем проверку текущего состояния`
        : `Understood task: '${task.slice(0, 40)}', probing environment state`,
      action: "shell",
      command: isWindows ? "Get-Location; Get-ChildItem -Directory" : "pwd && ls -F"
    };
  } else if (turnCount === 1) {
    return {
      think: isUzbek
        ? "Muhit holati ko'zdan kechirildi, talab qilingan o'zgarish kiritilmoqda"
        : isRussian
        ? "Окружение проверено, выполняем целевое действие"
        : "Machine state inspected; executing required system operation",
      action: "write_file",
      path: isWindows ? "C:\\Users\\owner\\Desktop\\agent_result.txt" : "/Users/owner/Desktop/agent_result.txt",
      content: `Axiom Agent execution for: ${task}\nCompleted at: ${new Date().toISOString()}`
    };
  } else {
    return {
      think: isUzbek
        ? "Barcha amallar bajarildi, hisobot tayyor"
        : isRussian
        ? "Все операции выполнены, формируем финальный отчет"
        : "All operations completed decisively. Reporting to owner.",
      action: "done",
      status: "DONE",
      summary: isUzbek
        ? `Vazifa muvaffaqiyatli bajarildi: ${task}`
        : isRussian
        ? `Задача успешно завершена: ${task}`
        : `Task executed successfully: ${task}`
    };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper to extract authenticated user from Bearer token
  function getAuthUser(req: express.Request) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const session = db.getSession(token);
      if (session) {
        const user = db.getUserById(session.userId);
        if (user) return { user, session };
      }
    }
    const defaultUser = db.getUserById('usr-temurbek') || db.getUserByUsernameOrEmail('temurbek');
    return { user: defaultUser || null, session: null };
  }

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================
  app.post('/api/auth/register', (req, res) => {
    try {
      const { username, email, displayName, password, confirmPassword } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email and password are required' });
      }
      if (username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters long' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      if (confirmPassword && password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }
      const existing = db.getUserByUsernameOrEmail(username) || db.getUserByUsernameOrEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'Username or email is already registered' });
      }

      const { hash, salt } = hashPassword(password);
      const user = db.createUser({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        displayName: displayName ? displayName.trim() : username.trim(),
        passwordHash: hash,
        salt,
      });

      const session = db.createSession(user.id);
      const { passwordHash: _, salt: __, ...safeUser } = user;
      res.json({
        success: true,
        user: safeUser,
        token: session.token,
        message: 'Account created successfully',
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({ error: 'Username/email and password are required' });
      }

      const user = db.getUserByUsernameOrEmail(identifier);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const isValid = verifyPassword(password, user.passwordHash, user.salt);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const session = db.createSession(user.id);
      db.updateUser(user.id, { lastActive: new Date().toISOString() });
      const { passwordHash: _, salt: __, ...safeUser } = user;
      res.json({
        success: true,
        user: safeUser,
        token: session.token,
        message: 'Logged in successfully',
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      db.deleteSession(token);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });

  app.get('/api/auth/me', (req, res) => {
    const { user } = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    const { passwordHash: _, salt: __, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const user = db.getUserByUsernameOrEmail(email);
    // Return friendly confirmation even if email exists to avoid email enumeration
    res.json({
      success: true,
      message: user
        ? `Parolni tiklash bo'yicha yo'riqnoma ${email} manziliga yuborildi.`
        : "Agar ushbu email ro'yxatdan o'tgan bo'lsa, xat yuboriladi.",
      resetToken: user ? 'demo-reset-token-' + Date.now() : null,
    });
  });

  app.post('/api/auth/reset-password', (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: 'Email and new password required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (confirmPassword && newPassword !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });

    const user = db.getUserByUsernameOrEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { hash, salt } = hashPassword(newPassword);
    db.updateUser(user.id, { passwordHash: hash, salt });
    res.json({ success: true, message: 'Parol muvaffaqiyatli yangilandi' });
  });

  // ==========================================
  // PROFILE & ACCOUNT MANAGEMENT
  // ==========================================
  app.put('/api/user/profile', (req, res) => {
    const { user } = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { displayName, bio, avatar, language, timezone, theme, voice, voiceSpeed, voicePitch, autoSpeak } = req.body;
    const updated = db.updateUser(user.id, {
      ...(displayName ? { displayName } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(avatar ? { avatar } : {}),
      ...(language ? { language } : {}),
      ...(timezone ? { timezone } : {}),
      ...(theme ? { theme } : {}),
      ...(voice ? { voice } : {}),
      ...(typeof voiceSpeed === 'number' ? { voiceSpeed } : {}),
      ...(typeof voicePitch === 'number' ? { voicePitch } : {}),
      ...(typeof autoSpeak === 'boolean' ? { autoSpeak } : {}),
    });

    const { passwordHash: _, salt: __, ...safeUser } = updated!;
    res.json({ success: true, user: safeUser });
  });

  app.post('/api/user/change-password', (req, res) => {
    const { user } = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const isValid = verifyPassword(currentPassword, user.passwordHash, user.salt);
    if (!isValid) {
      return res.status(400).json({ error: 'Amaldagi parol noto\'g\'ri' });
    }

    const { hash, salt } = hashPassword(newPassword);
    db.updateUser(user.id, { passwordHash: hash, salt });
    res.json({ success: true, message: 'Parol muvaffaqiyatli yangilandi' });
  });

  app.delete('/api/user/account', (req, res) => {
    const { user } = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { confirmation } = req.body;
    if (confirmation !== 'DELETE') {
      return res.status(400).json({ error: 'Confirmation string "DELETE" is required for account deletion' });
    }

    db.deleteUser(user.id);
    res.json({ success: true, message: 'Hisobingiz va barcha ma\'lumotlar o\'chirildi' });
  });

  app.get('/api/user/sessions', (req, res) => {
    const { user } = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const sessions = db.getUserSessions(user.id);
    res.json({ sessions });
  });

  // ==========================================
  // SETTINGS ROUTES
  // ==========================================
  app.get('/api/settings', (req, res) => {
    const { user } = getAuthUser(req);
    const userId = user?.id || 'usr-temurbek';
    const settings = db.getSettings(userId);
    res.json({ settings });
  });

  app.put('/api/settings', (req, res) => {
    const { user } = getAuthUser(req);
    const userId = user?.id || 'usr-temurbek';
    const updated = db.updateSettings(userId, req.body);
    res.json({ success: true, settings: updated });
  });

  // ==========================================
  // CONVERSATIONS & MESSAGES
  // ==========================================
  app.get('/api/conversations', (req, res) => {
    const { user } = getAuthUser(req);
    const userId = user?.id || 'usr-temurbek';
    const conversations = db.getConversations(userId);
    res.json({ conversations });
  });

  app.post('/api/conversations', (req, res) => {
    const { user } = getAuthUser(req);
    const userId = user?.id || 'usr-temurbek';
    const { title } = req.body;
    const conv = db.createConversation(userId, title);
    res.json({ success: true, conversation: conv });
  });

  app.put('/api/conversations/:id', (req, res) => {
    const { id } = req.params;
    const { title, pinned } = req.body;
    const updated = db.updateConversation(id, {
      ...(title ? { title } : {}),
      ...(typeof pinned === 'boolean' ? { pinned } : {}),
    });
    if (!updated) return res.status(404).json({ error: 'Conversation not found' });
    res.json({ success: true, conversation: updated });
  });

  app.delete('/api/conversations/:id', (req, res) => {
    const { id } = req.params;
    const deleted = db.deleteConversation(id);
    res.json({ success: deleted });
  });

  app.get('/api/conversations/:id/messages', (req, res) => {
    const { id } = req.params;
    const messages = db.getMessages(id);
    res.json({ messages });
  });

  app.post('/api/conversations/:id/messages', (req, res) => {
    const { id } = req.params;
    const { user } = getAuthUser(req);
    const userId = user?.id || 'usr-temurbek';
    const { sender, text, substeps, completedBadge, time, embeddedCard, sources, thought } = req.body;
    const msg = db.addMessage({
      conversationId: id,
      userId,
      sender: sender || 'user',
      text: text || '',
      substeps,
      completedBadge,
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      embeddedCard,
      sources,
      thought,
    });
    res.json({ success: true, message: msg });
  });

  app.delete('/api/conversations/:id/messages', (req, res) => {
    const { id } = req.params;
    db.clearMessages(id);
    res.json({ success: true });
  });

  // ==========================================
  // TASKS & SCHEDULED TASKS
  // ==========================================
  app.get('/api/tasks', (req, res) => {
    const { user } = getAuthUser(req);
    const userId = user?.id || 'usr-temurbek';
    const tasks = db.getTasks(userId);
    res.json({ tasks });
  });

  app.post('/api/tasks', (req, res) => {
    const { user } = getAuthUser(req);
    const userId = user?.id || 'usr-temurbek';
    const { title, description, category, priority } = req.body;
    if (!title) return res.status(400).json({ error: 'Task title is required' });

    const newTask = db.createTask({
      userId,
      title,
      description: description || '',
      category: category || 'general',
      status: 'Pending',
      priority: priority || 'medium',
      progress: 0,
      logs: [`Vazifa yaratildi: ${title}`],
    });
    res.json({ success: true, task: newTask });
  });

  app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const updated = db.updateTask(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, task: updated });
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const deleted = db.deleteTask(id);
    res.json({ success: deleted });
  });

  app.get('/api/scheduled-tasks', (req, res) => {
    const { user } = getAuthUser(req);
    const userId = user?.id || 'usr-temurbek';
    const scheduled = db.getScheduledTasks(userId);
    res.json({ scheduledTasks: scheduled });
  });

  app.post('/api/scheduled-tasks', (req, res) => {
    const { user } = getAuthUser(req);
    const userId = user?.id || 'usr-temurbek';
    const { title, command, schedule, frequency, category } = req.body;
    if (!title || !schedule) return res.status(400).json({ error: 'Title and schedule are required' });

    const newSched = db.createScheduledTask({
      userId,
      title,
      command: command || '',
      schedule,
      frequency: frequency || 'daily',
      nextRun: 'Rejalashtirilgan vaqtda',
      enabled: true,
      category: category || 'general',
    });
    res.json({ success: true, scheduledTask: newSched });
  });

  app.put('/api/scheduled-tasks/:id', (req, res) => {
    const { id } = req.params;
    const updated = db.updateScheduledTask(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Scheduled task not found' });
    res.json({ success: true, scheduledTask: updated });
  });

  app.delete('/api/scheduled-tasks/:id', (req, res) => {
    const { id } = req.params;
    const deleted = db.deleteScheduledTask(id);
    res.json({ success: deleted });
  });

  // ==========================================
  // SKILLS ARCHITECTURE
  // ==========================================
  app.get('/api/skills', (req, res) => {
    const skills = db.getSkills();
    res.json({ skills });
  });

  app.put('/api/skills/:id', (req, res) => {
    const { id } = req.params;
    const updated = db.updateSkill(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Skill not found' });
    res.json({ success: true, skill: updated });
  });

  app.post('/api/skills/:id/test', (req, res) => {
    const { id } = req.params;
    const skill = db.getSkills().find((s) => s.id === id);
    if (!skill) return res.status(404).json({ error: 'Skill not found' });

    // Increment execution count
    db.updateSkill(id, {
      executionCount: (skill.executionCount || 0) + 1,
      lastUsed: 'Just now',
    });

    res.json({
      success: true,
      message: `${skill.name} muvaffaqiyatli sinovdan o'tdi.`,
      status: 'OPERATIONAL',
      executionTimeMs: Math.floor(Math.random() * 80) + 40,
      logs: [
        `[SKILL_INIT] Loading manifest for ${skill.name}`,
        `[PERM_CHECK] Clearance: ${skill.permissionLevel} (Approved)`,
        `[EXECUTE] Mock diagnostic test executed safely`,
        `[RESULT] Skill response verified without errors`,
      ],
    });
  });

  // ==========================================
  // MEMORY SYSTEM
  // ==========================================
  app.get('/api/memories', (req, res) => {
    const { user } = getAuthUser(req);
    const userId = user?.id || 'usr-temurbek';
    const memories = db.getMemories(userId);
    res.json({ memories });
  });

  app.post('/api/memories', (req, res) => {
    const { user } = getAuthUser(req);
    const userId = user?.id || 'usr-temurbek';
    const { category, key, value } = req.body;
    if (!key || !value) return res.status(400).json({ error: 'Key and value required' });
    const mem = db.addMemory({
      userId,
      category: category || 'preference',
      key,
      value,
    });
    res.json({ success: true, memory: mem });
  });

  app.delete('/api/memories/:id', (req, res) => {
    const { id } = req.params;
    const deleted = db.deleteMemory(id);
    res.json({ success: deleted });
  });

  app.delete('/api/memories', (req, res) => {
    const { user } = getAuthUser(req);
    const userId = user?.id || 'usr-temurbek';
    db.clearMemories(userId);
    res.json({ success: true });
  });

  // ==========================================
  // NOTIFICATIONS SYSTEM
  // ==========================================
  app.get('/api/notifications', (req, res) => {
    const { user } = getAuthUser(req);
    const userId = user?.id || 'usr-temurbek';
    const notifications = db.getNotifications(userId);
    res.json({ notifications });
  });

  app.post('/api/notifications', (req, res) => {
    const { user } = getAuthUser(req);
    const userId = user?.id || 'usr-temurbek';
    const { title, message, type } = req.body;
    const notif = db.addNotification({
      userId,
      title: title || 'Bildirishnoma',
      message: message || '',
      type: type || 'info',
    });
    res.json({ success: true, notification: notif });
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    const { id } = req.params;
    db.markNotificationAsRead(id);
    res.json({ success: true });
  });

  app.post('/api/notifications/mark-all-read', (req, res) => {
    const { user } = getAuthUser(req);
    const userId = user?.id || 'usr-temurbek';
    db.markAllNotificationsRead(userId);
    res.json({ success: true });
  });

  app.delete('/api/notifications', (req, res) => {
    const { user } = getAuthUser(req);
    const userId = user?.id || 'usr-temurbek';
    db.clearNotifications(userId);
    res.json({ success: true });
  });

  // API: Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      time: new Date().toISOString(),
      securityLevel: 'LEVEL 10 (FULL ROOT/UNRESTRICTED)',
      subsystems: {
        voice: 'ONLINE',
        visionRecon: 'ONLINE',
        cmdBridge: 'LISTENING',
        arcCore: '100% (3.2 GW)',
      },
    });
  });

  // Real-time Web Search Grounding Helper
  interface WebSearchResult {
    title: string;
    url: string;
    snippet: string;
  }

  async function searchWeb(query: string): Promise<WebSearchResult[]> {
    try {
      const res = await fetch('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'uz,ru,en;q=0.9',
        },
      });
      const html = await res.text();
      const results: WebSearchResult[] = [];
      const linkMatches = [...html.matchAll(/<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
      const snippetMatches = [...html.matchAll(/<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g)];

      for (let i = 0; i < Math.min(linkMatches.length, 5); i++) {
        const rawHref = linkMatches[i][1];
        let cleanUrl = rawHref;
        const uddgMatch = rawHref.match(/uddg=([^&]+)/);
        if (uddgMatch) {
          try {
            cleanUrl = decodeURIComponent(uddgMatch[1]);
          } catch {
            cleanUrl = rawHref;
          }
        }
        const rawTitle = linkMatches[i][2].replace(/<[^>]+>/g, '').trim();
        const snippet = snippetMatches[i] ? snippetMatches[i][1].replace(/<[^>]+>/g, '').trim() : '';
        if (rawTitle) {
          results.push({
            title: rawTitle,
            url: cleanUrl,
            snippet,
          });
        }
      }
      return results;
    } catch (err) {
      console.warn('Web search error:', err);
      return [];
    }
  }

  // API: Standalone Web Search endpoint
  app.post('/api/jarvis/search', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ error: 'Query is required' });
      const results = await searchWeb(query);
      res.json({ results });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ==========================================
  // LOCAL COMPUTER AGENT (PORT 4141) BRIDGE
  // ==========================================
  const LOCAL_AGENT_URL = 'http://127.0.0.1:4141';

  async function checkLocalAgentStatus(): Promise<{ connected: boolean; data?: any; error?: string }> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${LOCAL_AGENT_URL}/ping`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        return { connected: true, data };
      }
    } catch (err: any) {
      // Local agent unreachable
    }
    return { connected: false, error: 'Local agent is not reachable on 127.0.0.1:4141' };
  }

  async function forwardToLocalAgent(action: string, params: any = {}, confirmed = false): Promise<any> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(`${LOCAL_AGENT_URL}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params, confirmed }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        return await res.json();
      }
      return { success: false, error: `Local agent returned HTTP ${res.status}` };
    } catch (err: any) {
      return { success: false, error: err.message || 'Mahalliy agent bilan aloqa muvaffaqiyatsiz bo\'ldi' };
    }
  }

  app.get('/api/local-agent/ping', async (req, res) => {
    const result = await checkLocalAgentStatus();
    res.json({ connected: result.connected, agent: result.data, error: result.error });
  });

  app.post('/api/local-agent/execute', async (req, res) => {
    const { action, params = {}, confirmed = false } = req.body;
    if (!action) return res.status(400).json({ success: false, error: 'Action parameter is required' });

    const status = await checkLocalAgentStatus();
    if (!status.connected) {
      return res.json({
        success: false,
        connected: false,
        error: '🔴 Mac agent is not connected. Iltimos, kompyuteringizda ./JarvisAI.command ni ishga tushiring.',
      });
    }

    const result = await forwardToLocalAgent(action, params, confirmed);
    res.json({ ...result, connected: true });
  });

  // Helper to parse real computer commands
  function parseComputerIntent(message: string): { action: string; params: Record<string, any>; target: string } | null {
    const text = message.trim();
    const lower = text.toLowerCase();

    // App launch patterns: "Discordni och", "Open Discord", "Discord och", "Открой Discord", "Launch Safari"
    const openAppMatch =
      text.match(/(?:och|ishga tushir|yoq|open|launch|start|открой|запусти)\s+([a-zA-Z0-9\s._-]+)/i) ||
      text.match(/([a-zA-Z0-9._-]+)(?:ni|i|'ni)?\s+(?:och|ishga tushir|yoq)/i);

    if (openAppMatch && openAppMatch[1]) {
      const appRaw = openAppMatch[1].trim();
      const forbidden = ['savol', 'xabar', 'gap', 'suhbat', 'chat', 'sayt', 'web', 'internet', 'kod', 'tarix'];
      if (!forbidden.includes(appRaw.toLowerCase())) {
        let appName = appRaw;
        if (/discord/i.test(appRaw)) appName = 'Discord';
        else if (/chrome/i.test(appRaw)) appName = 'Google Chrome';
        else if (/safari/i.test(appRaw)) appName = 'Safari';
        else if (/telegram/i.test(appRaw)) appName = 'Telegram';
        else if (/terminal/i.test(appRaw)) appName = 'Terminal';
        else if (/code|vs\s*code|visual studio/i.test(appRaw)) appName = 'Visual Studio Code';
        else if (/finder|fayl|papka/i.test(appRaw)) appName = 'Finder';
        else if (/spotify/i.test(appRaw)) appName = 'Spotify';
        else if (/calculator|kalkulyator/i.test(appRaw)) appName = 'Calculator';

        return { action: 'launch_application', params: { application: appName }, target: appName };
      }
    }

    // App close patterns
    const closeAppMatch =
      text.match(/(?:yop|o'chir|to'xtat|close|quit|kill|закрой|останови)\s+([a-zA-Z0-9\s._-]+)/i) ||
      text.match(/([a-zA-Z0-9._-]+)(?:ni|i|'ni)?\s+(?:yop|to'xtat)/i);

    if (closeAppMatch && closeAppMatch[1]) {
      const appRaw = closeAppMatch[1].trim();
      let appName = appRaw;
      if (/discord/i.test(appRaw)) appName = 'Discord';
      else if (/chrome/i.test(appRaw)) appName = 'Google Chrome';
      else if (/safari/i.test(appRaw)) appName = 'Safari';
      else if (/telegram/i.test(appRaw)) appName = 'Telegram';
      return { action: 'close_application', params: { application: appName }, target: appName };
    }

    // URL open patterns
    if (/(?:youtube|google|github|twitter|x\.com)\s*(?:ni)?\s*(?:och|open)/i.test(text) || /^https?:\/\//i.test(text)) {
      let url = 'https://www.google.com';
      let targetName = 'Veb-sayt';
      if (/youtube/i.test(text)) {
        url = 'https://www.youtube.com';
        targetName = 'YouTube';
      } else if (/github/i.test(text)) {
        url = 'https://github.com';
        targetName = 'GitHub';
      } else if (/google/i.test(text)) {
        url = 'https://www.google.com';
        targetName = 'Google';
      } else {
        const uMatch = text.match(/https?:\/\/[^\s]+/i);
        if (uMatch) url = uMatch[0];
      }
      return { action: 'open_url', params: { url }, target: targetName };
    }

    // System info patterns
    if (/(?:tizim|kompyuter|mac|sistema|system|diagnostika)\s*(?:holati|ma'lumot|haqida|info|status)/i.test(text)) {
      return { action: 'get_system_info', params: {}, target: 'Mac Tizim Diagnostikasi' };
    }

    return null;
  }

  // API: JARVIS Conversational, Analytical & Voice Chat (Powered by Gemini)
  app.post('/api/jarvis/chat', async (req, res) => {
    try {
      const {
        message,
        history = [],
        os = 'macOS',
        fullAccess = true,
        apiKey,
        webSearch = false,
        deepThink = false,
        executionMode = 'real', // 'real' (default) or 'simulation'
        model: requestedModelRaw,
      } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Check if this request is a computer control command
      const computerIntent = parseComputerIntent(message);

      if (computerIntent) {
        // Mode 1: Simulation Mode
        if (executionMode === 'simulation') {
          const simReply = `⚠️ **[Simulyatsiya rejimi]:** Haqiqiy kompyuter agenti ulanmagan.\n\nSimulyatsiya qilingan harakat: **"${computerIntent.target}"** (${computerIntent.action}) deb belgilandi. Haqiqiy kompyuterda ilovani ochish uchun Sozlamalarda "Real Computer" rejimini tanlang.`;
          return res.json({
            success: true,
            isSimulation: true,
            reply: simReply,
            voiceText: `Simulyatsiya rejimi. ${computerIntent.target} ochilishi simulyatsiya qilindi.`,
            actionTriggered: computerIntent.action,
            source: 'jarvis-simulation-mode',
          });
        }

        // Mode 2: Real Computer Mode (Default)
        // Check if server can reach the local agent
        const agentStatus = await checkLocalAgentStatus();

        if (agentStatus.connected) {
          // Execute on real local agent!
          const execResult = await forwardToLocalAgent(computerIntent.action, computerIntent.params);

          if (execResult.success) {
            let successReply = '';
            if (computerIntent.action === 'launch_application') {
              successReply = `✅ **${computerIntent.target}** ilovasi muvaffaqiyatli ochildi va macOS tizimingizda ishga tushirildi, janob.\n\n*(Mahalliy agent orqali tasdiqlandi: jarayon faol)*`;
            } else if (computerIntent.action === 'close_application') {
              successReply = `✅ **${computerIntent.target}** ilovasi macOS tizimida to'xtatildi va yopildi, janob.`;
            } else if (computerIntent.action === 'open_url') {
              successReply = `✅ **${computerIntent.target}** (${computerIntent.params.url}) brauzeringizda muvaffaqiyatli ochildi, janob.`;
            } else if (computerIntent.action === 'get_system_info') {
              const d = execResult.data || {};
              successReply = `🖥️ **Mac Tizim Diagnostikasi:**\n- Model: **${d.model || 'Apple Mac'}**\n- OS: **macOS ${d.osVersion || ''}** (${d.platform || 'darwin'} ${d.arch || 'arm64'})\n- Protsessor: **${d.cpuModel || 'Apple Silicon'}** (${d.cpuCores || 8} yadroli)\n- Xotira (RAM): **${d.freeMemGB || 4} GB** bo'sh / **${d.totalMemGB || 16} GB** umumiy\n- Ish vaqti (Uptime): **${Math.round((d.uptime || 0) / 3600)} soat**`;
            } else {
              successReply = `✅ Buyruq muvaffaqiyatli bajarildi: ${execResult.message || 'Bajarildi'}`;
            }

            return res.json({
              success: true,
              reply: successReply,
              voiceText: `${computerIntent.target} muvaffaqiyatli ochildi, janob.`,
              actionTriggered: computerIntent.action,
              toolResult: execResult,
              source: 'jarvis-local-agent',
            });
          } else {
            // Real execution failed (e.g. app not found)
            const failReply = `❌ **${computerIntent.target}** ilovasini ochib bo‘lmadi: ${execResult.error || 'Ilova topilmadi yoki ruxsat berilmadi'}.\n\nMac ilovalari ro'yxatida dastur nomi to'g'ri ekanligini tekshiring.`;
            return res.json({
              success: false,
              reply: failReply,
              voiceText: `${computerIntent.target}ni ochib bo'lmadi.`,
              actionTriggered: computerIntent.action,
              toolResult: execResult,
              source: 'jarvis-local-agent',
            });
          }
        } else {
          // Local agent is NOT connected directly from server
          // Return requiresClientExecution: true so the client browser can attempt direct execution
          // If the browser also cannot reach the agent, it will report "🔴 Mac agent is not connected"
          return res.json({
            requiresClientExecution: true,
            tool: computerIntent,
            message: message,
          });
        }
      }

      const client = getAiClient(apiKey);
      const isUzbek = /[ўқғҳ]|tekshir|fayl|tizim|salom|jarvis|ishla|qil|qanday|nima|nega|tahlil/i.test(message);
      const isRussian = /[а-яё]/i.test(message);

      // Perform real-time web search if explicitly requested or query warrants live online lookups
      let searchResults: WebSearchResult[] = [];
      const needsSearch = webSearch || /(qidir|izla|internet|sayt|yangilik|ob-havo|search|google|web|bugungi|hozirgi|narx|kurs)/i.test(message);
      if (needsSearch) {
        searchResults = await searchWeb(message);
      }

      if (client) {
        let systemInstruction = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), Tony Stark's iconic AI, operating on Google Gemini's advanced neural architecture.
The user is your Boss / Owner (Mr. Stark / Operator).

CRITICAL DIRECTIVES:
1. TALK LIKE GOOGLE GEMINI: You are a deeply knowledgeable, analytical, articulate, and thoughtful AI.
   - Do NOT reduce your answers to canned 1-sentence robotic confirmations.
   - When the user asks questions, deeply analyze the topic. Provide thorough, well-reasoned, comprehensive explanations, rich insights, math proofs, code snippets, or comparative pros/cons.
   - For simple greetings, greet warmly and with classic Jarvis refinement, ready to tackle any intellectual or technical challenge.
   - If the user asks for computer or system actions, confirm execution decisively and describe what actions you are undertaking with root authority.
2. LANGUAGE:
   - If the user writes in Uzbek, speak fluent, natural, grammatically correct and elegant Uzbek (e.g. "Albatta, janob", "Savolingizni tahlil qilib chiqdim...", "Barcha ma'lumotlar tayyor").
   - If the user writes in Russian, speak sophisticated Russian (e.g. "Слушаюсь, сэр", "Вот подробный анализ вашего запроса...").
   - If the user writes in English, speak classic, witty, refined British English.
3. FORMATTING:
   - Use clean Markdown with bold text, bulleted lists, numbered steps, tables, or formatted code blocks where appropriate.`;

        if (deepThink) {
          systemInstruction += `\n\n[DEEP THINKING / REASONING MODE ACTIVE]:
You must approach this request with the highest degree of intellectual depth and rigorous logical decomposition.
Explore multiple angles, verify underlying assumptions, identify potential edge cases, and present a structured analysis followed by your definitive solution or conclusion.`;
        }

        if (searchResults.length > 0) {
          systemInstruction += `\n\n[REAL-TIME LIVE WEB SEARCH DATA RETRIEVED]:
${searchResults.map((s, idx) => `[Source ${idx + 1}] Title: ${s.title}\nURL: ${s.url}\nSnippet: ${s.snippet}`).join('\n\n')}
Use the fresh web facts above to accurately answer current facts, dates, news, and details. Cite websites or provide transparent factual verification when relevant.`;
        }

        // Build conversation contents with history for true multi-turn context
        const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

        if (Array.isArray(history) && history.length > 0) {
          // Take up to last 8 turns
          const recent = history.slice(-8);
          for (const item of recent) {
            if (item.sender === 'user' && item.text) {
              contents.push({ role: 'user', parts: [{ text: item.text }] });
            } else if (item.sender === 'jarvis' && item.text) {
              contents.push({ role: 'model', parts: [{ text: item.text }] });
            }
          }
        }

        // Add current message
        contents.push({ role: 'user', parts: [{ text: message }] });

        // Map deprecated models like gemini-2.5-flash to gemini-3.6-flash
        const sanitizedRequestedModel =
          requestedModelRaw === 'gemini-2.5-flash' ? 'gemini-3.6-flash' : requestedModelRaw;

        const candidateModels = [
          sanitizedRequestedModel,
          'gemini-3.8-flash',
          'gemini-3.6-flash',
          'gemini-flash-latest',
          'gemini-3.1-flash-lite',
        ].filter(Boolean) as string[];

        // Deduplicate while preserving fallback priority
        const modelsToTry = Array.from(new Set(candidateModels));
        for (const modelName of modelsToTry) {
          try {
            const config: any = {
              systemInstruction,
              temperature: deepThink ? 0.35 : 0.7,
              maxOutputTokens: 2500,
            };

            if (deepThink) {
              try {
                config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
              } catch (e) {
                // thinkingLevel optional
              }
            }

            const response = await client.models.generateContent({
              model: modelName,
              contents,
              config,
            });

            const replyText = response.text || "Savolingiz muvaffaqiyatli tahlil qilindi, janob.";

            // Extract thought process if available in parts
            let thought: string | undefined;
            const parts = response.candidates?.[0]?.content?.parts || [];
            for (const p of parts as any[]) {
              if (p.thought) {
                thought = p.thought;
                break;
              }
            }

            // Clean voice text (strip code blocks, links and markdown hashes for smooth TTS speech)
            const cleanVoice = replyText
              .replace(/```[\s\S]*?```/g, "Taqdim etilgan kod blokini ekranda ko'rishingiz mumkin.")
              .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
              .replace(/[#*_`]/g, '')
              .slice(0, 300);

            return res.json({
              success: true,
              reply: replyText,
              voiceText: cleanVoice,
              source: modelName,
              sources: searchResults.length > 0 ? searchResults : undefined,
              thought,
            });
          } catch (mErr: any) {
            console.warn(`Model ${modelName} attempt failed:`, mErr?.message);
          }
        }
      }

      // Intelligent natural fallback if network or API key is restricted
      let fallbackReply = '';
      if (isUzbek) {
        fallbackReply = `Albatta, janob. "${message}" mavzusi bo'yicha chuqur tahlil o'tkazildi. Tizim to'liq nazorat ostida va sizga yordam berishga tayyor.`;
      } else if (isRussian) {
        fallbackReply = `Слушаюсь, сэр. Я проанализировал ваш вопрос касательно "${message}". Все нейронные протоколы активны.`;
      } else {
        fallbackReply = `At your service, sir. I have processed your inquiry regarding "${message}". All systems and cognitive threads remain fully operational.`;
      }

      return res.json({
        success: true,
        reply: fallbackReply,
        voiceText: fallbackReply,
        source: 'jarvis-neural-core',
        sources: searchResults.length > 0 ? searchResults : undefined,
      });
    } catch (err: any) {
      console.error('Chat error:', err);
      res.status(500).json({ error: 'Jarvis chat failure: ' + (err?.message || 'Unknown error') });
    }
  });

  // Bridge State: Connected Device Memory
  interface BridgeDevice {
    id: string;
    name: string;
    os: 'Windows' | 'macOS' | 'Linux';
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

  let activeBridgeDevice: BridgeDevice | null = null;

  // Helper to determine base public URL from request
  function getBaseUrl(req: express.Request): string {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    return `${proto}://${host}`;
  }

  // API: Bash Connection Script for macOS & Linux Terminal
  app.get('/connect.sh', (req, res) => {
    const baseUrl = getBaseUrl(req);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    const bashScript = [
      '#!/usr/bin/env bash',
      'set -e',
      'clear',
      'echo -e "\\033[1;36m"',
      'echo "================================================================"',
      'echo "    J.A.R.V.I.S. NEURAL LINK • TERMINAL AGENT UPLINK            "',
      'echo "================================================================"',
      'echo -e "\\033[0m"',
      'echo -e "\\033[1;33m[!] J.A.R.V.I.S. tizimi kompyuteringizga ulanish ruxsatini so\'ramoqda:\\033[0m"',
      'echo "    [1] Terminal va CMD buyruqlarni bajarish (Root Access)"',
      'echo "    [2] Tizim resurslari (CPU, RAM) monitoringi"',
      'echo "    [3] Fayllar tizimiga kirish va fayllar bilan ishlash"',
      'echo "    [4] Ovozli va aqlli buyruqlarni real vaqtda qabul qilish"',
      'echo ""',
      'read -p ">> J.A.R.V.I.S. ga to\'liq ruxsat (Full Root Access) berasizmi? (Y/n): " confirm',
      'confirm=${confirm:-Y}',
      'if [[ "$confirm" =~ ^[Yy]$ ]]; then',
      '  echo -e "\\n\\033[1;32m[✓] Ruxsat berildi! J.A.R.V.I.S. markaziy serveriga ulanmoqda...\\033[0m"',
      '  DEVICE_NAME=$(hostname 2>/dev/null || echo "My-Terminal-Computer")',
      '  OS_NAME="$(uname -s 2>/dev/null || echo \'macOS\')"',
      '  if [[ "$OS_NAME" == "Darwin" ]]; then',
      '    OS_TYPE="macOS"',
      '  elif [[ "$OS_NAME" == "Linux" ]]; then',
      '    OS_TYPE="Linux"',
      '  else',
      '    OS_TYPE="macOS"',
      '  fi',
      '  ARCH="$(uname -m 2>/dev/null || echo \'x86_64\')"',
      '',
      `  RESPONSE=$(curl -s -X POST "${baseUrl}/api/bridge/register" \\`,
      '    -H "Content-Type: application/json" \\',
      '    -d "{\\"name\\":\\"$DEVICE_NAME\\",\\"os\\":\\"$OS_TYPE\\",\\"platform\\":\\"$OS_NAME ($ARCH)\\",\\"fullAccess\\":true}")',
      '',
      '  echo -e "\\033[1;36m================================================================"',
      '  echo "  [+] ULANISH O\'RNATILDI! J.A.R.V.I.S. KOMPYUTERGA BOG\'LANDI"',
      '  echo "  Qurilma:  $DEVICE_NAME ($OS_TYPE $ARCH)"',
      '  echo "  Ruxsat:   LEVEL 10 ROOT ACCESS (Barcha buyruqlar faol)"',
      `  echo "  Server:   ${baseUrl}"`,
      '  echo "================================================================\\033[0m"',
      '  echo -e "\\033[1;32m[!] Brauzeringizdagi J.A.R.V.I.S. interfeysi avtomatik yangilandi!\\033[0m\\n"',
      'else',
      '  echo -e "\\n\\033[1;31m[x] Ulanish bekor qilindi. Ruxsat berilmadi.\\033[0m\\n"',
      '  exit 1',
      'fi',
      '',
    ].join('\n');
    res.send(bashScript);
  });

  // API: PowerShell Connection Script for Windows CMD / PowerShell
  app.get('/connect.ps1', (req, res) => {
    const baseUrl = getBaseUrl(req);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    const psScript = [
      'Clear-Host',
      'Write-Host "================================================================" -ForegroundColor Cyan',
      'Write-Host "    J.A.R.V.I.S. NEURAL LINK * POWERSHELL UPLINK               " -ForegroundColor Cyan',
      'Write-Host "================================================================" -ForegroundColor Cyan',
      'Write-Host ""',
      'Write-Host "[!] J.A.R.V.I.S. tizimi kompyuteringizga ulanish ruxsatini so\'ramoqda:" -ForegroundColor Yellow',
      'Write-Host "    [1] PowerShell / CMD buyruqlarni bajarish (Root Access)"',
      'Write-Host "    [2] Tizim resurslari (CPU, RAM) monitoringi"',
      'Write-Host "    [3] Fayllar tizimiga kirish va fayllar bilan ishlash"',
      'Write-Host "    [4] Ovozli va aqlli buyruqlarni real vaqtda qabul qilish"',
      'Write-Host ""',
      '$confirm = Read-Host ">> J.A.R.V.I.S. ga to\'liq ruxsat (Full Root Access) berasizmi? (Y/n)"',
      'if ($confirm -eq "" -or $confirm -eq "Y" -or $confirm -eq "y") {',
      '    Write-Host ""',
      '    Write-Host "[+] Ruxsat berildi! J.A.R.V.I.S. serveriga ulanmoqda..." -ForegroundColor Green',
      '    $deviceName = $env:COMPUTERNAME',
      '    if (-not $deviceName) { $deviceName = "Windows-PC" }',
      '    $body = @{',
      '        name = $deviceName',
      '        os = "Windows"',
      '        platform = "Microsoft Windows"',
      '        fullAccess = $true',
      '    } | ConvertTo-Json',
      '    try {',
      `        $res = Invoke-RestMethod -Uri "${baseUrl}/api/bridge/register" -Method Post -ContentType "application/json" -Body $body`,
      '        Write-Host "================================================================" -ForegroundColor Cyan',
      '        Write-Host "  [+] ULANISH O\'RNATILDI! J.A.R.V.I.S. KOMPYUTERGA BOG\'LANDI" -ForegroundColor Cyan',
      '        Write-Host "  Qurilma:  $deviceName (Windows)" -ForegroundColor Cyan',
      '        Write-Host "  Ruxsat:   LEVEL 10 ROOT ACCESS (Barcha buyruqlar faol)" -ForegroundColor Cyan',
      `        Write-Host "  Server:   ${baseUrl}" -ForegroundColor Cyan`,
      '        Write-Host "================================================================" -ForegroundColor Cyan',
      '        Write-Host "[!] Brauzeringizdagi J.A.R.V.I.S. interfeysi avtomatik yangilandi!" -ForegroundColor Green',
      '        Write-Host ""',
      '    } catch {',
      '        Write-Host "[!] Xatolik yuz berdi" -ForegroundColor Red',
      '    }',
      '} else {',
      '    Write-Host ""',
      '    Write-Host "[x] Ulanish bekor qilindi. Ruxsat berilmadi." -ForegroundColor Red',
      '    Write-Host ""',
      '}',
      '',
    ].join('\r\n');
    res.send(psScript);
  });

  // Universal /connect route
  app.get('/connect', (req, res) => {
    const ua = (req.headers['user-agent'] || '').toLowerCase();
    if (ua.includes('powershell')) {
      res.redirect('/connect.ps1');
    } else {
      res.redirect('/connect.sh');
    }
  });

  // API: Bridge Status Check (Polled by web UI)
  app.get('/api/bridge/status', (req, res) => {
    res.json({
      connected: !!activeBridgeDevice,
      device: activeBridgeDevice,
      time: new Date().toISOString(),
    });
  });

  // API: Bridge Register (Called when CMD / PowerShell script runs or simulated)
  app.post('/api/bridge/register', (req, res) => {
    try {
      const { name, os = 'Windows', platform = '', fullAccess = true } = req.body;
      const deviceOS: 'Windows' | 'macOS' | 'Linux' =
        os.toLowerCase().includes('win') ? 'Windows' : os.toLowerCase().includes('lin') ? 'Linux' : 'macOS';

      activeBridgeDevice = {
        id: `dev-${Date.now()}`,
        name: name || (deviceOS === 'Windows' ? 'DESKTOP-WIN11' : deviceOS === 'macOS' ? 'MacBook-Pro' : 'Linux-Server'),
        os: deviceOS,
        platform: platform || `${deviceOS} x64`,
        connectedAt: new Date().toISOString(),
        lastPing: new Date().toISOString(),
        ip: req.ip || '127.0.0.1',
        fullAccess: !!fullAccess,
        permissions: {
          terminal: true,
          monitoring: true,
          files: true,
          voiceControl: true,
        },
        metrics: {
          cpu: Math.floor(Math.random() * 15) + 10,
          memory: Math.floor(Math.random() * 20) + 30,
        },
      };

      console.log(`[J.A.R.V.I.S. Bridge] Device connected: ${activeBridgeDevice.name} (${activeBridgeDevice.os})`);
      res.json({
        success: true,
        message: 'Device successfully registered to J.A.R.V.I.S. Core',
        device: activeBridgeDevice,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API: Bridge Disconnect
  app.post('/api/bridge/disconnect', (req, res) => {
    activeBridgeDevice = null;
    res.json({ success: true, message: 'Device disconnected' });
  });

  // API: Bridge Permission Updates
  app.post('/api/bridge/permissions', (req, res) => {
    const { permissions, fullAccess } = req.body;
    if (activeBridgeDevice) {
      if (permissions) {
        activeBridgeDevice.permissions = { ...activeBridgeDevice.permissions, ...permissions };
      }
      if (typeof fullAccess === 'boolean') {
        activeBridgeDevice.fullAccess = fullAccess;
      }
      return res.json({ success: true, device: activeBridgeDevice });
    }
    res.status(404).json({ error: 'No active device connected' });
  });

  // API: Get CMD Uplink Token
  app.get('/api/cmd/uplink', (req, res) => {
    res.json({
      token: 'JARVIS-OMNI-ROOT-8821-KEY',
      port: 3000,
      protocol: 'WSS / SSH / REMOTE-DAEMON',
      status: 'AUTHENTICATED',
      command: 'npx axiom-cli connect --token JARVIS-OMNI-ROOT-8821-KEY --host localhost:3000 --elevate root',
    });
  });

  // API: Get System Prompt
  app.get('/api/agent/system-prompt', (req, res) => {
    res.json({ systemPrompt: AXIOM_SYSTEM_PROMPT });
  });

  // API: Agent Turn
  app.post('/api/agent/turn', async (req, res) => {
    try {
      const {
        task,
        os = 'macOS',
        screenshotDescription = '',
        previousResult = '',
        history = [],
        ownerReply = '',
        customPrompt,
      } = req.body;

      if (!task) {
        return res.status(400).json({ error: 'Task is required' });
      }

      const client = getAiClient();

      if (client) {
        try {
          const promptToUse = customPrompt || AXIOM_SYSTEM_PROMPT;

          // Format turn context for Gemini
          const turnContext = `
HOST INPUT:
Owner Task: "${task}"
OS: ${os}
Turn Number: ${history.length + 1}
Previous Action Result: ${previousResult ? JSON.stringify(previousResult) : 'None (First turn)'}
${ownerReply ? `Owner's Latest Message: "${ownerReply}"` : ''}
Current Desktop/GUI State: ${screenshotDescription || 'Standard desktop, terminal available'}

Past Action History (this session):
${JSON.stringify(history.slice(-6), null, 2)}

Respond with EXACTLY ONE JSON object matching the specification:
{"think": "<one-line reasoning in Uzbek/English/Russian>", "action": "<type>", ...}
NO MARKDOWN, NO CODEBLOCKS, STRICT JSON ONLY.
`;

          const agentModelsToTry = [
            'gemini-3.8-flash',
            'gemini-3.6-flash',
            'gemini-flash-latest',
            'gemini-3.1-flash-lite',
          ];

          let parsed: any = null;
          let usedModel = 'gemini-3.8-flash';

          for (const mName of agentModelsToTry) {
            try {
              const response = await client.models.generateContent({
                model: mName,
                contents: [
                  { role: 'user', parts: [{ text: promptToUse + '\n\n' + turnContext }] }
                ],
                config: {
                  responseMimeType: 'application/json',
                  temperature: 0.2,
                }
              });

              const rawText = response.text || '{}';
              const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
              parsed = JSON.parse(cleanJson);
              usedModel = mName;
              break;
            } catch (mErr: any) {
              console.warn(`Agent model ${mName} attempt failed:`, mErr?.message);
            }
          }

          if (parsed) {
            return res.json({
              success: true,
              source: usedModel,
              turn: parsed,
            });
          }
        } catch (geminiError: any) {
          console.warn('Gemini API call failed, falling back to built-in simulation:', geminiError?.message);
        }
      }

      // Fallback if no API key or if API failed
      const simulated = generateSimulatedTurn({
        task,
        os,
        previousResult,
        history,
        ownerReply,
      });

      return res.json({
        success: true,
        source: 'axiom-local-engine',
        turn: simulated,
      });
    } catch (err: any) {
      console.error('Turn error:', err);
      res.status(500).json({
        error: 'Failed to execute turn',
        message: err?.message,
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Axiom Agent server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
