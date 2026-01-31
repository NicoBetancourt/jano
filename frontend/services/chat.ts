import { API_BASE_URL, getAuthHeaders, handleResponse } from './api';
import { ChatSession } from '../types';

export const chatService = {
    sendMessage: async (message: string, sessionId?: string): Promise<{ response: string; session_id: string }> => {
        const response = await fetch(`${API_BASE_URL}/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify({
                message,
                session_id: sessionId || null
            }),
        });
        const data = await handleResponse(response);
        return {
            response: data.response,
            session_id: data.session_id
        };
    },

    getSessions: async (): Promise<ChatSession[]> => {
        const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return data.map((session: any) => ({
            id: session.session_id,
            title: session.last_message,
            lastMessage: session.last_message,
            timestamp: new Date(session.timestamp),
        }));
    },

    getSessionMessages: async (sessionId: string): Promise<any[]> => {
        const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/messages`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    },

    deleteSession: async (sessionId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        await handleResponse(response);
    }
};
