import React, { useState, useEffect, useRef } from 'react';
import { HostOS, ConnectedDevice, UserProfile } from './types';
import { JarvisTopHeader } from './components/JarvisTopHeader';
import { JarvisLeftSidebar, JarvisNavTab } from './components/JarvisLeftSidebar';
import { JarvisRightSidebar, RecentTaskItem } from './components/JarvisRightSidebar';
import { JarvisCenterChat, ChatMessageItem } from './components/JarvisCenterChat';
import { JarvisRealComputerControl } from './components/JarvisRealComputerControl';
import { JarvisTasksView, TaskItem } from './components/JarvisTasksView';
import { JarvisSkillsView } from './components/JarvisSkillsView';
import { JarvisHistoryView } from './components/JarvisHistoryView';
import { JarvisFilesView } from './components/JarvisFilesView';
import { JarvisAppsView } from './components/JarvisAppsView';
import { JarvisSettingsView } from './components/JarvisSettingsView';
import { JarvisAccountView } from './components/JarvisAccountView';
import { JarvisAuthModal } from './components/JarvisAuthModal';
import { JarvisNotificationsModal } from './components/JarvisNotificationsModal';
import { JarvisProfileModal } from './components/JarvisProfileModal';
import { JarvisAgentStatusModal } from './components/JarvisAgentStatusModal';
import { localAgent, AgentStatus, LocalAgentDetails } from './utils/localAgent';
import { VoiceActivityState } from './components/JarvisCenterChat';
import { playJarvisSound, speakJarvis, stopJarvisSpeech } from './utils/jarvisVoice';

