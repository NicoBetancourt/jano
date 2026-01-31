import React, { useRef, useState, useEffect } from 'react';
import { JanusLogo } from './JanusLogo';
import { PanelLeftClose, Plus, History, Settings, Filter, MessageSquare, Trash2 } from 'lucide-react';
import { SourceDocument, ChatSession } from '../types';
import { Button } from './Button';
import { ConfirmationModal } from './ConfirmationModal';
import { SourceCard } from './SourceCard';
import { documentService } from '../services/documents';
import { chatService } from '../services/chat';

interface SidebarProps {
  sources: SourceDocument[];
  onUpload?: (doc: SourceDocument) => void;
  currentSessionId: string | null;
  onSessionSelect?: (sessionId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sources, onUpload, currentSessionId, onSessionSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showConversations, setShowConversations] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUpload) {
      try {
        const doc = await documentService.uploadDocument(file);
        onUpload(doc);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const loadSessions = async () => {
    try {
      const userSessions = await chatService.getSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [currentSessionId]); // Reload when session changes

  const handleSessionClick = (sessionId: string) => {
    if (onSessionSelect) {
      onSessionSelect(sessionId);
      setShowConversations(false);
    }
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // Prevent session selection
    setSessionToDelete(sessionId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    try {
      await chatService.deleteSession(sessionToDelete);
      setSessions(prev => prev.filter(s => s.id !== sessionToDelete));
      // If the deleted session was the current one, we might want to clear it
      if (currentSessionId === sessionToDelete && onSessionSelect) {
        onSessionSelect(""); // Or some way to indicate reset
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col flex-shrink-0 hidden md:flex">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-20 bg-white">
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
              <JanusLogo className="text-teal-600" size={24} />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 leading-tight">Jano</h1>
              <span className="text-xs font-medium text-gray-500 tracking-wide">DOCUMENT CHAT</span>
            </div>
          </div>
          <Button variant="icon" className="text-gray-400">
            <PanelLeftClose className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Actions */}
        <div className="p-4 space-y-4 border-b border-gray-100">
          <Button fullWidth className="rounded-full shadow-sm" onClick={() => fileInputRef.current?.click()}>
            <Plus className="w-5 h-5 mr-2" />
            Add Source
          </Button>

          <div
            className="border-2 border-dashed border-teal-100 bg-teal-50/30 rounded-xl p-6 text-center transition-colors hover:border-teal-300 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mx-auto w-8 h-8 bg-white rounded-md shadow-sm flex items-center justify-center mb-2">
              <span className="text-teal-600 text-lg font-bold">↑</span>
            </div>
            <p className="text-sm text-gray-500">Click to upload files</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Content Area - Toggle between Sources and Conversations */}
      <div className="flex-1 overflow-y-auto px-4">
        {!showConversations ? (
          <>
            <div className="flex items-center justify-between mb-3 mt-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sources ({sources.length})</h3>
              <Filter className="w-4 h-4 text-gray-400 cursor-pointer" />
            </div>

            <div className="space-y-1">
              {sources.map(source => (
                <SourceCard key={source.id} source={source} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3 mt-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Conversations ({sessions.length})</h3>
              <button
                onClick={() => setShowConversations(false)}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                Back
              </button>
            </div>

            <div className="space-y-2">
              {sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors group ${currentSessionId === session.id
                    ? 'bg-teal-50 border border-teal-200'
                    : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                    }`}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 line-clamp-2 mb-1">
                        {session.title || 'Untitled conversation'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all rounded-md hover:bg-red-50"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No conversations yet
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer - Sticky */}
      <div className="sticky bottom-0 z-20 bg-white p-4 border-t border-gray-100 space-y-1">
        <button
          onClick={() => setShowConversations(!showConversations)}
          className="flex items-center gap-3 w-full p-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium"
        >
          <History className="w-5 h-5" />
          {showConversations ? 'Show Sources' : 'Past Conversations'}
        </button>
        <button className="flex items-center gap-3 w-full p-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium">
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
      />
    </div>
  );
};