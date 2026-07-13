import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { validateInput } from '../lib/security';
import {
  MessageSquare, Send, Globe,  Sparkles, MapPin,
  Bot, User,
  Mic, RotateCcw, Info, CheckCircle2, MicOff
} from 'lucide-react';
import PropTypes from 'prop-types';
import { geminiClient } from '../services/gemini';

/** ─── CONSTANTS ─── */

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 Welcome to the **NEXUS AI Concierge**!\n\nI'm your AI-powered stadium assistant for the FIFA World Cup 2026™ at MetLife Stadium.\n\nI can help you with:\n• 🗺️ **Navigation** — Find gates, seats, restrooms\n• 🏟️ **Match Info** — Schedules, lineups, scores\n• 🍔 **Concessions** — Food options, wait times\n• ♿ **Accessibility** — Wheelchair routes, services\n• 🚌 **Transport** — Parking, transit, ride-share\n\nHow can I help you today?`,
  timestamp: new Date().toISOString(),
};

/**
 * GlassCard — glassmorphism container
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/10 ${className}`}>
      {children}
    </div>
  );
}

GlassCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * ChatBubble — individual message bubble
 * @param {Object} props
 * @param {Object} props.message
 * @param {string} props.message.role
 * @param {string} props.message.content
 * @param {string} props.message.timestamp
 */
