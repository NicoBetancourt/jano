import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { LoginScreen } from './components/LoginScreen';
import { SourceDocument, Message, MessageRole, AppScreen } from './types';
import { authService, UserInfo } from './services/auth';
import { documentService } from './services/documents';
import { chatService } from './services/chat';
import { setOnUnauthorized } from './services/api';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.Login);
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    // Try to load session from localStorage
    return localStorage.getItem('currentSessionId');
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

  // Setup global unauthorized handler
  useEffect(() => {
    setOnUnauthorized(() => {
      // Clear state and redirect to login when token expires
      setSources([]);
      setCurrentSessionId(null);
      setCurrentUser(null);
      localStorage.removeItem('currentSessionId');
      setCurrentScreen(AppScreen.Login);
    });
  }, []);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      setCurrentScreen(AppScreen.Workspace);
      loadCurrentUser();
    }
  }, []);

  useEffect(() => {
    if (currentScreen === AppScreen.Workspace) {
      loadDocuments();
    }
  }, [currentScreen]);

  // Store session_id in localStorage when it changes
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('currentSessionId', currentSessionId);
    }
  }, [currentSessionId]);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const docs = await documentService.getDocuments();
      setSources(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      // If unauthorized, might want to redirect to login
      if (currentScreen === AppScreen.Workspace && !authService.isAuthenticated()) {
        setCurrentScreen(AppScreen.Login);
      }
    }
  };

  const handleDocumentUploaded = (doc: SourceDocument) => {
    setSources(prev => [...prev, doc]);
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    localStorage.removeItem('currentSessionId');
  };

  const handleSessionSelect = async (sessionId: string) => {
    try {
      // Load messages for the selected session
      const sessionMessages = await chatService.getSessionMessages(sessionId);

      // Convert backend messages to frontend format
      const formattedMessages: Message[] = sessionMessages.map((msg: any) => ({
        id: msg.id.toString(),
        role: msg.role === 'user' ? MessageRole.User : MessageRole.Model,
        text: msg.content,
        timestamp: new Date(msg.created_at),
        citations: [],
      }));

      setMessages(formattedMessages);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('Failed to load session messages:', error);
    }
  };

  if (currentScreen === AppScreen.Login) {
    return <LoginScreen onLogin={() => setCurrentScreen(AppScreen.Workspace)} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar
        sources={sources}
        onUpload={handleDocumentUploaded}
        currentSessionId={currentSessionId}
        onSessionSelect={handleSessionSelect}
      />
      <ChatArea
        initialMessages={messages}
        sessionId={currentSessionId}
        onSessionChange={setCurrentSessionId}
        onNewChat={handleNewChat}
        userEmail={currentUser?.email || ''}
      />
    </div>
  );
}