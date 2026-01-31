export enum MessageRole {
  User = 'user',
  Model = 'model'
}

export interface Citation {
  id: number;
  source: string;
  detail: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  citations?: Citation[];
  timestamp: Date;
}

export interface SourceDocument {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'link';
  status: 'synced' | 'uploaded' | 'linked';
  timeInfo: string;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export enum AppScreen {
  Login = 'LOGIN',
  Workspace = 'WORKSPACE'
}