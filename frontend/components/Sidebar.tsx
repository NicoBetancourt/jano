import React, { useRef, useState, useEffect } from 'react';
import { JanusLogo } from './JanusLogo';
import { PanelLeftClose, Plus, History, Settings, Filter, MessageSquare, Trash2 } from 'lucide-react';
import { SourceDocument, ChatSession } from '../types';
import { Button } from './Button';
import { ConfirmationModal } from './ConfirmationModal';
import { SourceCard } from './SourceCard';
import { documentService } from '../services/documents';
import { chatService } from '../services/chat';
import { SettingsMenu } from './SettingsMenu';

interface SidebarProps {
  sources: SourceDocument[];
  onUpload?: (doc: SourceDocument) => void;
  onDeleteSource?: (sourceId: string) => void;
  currentSessionId: string | null;
  onSessionSelect?: (sessionId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sources, onUpload, onDeleteSource, currentSessionId, onSessionSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showConversations, setShowConversations] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

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
    setDocumentToDelete(null); // Ensure documentToDelete is clear
    setDeleteModalOpen(true);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocumentToDelete(docId);
    setSessionToDelete(null); // Ensure sessionToDelete is clear
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (sessionToDelete) {
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
    } else if (documentToDelete && onDeleteSource) {
      try {
        await documentService.deleteDocument(documentToDelete);
        onDeleteSource(documentToDelete);
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
    setDeleteModalOpen(false);
    setSessionToDelete(null);
    setDocumentToDelete(null);
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full flex flex-col flex-shrink-0 transition-colors duration-200">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/30 rounded-lg flex items-center justify-center transition-colors">
              <JanusLogo className="text-teal-600 dark:text-teal-400" size={24} />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white leading-tight transition-colors">Jano</h1>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide transition-colors">DOCUMENT CHAT</span>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="p-4 space-y-4 border-b border-gray-100 dark:border-gray-800 transition-colors">
          <Button fullWidth className="rounded-full shadow-sm dark:bg-teal-600 dark:text-white dark:hover:bg-teal-700 transition-colors" onClick={() => fileInputRef.current?.click()}>
            <Plus className="w-5 h-5 mr-2" />
            Add Source
          </Button>

          <div
            className="border-2 border-dashed border-teal-100 dark:border-teal-900/50 bg-teal-50/30 dark:bg-teal-900/10 rounded-xl p-6 text-center transition-colors hover:border-teal-300 dark:hover:border-teal-700 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mx-auto w-8 h-8 bg-white dark:bg-gray-800 rounded-md shadow-sm flex items-center justify-center mb-2 transition-colors">
              <span className="text-teal-600 dark:text-teal-400 text-lg font-bold">↑</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">Click to upload files</p>
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
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider transition-colors">Sources ({sources.length})</h3>
              <Filter className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors" />
            </div>

            <div className="space-y-1">
              {sources.map(source => (
                <SourceCard
                  key={source.id}
                  source={source}
                  onDelete={handleDeleteDocument}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3 mt-2">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider transition-colors">Conversations ({sessions.length})</h3>
              <button
                onClick={() => setShowConversations(false)}
                className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
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
                    ? 'bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800'
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                    }`}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-colors ${currentSessionId === session.id ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 dark:text-gray-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm line-clamp-2 mb-1 transition-colors ${currentSessionId === session.id ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                        {session.title || 'Untitled conversation'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 transition-colors">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4 transition-colors">
                  No conversations yet
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer - Sticky */}
      <div className="sticky bottom-0 z-20 bg-white dark:bg-gray-900 p-4 border-t border-gray-100 dark:border-gray-800 space-y-1 transition-colors duration-200">
        <button
          onClick={() => setShowConversations(!showConversations)}
          className="flex items-center gap-3 w-full p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg text-sm font-medium transition-colors"
        >
          <History className="w-5 h-5" />
          {showConversations ? 'Show Sources' : 'Past Conversations'}
        </button>
        <button
          ref={settingsButtonRef}
          onClick={() => setSettingsOpen(!settingsOpen)}
          className={`flex items-center gap-3 w-full p-2 rounded-lg text-sm font-medium transition-colors ${settingsOpen
            ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>
      <SettingsMenu
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        anchorRef={settingsButtonRef}
      />
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={sessionToDelete ? "Delete Conversation" : "Delete Document"}
        message={sessionToDelete
          ? "Are you sure you want to delete this conversation? This action cannot be undone."
          : "Are you sure you want to delete this document? This action cannot be undone."
        }
      />
    </div>
  );
};