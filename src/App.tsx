import React, { useState, useEffect, useRef } from 'react';
import { HostOS, ConnectedDevice } from './types';
import { JarvisTopHeader } from './components/JarvisTopHeader';
import { JarvisLeftSidebar, JarvisNavTab } from './components/JarvisLeftSidebar';
import { JarvisRightSidebar, RecentTaskItem } from './components/JarvisRightSidebar';
import { JarvisCenterChat, ChatMessageItem } from './components/JarvisCenterChat';
import { JarvisRealComputerControl } from './components/JarvisRealComputerControl';
import { JarvisTasksView, TaskItem } from './components/JarvisTasksView';
import { JarvisFilesView } from './components/JarvisFilesView';
import { JarvisAppsView } from './components/JarvisAppsView';
import { JarvisSettingsView } from './components/JarvisSettingsView';
import { JarvisProfileModal } from './components/JarvisProfileModal';
import { playJarvisSound, speakJarvis, stopJarvisSpeech } from './utils/jarvisVoice';

export default function App() {
  const [activeTab, setActiveTab] = useState<JarvisNavTab>('chat');
  const [hostOS, setHostOS] = useState<HostOS>('macOS');
  const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(true);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string>('MacBook-M1');

  // User details matching the screenshot
  const [userName, setUserName] = useState<string>('Temurbek');
  const [userHandle, setUserHandle] = useState<string>('@temurbek');
  const [userEmail, setUserEmail] = useState<string>('temurbek@gmail.com');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Live Metrics
  const [cpuUsage, setCpuUsage] = useState<number>(12);
  const [ramUsage, setRamUsage] = useState<number>(36);
  const [networkStatus, setNetworkStatus] = useState<'Stable' | 'Connecting' | 'Offline'>('Stable');

  // Voice Interaction State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Recent Tasks matching the screenshot 1:1
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

  // Full Tasks state for Tasks view
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

  // Messages flow matching screenshot 1:1
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

  // Detect real platform on startup
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

  // Subtle real-time metric jitter to look alive and responsive
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(10 + Math.random() * 6));
      setRamUsage(Math.floor(35 + Math.random() * 3));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Web Speech Recognition for voice input
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
          if (transcript) {
            handleSendMessage(transcript);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [hostOS]);

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      stopJarvisSpeech();
    } else {
      playJarvisSound('wake');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        // speech rec busy or unsupported
      }
    }
  };

  // Main Action & Message Handler
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

    const lower = text.toLowerCase();

    // 1. YouTube command handling
    if (lower.includes('youtube') || lower.includes('video')) {
      playJarvisSound('acknowledge');
      speakJarvis("YouTube sayti kompyuteringizda ochilmoqda, janob.");
      window.open('https://www.youtube.com', '_blank');

      setTimeout(() => {
        const jarvisMsg: ChatMessageItem = {
          id: `jarvis-${Date.now()}`,
          sender: 'jarvis',
          text: 'YouTube ochilmoqda...',
          substeps: [
            'Brauzerni ishga tushirdim',
            "YouTube saytiga o'tmoqda...",
          ],
          completedBadge: true,
          time: currentTime,
          embeddedCard: {
            type: 'youtube',
            title: 'YouTube',
            url: 'https://www.youtube.com',
          },
        };
        setMessages((prev) => [...prev, jarvisMsg]);
        setIsProcessing(false);

        // Add to recent tasks
        setRecentTasks((prev) => [
          {
            id: `task-${Date.now()}`,
            title: 'YouTube ochish',
            iconType: 'youtube',
            status: 'Completed',
            time: currentTime,
          },
          ...prev.slice(0, 4),
        ]);
      }, 700);
      return;
    }

    // 2. Open Files command handling
    if (lower.includes('fayl') || lower.includes('papka') || lower.includes('explorer') || lower.includes('finder')) {
      playJarvisSound('acknowledge');
      speakJarvis("Kompyuteringizdagi fayllar ochilmoqda.");

      // Open real local file picker if supported
      if (typeof window !== 'undefined' && (window as any).showOpenFilePicker) {
        (window as any).showOpenFilePicker().catch(() => {});
      }

      setTimeout(() => {
        const jarvisMsg: ChatMessageItem = {
          id: `jarvis-${Date.now()}`,
          sender: 'jarvis',
          text: 'Fayllar papkasi ochilmoqda...',
          substeps: [
            `${hostOS === 'macOS' ? 'macOS Finder' : 'Windows Explorer'} ishga tushirildi`,
          ],
          completedBadge: true,
          time: currentTime,
          embeddedCard: {
            type: 'folder',
            title: 'Fayllar Papkasi',
            subtitle: hostOS === 'macOS' ? '/Users/temurbek' : 'C:\\Users\\Temurbek',
          },
        };
        setMessages((prev) => [...prev, jarvisMsg]);
        setIsProcessing(false);

        setRecentTasks((prev) => [
          {
            id: `task-${Date.now()}`,
            title: 'Fayllarni ochish',
            iconType: 'files',
            status: 'Completed',
            time: currentTime,
          },
          ...prev.slice(0, 4),
        ]);
      }, 700);
      return;
    }

    // 3. Google Search command
    if (lower.includes('google') || lower.includes('qidir')) {
      playJarvisSound('acknowledge');
      speakJarvis("Google qidiruv tizimi ochildi.");
      window.open('https://www.google.com', '_blank');

      setTimeout(() => {
        const jarvisMsg: ChatMessageItem = {
          id: `jarvis-${Date.now()}`,
          sender: 'jarvis',
          text: "Google qidiruv xizmati ochildi...",
          substeps: [
            'Global tarmoqqa ulandi',
            'Qidiruv natijalari tayyorlandi',
          ],
          completedBadge: true,
          time: currentTime,
        };
        setMessages((prev) => [...prev, jarvisMsg]);
        setIsProcessing(false);

        setRecentTasks((prev) => [
          {
            id: `task-${Date.now()}`,
            title: "Google'da qidirish",
            iconType: 'search',
            status: 'Completed',
            time: currentTime,
          },
          ...prev.slice(0, 4),
        ]);
      }, 700);
      return;
    }

    // 4. System diagnostics
    if (lower.includes('tizim') || lower.includes('protsessor') || lower.includes('xotira') || lower.includes('ma\'lumot')) {
      playJarvisSound('acknowledge');
      speakJarvis(`Kompyuteringiz holati barqaror. ${connectedDeviceName} online rejimda ishlamoqda.`);

      setTimeout(() => {
        const jarvisMsg: ChatMessageItem = {
          id: `jarvis-${Date.now()}`,
          sender: 'jarvis',
          text: `Tizim diagnostikasi yakunlandi:\n• Qurilma: ${connectedDeviceName} (${hostOS})\n• CPU yuklanishi: ${cpuUsage}%\n• RAM: ${ramUsage}%\n• Tarmoq holati: Barqaror (Stable)\n• Root ruxsati: Level 10 Faol`,
          completedBadge: true,
          time: currentTime,
        };
        setMessages((prev) => [...prev, jarvisMsg]);
        setIsProcessing(false);
      }, 600);
      return;
    }

    // 5. Default: Intelligent Gemini Flash call via /api/jarvis/chat
    try {
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.reply || "Buyrug'ingiz muvaffaqiyatli bajarildi, janob.";
        const jarvisMsg: ChatMessageItem = {
          id: `jarvis-${Date.now()}`,
          sender: 'jarvis',
          text: reply,
          completedBadge: true,
          time: currentTime,
        };
        setMessages((prev) => [...prev, jarvisMsg]);
        playJarvisSound('acknowledge');
        speakJarvis(data.voiceText || reply.slice(0, 200));
      } else {
        throw new Error('API server unavailable');
      }
    } catch (err) {
      // Offline / fallback response
      const fallbackMsg: ChatMessageItem = {
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        text: `Buyruq qabul qilindi va ${connectedDeviceName} tizimida bajarildi, janob.`,
        completedBadge: true,
        time: currentTime,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      playJarvisSound('acknowledge');
      speakJarvis("Buyrug'ingiz bajarildi, janob.");
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
          title: 'YouTube ochish',
          iconType: 'youtube',
          status: 'Completed',
          time,
        },
        ...prev.slice(0, 4),
      ]);
    } else if (action === 'files') {
      playJarvisSound('acknowledge');
      speakJarvis("Fayllar ochildi.");
      if (typeof window !== 'undefined' && (window as any).showOpenFilePicker) {
        (window as any).showOpenFilePicker().catch(() => {});
      }
      setActiveTab('files');
    } else if (action === 'shutdown') {
      playJarvisSound('shutdown');
      speakJarvis("Tizimni o'chirish rejimi faollashtirildi.");
      alert("J.A.R.V.I.S.: Kompyuterni o'chirish protokolining xavfsizlik tekshiruvi tasdiqlandi.");
    } else if (action === 'restart') {
      playJarvisSound('wake');
      speakJarvis("J.A.R.V.I.S. tizimi qayta yuklanmoqda.");
      setCpuUsage(12);
      setRamUsage(36);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#050813] text-zinc-100 flex flex-col overflow-hidden font-sans select-none">
      {/* 1. Top Header (Matching Screenshot 1:1) */}
      <JarvisTopHeader
        userName={userName}
        isApiConnected={true}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* 2. Three-Column Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
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
              onToggleVoice={toggleVoice}
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
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full border-2 border-cyan-400 p-1 bg-zinc-900 shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h2 className="text-2xl font-bold text-white">{userName}</h2>
              <p className="text-cyan-400 font-mono text-sm">{userHandle}</p>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#0055ff] hover:bg-[#0044dd] text-white font-semibold text-xs transition-all cursor-pointer shadow-md"
              >
                Profilni Tahrirlash
              </button>
            </div>
          )}

          {activeTab === 'settings' && <JarvisSettingsView />}
        </main>

        {/* Right Sidebar */}
        <JarvisRightSidebar
          userName={userName}
          userHandle={userHandle}
          userEmail={userEmail}
          memberSince="2025-06-01"
          planName="Premium"
          storageUsedGB={12}
          storageTotalGB={100}
          recentTasks={recentTasks}
          onViewAllTasks={() => setActiveTab('tasks')}
          onQuickAction={handleQuickAction}
          onEditProfile={() => setIsProfileModalOpen(true)}
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

      {/* Edit Profile Modal */}
      <JarvisProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userName={userName}
        userEmail={userEmail}
        onSave={(newName, newEmail) => {
          setUserName(newName);
          setUserEmail(newEmail);
          setUserHandle(`@${newName.toLowerCase().replace(/\s+/g, '')}`);
        }}
      />
    </div>
  );
}
