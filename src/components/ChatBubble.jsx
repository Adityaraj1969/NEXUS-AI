import { Bot, User } from 'lucide-react';

/**
 * @fileoverview Chat message bubble for the AI Concierge module.
 * @module components/ChatBubble
 */

/**
 * Chat message bubble with sender-based styling and typing indicator.
 *
 * @param {Object} props
 * @param {string} props.message - Message text
 * @param {'user'|'ai'|'ai-typing'} props.sender - Message sender
 * @param {string} [props.timestamp] - Message time string
 * @param {string} [props.language='en'] - Language code for RTL support
 * @returns {JSX.Element}
 */
export default function ChatBubble({ message, sender, timestamp, language = 'en' }) {
  const isUser = sender === 'user';
  const isTyping = sender === 'ai-typing';
  const isRTL = language === 'ar';

  if (isTyping) {
    return (
      <div className="flex items-start gap-2.5" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nexus-primary/20">
          <Bot className="h-4 w-4 text-nexus-secondary" aria-hidden="true" />
        </div>
        <div className="glass max-w-xs rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="flex items-center gap-1" role="status" aria-label="AI is typing">
            <span className="h-2 w-2 animate-bounce rounded-full bg-nexus-text-secondary [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-nexus-text-secondary [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-nexus-text-secondary [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-nexus-accent/20' : 'bg-nexus-primary/20'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-nexus-accent" aria-hidden="true" />
        ) : (
          <Bot className="h-4 w-4 text-nexus-secondary" aria-hidden="true" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-tr-sm bg-gradient-to-br from-nexus-primary to-purple-600 text-white'
            : 'glass rounded-tl-sm text-nexus-text-primary'
        }`}
      >
        <p>{message}</p>
        {timestamp && (
          <p
            className={`mt-1 text-[10px] ${
              isUser ? 'text-white/60' : 'text-nexus-text-secondary'
            }`}
          >
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}