function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  const sanitized = DOMPurify.sanitize(message.content);
  const timeStr = new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`} role="listitem">
      {/* Avatar */}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full
        ${isUser ? 'bg-teal-500/20' : 'bg-purple-500/20'}`}
        aria-hidden="true"
      >
        {isUser
          ? <User className="h-4 w-4 text-teal-400" />
          : <Bot className="h-4 w-4 text-purple-400" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser
        ? 'rounded-tr-sm bg-gradient-to-br from-teal-600/30 to-teal-700/20 border border-teal-500/20'
        : 'rounded-tl-sm bg-white/[0.06] border border-white/[0.08]'
      }`}>
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">
          {sanitized.split('\n').map((line, i) => {
            // Simple markdown bold rendering
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
              <p key={i} className={i > 0 ? 'mt-1' : ''}>
                {parts.map((part, j) =>
                  j % 2 === 1 ? <strong key={j} className="font-semibold text-white">{part}</strong> : part
                )}
              </p>
            );
          })}
        </div>
        <p className={`mt-1.5 text-[10px] ${isUser ? 'text-teal-500/60 text-right' : 'text-gray-600'}`}>
          {timeStr}
        </p>
      </div>
    </div>
  );
}

ChatBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
  }).isRequired,
};

/**
 * TypingIndicator — animated dots showing AI is processing
 * @returns {JSX.Element}
 */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-3" role="status" aria-label="AI is typing">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20" aria-hidden="true">
        <Bot className="h-4 w-4 text-purple-400" />
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-white/[0.08] bg-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400/60" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400/60" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400/60" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

/**
 * Concierge — AI chatbot concierge interface for FIFA World Cup 2026
 * Features: chat interface, quick actions, 7-language support, typing indicator,
 * scrollable history, simulated Gemini AI responses, and Speech-to-Text.
 * @param {Object} props
 * @param {string} props.language - Language code
 * @returns {JSX.Element}
 */
export default function Concierge({ language = 'en' }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const hasSpeechSupport = useMemo(() => typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window), []);

  /** Scroll to bottom when messages change */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /** Initialize Web Speech API */
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
      };
      
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {return;}
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = language === 'en' ? 'en-US' : language;
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening, language]);

  /** Send message handler */
  const handleSend = useCallback(async (text) => {
    const sanitizedText = DOMPurify.sanitize(text || input).trim();
    if (!sanitizedText) {return;}

    const validation = validateInput(sanitizedText, 'safeText');
    if (!validation.valid) {
      window.dispatchEvent(new CustomEvent('nexus-toast', { detail: { message: 'Message contains invalid characters.', type: 'error' } }));
      return;
    }

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: sanitizedText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await geminiClient.chat(sanitizedText, language);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('[NEXUS AI] Chat error:', error);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [input, language]);

  /** Handle Enter key */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  /** Clear chat history */
  const handleClearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
  }, []);

  const SUBTITLES = {
    en: "Your personal AI stadium assistant",
    es: "Tu asistente personal de IA en el estadio",
    fr: "Votre assistant IA personnel pour le stade",
    de: "Ihr persönlicher KI-Stadionassistent",
    ar: "مساعدك الشخصي في الملعب عبر الذكاء الاصطناعي",
    pt: "Seu assistente de estádio de IA pessoal",
    ru: "Ваш личный ИИ-помощник по стадиону"
  };

  const CONCIERGE_T = {
    en: { placeholder: "Type your question...", send: "Send Message", auto: "Multilingual Auto-Translate Active", q1: "Where is Gate B?", q2: "Is there wheelchair access in Section 112?", q3: "What are the food options near me?" },
    es: { placeholder: "Escribe tu pregunta...", send: "Enviar Mensaje", auto: "Autotraducción Multilingüe Activa", q1: "¿Dónde está la Puerta B?", q2: "¿Hay acceso para sillas de ruedas en la Sección 112?", q3: "¿Qué opciones de comida hay cerca?" },
    fr: { placeholder: "Tapez votre question...", send: "Envoyer le message", auto: "Traduction Automatique Multilingue", q1: "Où est la Porte B ?", q2: "Y a-t-il un accès en fauteuil roulant dans la Section 112 ?", q3: "Quelles sont les options de restauration près de moi ?" },
    de: { placeholder: "Geben Sie Ihre Frage ein...", send: "Nachricht senden", auto: "Mehrsprachige automatische Übersetzung", q1: "Wo ist Tor B?", q2: "Gibt es einen Rollstuhlzugang in Block 112?", q3: "Welche Essensmöglichkeiten gibt es in der Nähe?" },
    ar: { placeholder: "اكتب سؤالك...", send: "إرسال رسالة", auto: "الترجمة التلقائية متعددة اللغات نشطة", q1: "أين تقع البوابة ب؟", q2: "هل يوجد وصول للكراسي المتحركة في القسم 112؟", q3: "ما هي خيارات الطعام القريبة مني؟" },
    pt: { placeholder: "Digite sua pergunta...", send: "Enviar Mensagem", auto: "Tradução Automática Multilíngue Ativa", q1: "Onde fica o Portão B?", q2: "Há acesso para cadeiras de rodas na Seção 112?", q3: "Quais são as opções de comida perto de mim?" },
    ru: { placeholder: "Введите ваш вопрос...", send: "Отправить сообщение", auto: "Многоязычный автоперевод активен", q1: "Где выход B?", q2: "Есть ли доступ для инвалидных колясок в Секторе 112?", q3: "Какие есть варианты еды поблизости?" }
  };

  const t = CONCIERGE_T[language] || CONCIERGE_T.en;

  return (
    <main className="flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 p-4 md:p-6 lg:p-8" role="main" aria-label="AI Concierge">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <header className="mb-6">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white md:text-4xl">
            <MessageSquare className="h-8 w-8 text-purple-400" aria-hidden="true" />
            AI <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">Concierge</span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">{SUBTITLES[language] || SUBTITLES.en} — FIFA World Cup 2026</p>
        </header>

        {/* Chat Container */}
        <GlassCard className="flex h-[calc(100vh-220px)] min-h-[500px] flex-col overflow-hidden">
          {/* Top Bar: Controls */}
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
            {/* Global Language Indicator */}
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5 text-xs text-purple-300">
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.auto}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                className="rounded-lg bg-white/5 p-2 text-gray-500 transition-colors hover:bg-white/10 hover:text-gray-300
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                aria-label="Clear chat history"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Online
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-5 py-4" role="list" aria-label="Chat messages" aria-live="polite">
            <div className="space-y-4">
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-white/5 px-5 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {[
                { label: t.q1, icon: MapPin },
                { label: t.q2, icon: Info },
                { label: t.q3, icon: CheckCircle2 }
              ].map((action, i) => (
                <button
                  key={action.label}
                  onClick={() => handleSend(action.label)}
                  disabled={isTyping}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-gray-400
                    transition-all hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-300
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50"
                  aria-label={`Ask: ${action.label}`}
                >
                  <action.icon className="h-3 w-3" aria-hidden="true" />
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.placeholder}
                  rows={1}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm text-white placeholder:text-gray-600
                    focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  aria-label={t.placeholder}
                  disabled={isTyping}
                />
              </div>
              
              <button
                onClick={toggleListening}
                disabled={isTyping || !hasSpeechSupport}
                className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed
                  ${isListening ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}
                aria-label={isListening ? "Stop listening" : "Start speaking"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-teal-600 text-white
                  shadow-lg shadow-purple-500/20 transition-all hover:shadow-purple-500/30 hover:brightness-110
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t.send}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Footer */}
        <p className="mt-4 text-center text-[10px] text-gray-600">
          <Sparkles className="mr-1 inline-block h-3 w-3" aria-hidden="true" />
          Powered by Gemini AI • Responses may not be 100% accurate • FIFA World Cup 2026™
        </p>
      </div>
    </main>
  );
}

Concierge.propTypes = {
  language: PropTypes.string,
};
