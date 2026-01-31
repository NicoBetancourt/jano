import React, { useState, useRef, useEffect } from 'react';
import { Search, Share, Mic, Send, Paperclip, Sparkles, Copy, RefreshCw, ThumbsUp, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Message, MessageRole } from '../types';
import { chatService } from '../services/chat';
import { Button } from './Button';

interface ChatAreaProps {
  initialMessages: Message[];
  sessionId: string | null;
  onSessionChange: (sessionId: string) => void;
  onNewChat: () => void;
  userEmail: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ initialMessages, sessionId, onSessionChange, onNewChat, userEmail }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      const scrollHeight = messagesContainerRef.current.scrollHeight;
      messagesContainerRef.current.scrollTo({
        top: scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // Only scroll on new messages, not on initial load
  const prevMessagesLength = useRef(messages.length);
  useEffect(() => {
    if (messages.length > 0 && messages.length > prevMessagesLength.current) {
      // New message added, scroll smoothly
      scrollToBottom(true);
    } else if (messages.length > 0 && messages.length !== prevMessagesLength.current) {
      // Messages loaded (conversation switch), scroll without animation
      setTimeout(() => scrollToBottom(false), 100);
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  // Update messages when initialMessages changes (loading a conversation)
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Clear messages when starting a new chat
  useEffect(() => {
    if (sessionId === null) {
      setMessages([]);
    }
  }, [sessionId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.User,
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatService.sendMessage(userMsg.text, sessionId || undefined);

      // Update session_id if this is a new conversation
      if (!sessionId && result.session_id) {
        onSessionChange(result.session_id);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.Model,
        text: result.response,
        citations: [], // Backend doesn't return structured citations yet
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Optional: Add error message to chat
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 h-16 flex items-center justify-between px-6 border-b border-gray-100 flex-shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-gray-800">{sessionId ? 'Chat Session' : 'New Chat Session'}</h2>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold tracking-wider rounded-md">
            ACTIVE LLM: GEMINI 3 FLASH
          </span>
          <button
            onClick={onNewChat}
            className="ml-2 px-3 py-1 text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
          >
            + New Chat
          </button>
        </div>
        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
          <Share className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
          <div className="h-4 w-px bg-gray-200"></div>
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-900">{userEmail || 'User'}</div>
            <div className="text-xs text-gray-400"></div>
          </div>
          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold text-sm">
            {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 md:p-12 pb-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to your Workspace</h2>
            <p className="text-gray-500">I've analyzed your sources. Ask me anything about the market projections or project notes to get started.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === MessageRole.User ? 'justify-end' : 'justify-start'}`}>

                {/* AI Avatar */}
                {msg.role === MessageRole.Model && (
                  <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Message Content */}
                <div className={`flex flex-col ${msg.role === MessageRole.User ? 'items-end' : 'items-start'} max-w-[85%]`}>
                  <div className={`
                    text-base leading-relaxed
                    ${msg.role === MessageRole.User ? 'bg-gray-50 p-4 rounded-2xl text-gray-800' : 'text-gray-800'}
                  `}>
                    {msg.role === MessageRole.Model ? (
                      <div className="markdown-content">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw, rehypeSanitize]}
                          components={{
                            // Estilo para enlaces
                            a: ({ node, ...props }) => (
                              <a {...props} className="text-teal-600 hover:text-teal-700 underline" target="_blank" rel="noopener noreferrer" />
                            ),
                            // Estilo para código inline
                            code: ({ node, inline, ...props }: any) => (
                              inline ? (
                                <code {...props} className="bg-gray-100 text-teal-700 px-1.5 py-0.5 rounded text-sm font-mono" />
                              ) : (
                                <code {...props} className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono my-2" />
                              )
                            ),
                            // Estilo para bloques de código
                            pre: ({ node, ...props }) => (
                              <pre {...props} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-2" />
                            ),
                            // Estilo para encabezados
                            h1: ({ node, ...props }) => <h1 {...props} className="text-2xl font-bold mt-4 mb-2" />,
                            h2: ({ node, ...props }) => <h2 {...props} className="text-xl font-bold mt-3 mb-2" />,
                            h3: ({ node, ...props }) => <h3 {...props} className="text-lg font-bold mt-2 mb-1" />,
                            // Estilo para listas
                            ul: ({ node, ...props }) => <ul {...props} className="list-disc list-inside my-2 space-y-1" />,
                            ol: ({ node, ...props }) => <ol {...props} className="list-decimal list-inside my-2 space-y-1" />,
                            li: ({ node, ...props }) => <li {...props} className="ml-4" />,
                            // Estilo para tablas
                            table: ({ node, ...props }) => (
                              <div className="overflow-x-auto my-2">
                                <table {...props} className="min-w-full border-collapse border border-gray-300" />
                              </div>
                            ),
                            th: ({ node, ...props }) => <th {...props} className="border border-gray-300 bg-gray-100 px-4 py-2 font-semibold" />,
                            td: ({ node, ...props }) => <td {...props} className="border border-gray-300 px-4 py-2" />,
                            // Estilo para blockquotes
                            blockquote: ({ node, ...props }) => (
                              <blockquote {...props} className="border-l-4 border-teal-500 pl-4 italic my-2 text-gray-600" />
                            ),
                            // Estilo para párrafos
                            p: ({ node, ...props }) => <p {...props} className="my-2" />,
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>

                  {/* Citations Block (AI Only) */}
                  {msg.role === MessageRole.Model && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {msg.citations.map(citation => (
                        <div key={citation.id} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-xs text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors">
                          <span className="font-bold text-teal-700">{citation.id}</span>
                          <span className="truncate max-w-[200px]">{citation.source}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons (AI Only) */}
                  {msg.role === MessageRole.Model && (
                    <div className="flex items-center gap-4 mt-3 pl-1">
                      <button className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider">
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider">
                        <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.role === MessageRole.User && (
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-1 bg-gray-50 p-4 rounded-2xl">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-32" />
          </div>
        )}
      </div>

      {/* Sticky Input Area */}
      <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pointer-events-none">
        {/* Gradiente de fondo para evitar que el texto se vea detrás */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white to-transparent pointer-events-none" style={{ height: '180px' }}></div>
        <div className="relative pt-4 pb-5">
          <div className="max-w-3xl mx-auto pointer-events-auto bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex items-center p-1.5 pr-2">
            <Button variant="icon" className="ml-1.5 text-gray-400 hover:text-teal-600">
              <Paperclip className="w-4 h-4" />
            </Button>

            <input
              type="text"
              className="flex-1 py-2.5 px-3 outline-none text-gray-700 placeholder-gray-400 bg-transparent text-base"
              placeholder="Ask about your documents..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <div className="flex items-center gap-2">
              <Button variant="icon" className="text-gray-400 hover:text-teal-600">
                <Mic className="w-4 h-4" />
              </Button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${input.trim()
                  ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md transform hover:scale-105'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
          <div className="text-center mt-2 text-[10px] text-gray-400 font-medium tracking-wide">
            ⌘ + ENTER TO SEND &nbsp; • &nbsp; FOCUS MODE: OFF
          </div>
        </div>
      </div>
    </div>
  );
};