export default function App() {
  const [activeTab, setActiveTab] = useState<JarvisNavTab>('chat');
  const [hostOS, setHostOS] = useState<HostOS>('macOS');
  const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(true);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string>('MacBook-M1');

  // Real Local Agent State & Modal
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>(localAgent.getStatus());
  const [agentDetails, setAgentDetails] = useState<LocalAgentDetails>(localAgent.getDetails());
  const [voiceState, setVoiceState] = useState<VoiceActivityState>('idle');

  // User Profile & Authentication
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'usr_default',
    username: 'temurbek',
    name: 'Temurbek',
    displayName: 'Temurbek',
    handle: '@temurbek',
    email: 'bahramovtemurbek3@gmail.com',
    role: 'Operator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    plan: 'Premium',
    memberSince: '2025-06-01',
    storageUsedGB: 14.5,
    storageTotalGB: 100,
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(2);

  // Active Conversation ID
  const [activeConversationId, setActiveConversationId] = useState<string>('conv_main');

  // Live System Metrics
  const [cpuUsage, setCpuUsage] = useState<number>(14);
  const [ramUsage, setRamUsage] = useState<number>(38);
  const [networkStatus, setNetworkStatus] = useState<'Stable' | 'Connecting' | 'Offline'>('Stable');

  // Voice Interaction State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Recent Tasks
  const [recentTasks, setRecentTasks] = useState<RecentTaskItem[]>([
    {
      id: 'task-1',
      title: 'YouTube ochish',
      iconType: 'youtube',
      status: 'Completed',
      time: '01:24',
    },
    {
      id: 'task-2',
      title: 'Fayllarni ochish',
      iconType: 'files',
      status: 'Completed',
      time: '01:26',
    },
    {
      id: 'task-3',
      title: "Tizim ma'lumotlari",
      iconType: 'system',
      status: 'Completed',
      time: '01:10',
    },
    {
      id: 'task-4',
      title: "Google'da qidirish",
      iconType: 'search',
      status: 'Completed',
      time: '00:45',
    },
    {
      id: 'task-5',
      title: 'Matn yozish',
      iconType: 'text',
      status: 'Completed',
      time: '00:30',
    },
  ]);

  // Tasks View State
  const [allTasks, setAllTasks] = useState<TaskItem[]>([
    {
      id: 't-1',
      title: 'YouTube ochish',
      category: 'youtube',
      status: 'Completed',
      time: '01:24',
    },
    {
      id: 't-2',
      title: 'Fayllarni ochish',
      category: 'files',
      status: 'Completed',
      time: '01:26',
    },
    {
      id: 't-3',
      title: "Tizim ma'lumotlarini tahlil qilish",
      category: 'system',
      status: 'Completed',
      time: '01:10',
    },
    {
      id: 't-4',
      title: "Google'da qidiruv amalga oshirish",
      category: 'search',
      status: 'Completed',
      time: '00:45',
    },
    {
      id: 't-5',
      title: 'Yangi hisobot matnini yozish',
      category: 'text',
      status: 'Completed',
      time: '00:30',
    },
  ]);

  // Messages flow
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'msg-1',
      sender: 'user',
      text: 'Salom Jarvis, kompyuterda YouTube och',
      time: '01:24',
    },
    {
      id: 'msg-2',
      sender: 'jarvis',
      text: 'YouTube ochilmoqda...',
      substeps: [
        'Brauzerni ishga tushirdim',
        "YouTube saytiga o'tmoqda...",
      ],
      completedBadge: true,
      time: '01:24',
      embeddedCard: {
        type: 'youtube',
        title: 'YouTube',
        url: 'https://www.youtube.com',
      },
    },
    {
      id: 'msg-3',
      sender: 'user',
      text: 'Endi mening fayllarim papkasini och',
      time: '01:26',
    },
    {
      id: 'msg-4',
      sender: 'jarvis',
      text: 'Fayllar papkasi ochilmoqda...',
      substeps: [
        `${hostOS === 'macOS' ? 'macOS Finder' : 'Windows Explorer'} ishga tushirildi`,
      ],
      completedBadge: true,
      time: '01:26',
      embeddedCard: {
        type: 'folder',
        title: 'Fayllar Papkasi',
        subtitle: hostOS === 'macOS' ? '/Users/temurbek/Documents' : 'C:\\Users\\Temurbek\\Documents',
      },
    },
  ]);

  // Check user session on app start
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('jarvis_token');
      if (!token) return;
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
        }
      }
    } catch (err) {
      console.warn('Auth check error:', err);
    }
  };

  // Fetch unread notifications count
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('jarvis_token');
      const res = await fetch('/api/notifications', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.notifications) {
        const unread = data.notifications.filter((n: any) => !n.read).length;
        setUnreadNotificationsCount(unread);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    checkAuth();
    fetchUnreadCount();
  }, []);

  // Detect Host OS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      if (ua.includes('Mac') || ua.includes('Darwin')) {
        setHostOS('macOS');
        setConnectedDeviceName('MacBook-M1');
      } else if (ua.includes('Win')) {
        setHostOS('Windows');
        setConnectedDeviceName('Windows-PC');
      } else {
        setHostOS('Linux');
        setConnectedDeviceName('Linux-Host');
      }
    }
  }, []);

  // Real-time jitter for metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(10 + Math.random() * 8));
      setRamUsage(Math.floor(35 + Math.random() * 4));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to local agent state
  useEffect(() => {
    const unsub = localAgent.subscribe((st, dt) => {
      setAgentStatus(st);
      setAgentDetails(dt);
    });
    return unsub;
  }, []);

  // Voice speaker with strict settings check and voiceState management
  const speakWithState = (text: string) => {
    try {
      const raw = localStorage.getItem('jarvis_settings');
      if (raw) {
        const s = JSON.parse(raw);
        if (s?.voice?.voiceEnabled === false || s?.voice?.voiceOutputEnabled === false) {
          setVoiceState('idle');
          return; // Voice OFF must strictly work!
        }
      }
    } catch (_) {}

    setVoiceState('speaking');
    speakJarvis(text, {
      onStart: () => setVoiceState('speaking'),
      onEnd: () => setVoiceState('idle'),
    });
  };

  const handleStopSpeech = () => {
    stopJarvisSpeech();
    setVoiceState('idle');
  };

  // Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'uz-UZ';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setIsListening(false);
          setVoiceState('idle');
          if (transcript) {
            handleSendMessage(transcript);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
          setVoiceState('error');
          setTimeout(() => setVoiceState('idle'), 2500);
        };
        recognition.onend = () => {
          setIsListening(false);
          setVoiceState((prev) => (prev === 'listening' ? 'idle' : prev));
        };

        recognitionRef.current = recognition;
      }
    }
  }, [hostOS]);

  const toggleVoice = () => {
    try {
      const raw = localStorage.getItem('jarvis_settings');
      if (raw) {
        const s = JSON.parse(raw);
        if (s?.voice?.voiceEnabled === false || s?.voice?.voiceInputEnabled === false) {
          alert("Ovoz kiritish (mikrofon) sozlamalarda o'chirilgan. Sozlamalar bo'limidan yoqing.");
          return;
        }
      }
    } catch (_) {}

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setVoiceState('idle');
      stopJarvisSpeech();
    } else {
      playJarvisSound('wake');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        setVoiceState('listening');
      } catch (err) {
        setVoiceState('error');
        setTimeout(() => setVoiceState('idle'), 2000);
      }
    }
  };

  // Switch Active Conversation & Load Messages
  const handleSelectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    setActiveTab('chat');
    try {
      const token = localStorage.getItem('jarvis_token');
      const res = await fetch(`/api/conversations/${convId}/messages`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setMessages(
          data.messages.map((m: any) => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            completedBadge: m.sender === 'jarvis',
          }))
        );
      } else {
        // Empty conversation
        setMessages([
          {
            id: `jarvis-${Date.now()}`,
            sender: 'jarvis',
            text: "Salom janob. Yangi sessiya boshlandi. Qanday yordam bera olaman?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            completedBadge: true,
          },
        ]);
      }
    } catch (err) {
      console.warn('Load messages error:', err);
    }
  };

  // Start a fresh new chat
  const handleNewChat = () => {
    setActiveTab('chat');
    setMessages([
      {
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        text: `Salom ${currentUser.name}! Yangi suhbat sessiyasi boshlandi. Men barcha ko'nikmalarim (brauzer, fayllar, terminal, Minecraft) bilan xizmatingizdaman.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        completedBadge: true,
      },
    ]);
  };

  // Handle Send Message & Neural Gemini Backend Execution
  const handleSendMessage = async (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: currentTime,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);
    setVoiceState('processing');

    // Retrieve active execution mode from localStorage settings
    let executionMode = 'real';
    try {
      const saved = localStorage.getItem('jarvis_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.developer?.executionMode) {
          executionMode = parsed.developer.executionMode;
        }
      }
    } catch (_) {}

    try {
      const token = localStorage.getItem('jarvis_token');
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          conversationId: activeConversationId,
          executionMode, // 'real' (default) or 'simulation'
          history: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error('API server request failed');
      }

      const data = await res.json();

      // CASE 1: Requires Client Execution via Local Agent (Port 4141 on user's Mac)
      if (data.requiresClientExecution && data.tool) {
        const tool = data.tool;

        // Mode A: Simulation Mode
        if (executionMode === 'simulation') {
          const simReply = `⚠️ **[Simulyatsiya rejimi]:** Haqiqiy kompyuterda hech narsa ochilmadi.\n\nSimulyatsiya qilingan harakat: **"${tool.target}"** (${tool.action}).\n\nHaqiqiy kompyuterda ilovani ochish uchun Sozlamalarda "Real Computer" rejimini tanlang.`;
          const jarvisMsg: ChatMessageItem = {
            id: `jarvis-${Date.now()}`,
            sender: 'jarvis',
            text: simReply,
            completedBadge: true,
            time: currentTime,
          };
          setMessages((prev) => [...prev, jarvisMsg]);
          playJarvisSound('acknowledge');
          speakWithState(`Simulyatsiya rejimi. ${tool.target} ochilishi simulyatsiya qilindi.`);
          setIsProcessing(false);
          return;
        }

        // Mode B: Real Computer Execution Mode (Default)
        // Execute tool directly on local agent
        const result = await localAgent.executeAction(tool.action, tool.params);

        if (!result.connected) {
          // Agent disconnected: NEVER fake success!
          const errorMsg: ChatMessageItem = {
            id: `jarvis-${Date.now()}`,
            sender: 'jarvis',
            text: `🔴 **Mac agent is not connected.**\n\nKompyuteringizda terminalni ochib, quyidagi buyruq orqali agentni ishga tushiring:\n\`\`\`bash\n./JarvisAI.command\n# yoki\n./JarvisAI.sh\n\`\`\`\nMahalliy agent 127.0.0.1:4141 da tinglaydi.`,
            completedBadge: false,
            time: currentTime,
          };
          setMessages((prev) => [...prev, errorMsg]);
          playJarvisSound('alert');
          speakWithState("Mac agenti ulanmagan. Iltimos, terminalda agentni ishga tushiring.");
        } else if (result.success) {
          // Real success verified on Mac
          let successText = `✅ **${tool.target}** ilovasi muvaffaqiyatli ochildi va macOS tizimingizda ishga tushirildi, janob.`;
          if (tool.action === 'close_application') {
            successText = `✅ **${tool.target}** ilovasi macOS tizimida to'xtatildi va yopildi, janob.`;
          } else if (tool.action === 'open_url') {
            successText = `✅ **${tool.target}** (${tool.params?.url}) brauzeringizda muvaffaqiyatli ochildi, janob.`;
          } else if (tool.action === 'get_system_info' && result.data) {
            const d = result.data;
            successText = `🖥️ **Mac Tizim Diagnostikasi:**\n- Model: **${d.model || 'Apple Mac'}**\n- OS: **macOS ${d.osVersion || ''}** (${d.platform || 'darwin'} ${d.arch || 'arm64'})\n- Protsessor: **${d.cpuModel || 'Apple Silicon'}** (${d.cpuCores || 8} yadroli)\n- Xotira (RAM): **${d.freeMemGB || 4} GB** bo'sh / **${d.totalMemGB || 16} GB** umumiy\n- Ish vaqti (Uptime): **${Math.round((d.uptime || 0) / 3600)} soat**`;
          }

          const jarvisMsg: ChatMessageItem = {
            id: `jarvis-${Date.now()}`,
            sender: 'jarvis',
            text: successText,
            completedBadge: true,
            time: currentTime,
            substeps: [
              `Local Agent :4141 orqali macOS tizimiga yuborildi`,
              `Jarayon tasdiqlandi (Holati: Faol)`,
            ],
          };
          setMessages((prev) => [...prev, jarvisMsg]);
          playJarvisSound('acknowledge');
          speakWithState(`${tool.target} muvaffaqiyatli ochildi, janob.`);

          setRecentTasks((prev) => [
            {
              id: `task-${Date.now()}`,
              title: `${tool.target} ochish`,
              iconType: 'system',
              status: 'Completed',
              time: currentTime,
            },
            ...prev.slice(0, 4),
          ]);
        } else {
          // Real failure (e.g. app does not exist on Mac)
          const failMsg: ChatMessageItem = {
            id: `jarvis-${Date.now()}`,
            sender: 'jarvis',
            text: `❌ **${tool.target}** ilovasini ochib bo‘lmadi: ${result.error || 'Ilova topilmadi yoki macOS ruxsat bermadi'}.\n\nMac ilovalari ro'yxatida dastur mavjudligini tekshiring.`,
            completedBadge: false,
            time: currentTime,
          };
          setMessages((prev) => [...prev, failMsg]);
          playJarvisSound('alert');
          speakWithState(`❌ ${tool.target} ochib bo'lmadi.`);
        }

        setIsProcessing(false);
        return;
      }

      // CASE 2: Server-side processed response (Gemini analytical chat or server-executed tool)
      const reply = data.reply || "Buyrug'ingiz qabul qilindi, janob.";
      const isOk = data.success !== false;
      const jarvisMsg: ChatMessageItem = {
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        text: reply,
        completedBadge: isOk,
        time: currentTime,
      };
      setMessages((prev) => [...prev, jarvisMsg]);

      if (isOk) {
        playJarvisSound('acknowledge');
        speakWithState(data.voiceText || reply.slice(0, 220));
      } else {
        playJarvisSound('alert');
        speakWithState(data.voiceText || "Xatolik yuz berdi.");
      }

      // Add to recent tasks if it felt like an actionable task
      if (text.length > 5 && !text.endsWith('?')) {
        setRecentTasks((prev) => [
          {
            id: `task-${Date.now()}`,
            title: text.slice(0, 30),
            iconType: 'system',
            status: isOk ? 'Completed' : 'Failed',
            time: currentTime,
          },
          ...prev.slice(0, 4),
        ]);
      }
    } catch (err) {
      // NEVER FAKE SUCCESS ON ERROR!
      const errorMsg: ChatMessageItem = {
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        text: `❌ **Xatolik:** So'rovingizni bajarib bo'lmadi. Server yoki tarmoq bilan aloqa uzilgan bo'lishi mumkin.`,
        completedBadge: false,
        time: currentTime,
      };
      setMessages((prev) => [...prev, errorMsg]);
      playJarvisSound('alert');
      speakWithState("Xatolik yuz berdi. Server bilan aloqa yo'q.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick Action triggers from Right Sidebar
  const handleQuickAction = (action: 'browser' | 'files' | 'shutdown' | 'restart') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (action === 'browser') {
      playJarvisSound('acknowledge');
      speakJarvis("Brauzer ochildi.");
      window.open('https://www.youtube.com', '_blank');
      setRecentTasks((prev) => [
        {
          id: `task-${Date.now()}`,
          title: 'Brauzerni ishga tushirish',
          iconType: 'youtube',
          status: 'Completed',
          time,
        },
        ...prev.slice(0, 4),
      ]);
    } else if (action === 'files') {
      playJarvisSound('acknowledge');
      speakJarvis("Fayllar ko'rinishi faollashdi.");
      setActiveTab('files');
    } else if (action === 'restart') {
      playJarvisSound('blip');
      speakJarvis("J.A.R.V.I.S. tizimi qayta yuklanmoqda...");
      setTimeout(() => window.location.reload(), 1200);
    } else if (action === 'shutdown') {
      playJarvisSound('blip');
      speakJarvis("Tizim uyqu rejimiga o'tkazilmoqda.");
      setIsDeviceConnected(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jarvis_token');
    setCurrentUser({
      id: 'usr_guest',
      username: 'mehmon',
      name: 'Mehmon',
      displayName: 'Mehmon',
      handle: '@mehmon',
      email: 'mehmon@jarvis.ai',
      role: 'Guest',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      plan: 'Basic',
      memberSince: 'Bugun',
      storageUsedGB: 0.1,
      storageTotalGB: 5,
    });
    playJarvisSound('blip');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#040711] text-zinc-100 font-sans overflow-hidden antialiased">
      {/* 1. TOP HEADER */}
      <JarvisTopHeader
        userName={currentUser.name}
        avatarUrl={currentUser.avatar}
        unreadNotificationsCount={unreadNotificationsCount}
        isApiConnected={true}
        localAgentStatus={agentStatus}
        localAgentLatency={agentDetails.latency}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setActiveTab('account')}
        onOpenAgentModal={() => setIsAgentModalOpen(true)}
      />

      {/* 2. THREE COLUMN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <JarvisLeftSidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            playJarvisSound('blip');
            setActiveTab(tab);
          }}
          cpuUsage={cpuUsage}
          ramUsage={ramUsage}
          networkStatus={networkStatus}
          isDeviceConnected={isDeviceConnected}
        />

        {/* Center Main Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#050813]">
          {activeTab === 'chat' && (
            <JarvisCenterChat
              messages={messages}
              onSendMessage={handleSendMessage}
              isProcessing={isProcessing}
              isListening={isListening}
              voiceState={voiceState}
              onToggleVoice={toggleVoice}
              onStopSpeech={handleStopSpeech}
              onSelectPrompt={(p) => handleSendMessage(p)}
              onPillTabClick={(pill) => {
                if (pill === 'computer') setActiveTab('computer');
                else if (pill === 'files') setActiveTab('files');
                else if (pill === 'task') setActiveTab('tasks');
                else if (pill === 'more') setActiveTab('settings');
              }}
              connectedDeviceName={connectedDeviceName}
              hostOS={hostOS}
            />
          )}

          {activeTab === 'history' && (
            <JarvisHistoryView
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewChat}
            />
          )}

          {activeTab === 'tasks' && (
            <JarvisTasksView
              tasks={allTasks}
              onAddTask={(title, category) => {
                const newT: TaskItem = {
                  id: `t-${Date.now()}`,
                  title,
                  category,
                  status: 'In Progress',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setAllTasks((prev) => [newT, ...prev]);
                speakJarvis(`Yangi vazifa ro'yxatga qo'shildi: ${title}`);
              }}
              onDeleteTask={(id) => setAllTasks((prev) => prev.filter((t) => t.id !== id))}
              onExecuteTask={(task) => {
                playJarvisSound('acknowledge');
                handleSendMessage(task.title);
                setActiveTab('chat');
              }}
            />
          )}

          {activeTab === 'skills' && <JarvisSkillsView />}

          {activeTab === 'computer' && (
            <JarvisRealComputerControl
              hostOS={hostOS}
              onSetHostOS={setHostOS}
              isDeviceConnected={isDeviceConnected}
              onConnectDevice={(name, os) => {
                setConnectedDeviceName(name);
                setHostOS(os);
                setIsDeviceConnected(true);
              }}
              onDisconnectDevice={() => setIsDeviceConnected(false)}
              deviceName={connectedDeviceName}
              onOpenLocalFilePicker={() => {
                if (typeof window !== 'undefined' && (window as any).showOpenFilePicker) {
                  (window as any).showOpenFilePicker().catch(() => {});
                }
              }}
              onOpenBrowser={(url) => window.open(url, '_blank')}
            />
          )}

          {activeTab === 'files' && <JarvisFilesView />}

          {activeTab === 'apps' && (
            <JarvisAppsView
              onLaunchApp={(appName) => {
                if (appName === 'files') setActiveTab('files');
                else if (appName === 'system') setActiveTab('computer');
                else if (appName === 'terminal') setActiveTab('computer');
                else setActiveTab('chat');
              }}
            />
          )}

          {activeTab === 'account' && (
            <JarvisAccountView
              currentUser={currentUser}
              onUpdateUser={(updated) => setCurrentUser(updated)}
              onLogout={handleLogout}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}

          {activeTab === 'settings' && <JarvisSettingsView />}
        </main>

        {/* Right Sidebar */}
        <JarvisRightSidebar
          userName={currentUser.name}
          userHandle={currentUser.handle}
          userEmail={currentUser.email}
          memberSince={currentUser.memberSince || '2025-06-01'}
          planName={currentUser.plan || 'Premium'}
          storageUsedGB={currentUser.storageUsedGB || 14.5}
          storageTotalGB={currentUser.storageTotalGB || 100}
          recentTasks={recentTasks}
          onViewAllTasks={() => setActiveTab('tasks')}
          onQuickAction={handleQuickAction}
          onEditProfile={() => setActiveTab('account')}
          onUpgrade={() => {
            playJarvisSound('wake');
            alert("Siz allaqachon Premium cheksiz tarifdasiz!");
          }}
          onTaskClick={(task) => {
            playJarvisSound('blip');
            handleSendMessage(task.title);
          }}
        />
      </div>

      {/* Auth Modal (Login & Registration) */}
      <JarvisAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onAuthSuccess={(user, token) => {
          if (token) localStorage.setItem('jarvis_token', token);
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          speakJarvis(`Xush kelibsiz, ${user.name || user.displayName}. Tizim tayyor.`);
        }}
      />

      {/* Notifications Modal */}
      <JarvisNotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onUnreadCountChange={(cnt) => setUnreadNotificationsCount(cnt)}
      />

      {/* Profile Edit Modal fallback */}
      <JarvisProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userName={currentUser.name}
        userEmail={currentUser.email}
        onSave={(newName, newEmail) => {
          setCurrentUser((prev) => ({
            ...prev,
            name: newName,
            email: newEmail,
            handle: `@${newName.toLowerCase().replace(/\s+/g, '')}`,
          }));
        }}
      />

      {/* Real Computer Local Agent Status Modal */}
      <JarvisAgentStatusModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
      />
    </div>
  );
}
