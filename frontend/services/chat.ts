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

    /**
     * Stream the agent response via SSE.
     * Calls `onChunk` for each text delta and `onDone` with the session_id when finished.
     * Returns an AbortController so the caller can cancel the stream.
     */
    sendMessageStream: (
        message: string,
        sessionId: string | undefined,
        onChunk: (chunk: string) => void,
        onDone: (sessionId: string) => void,
        onError: (err: Error) => void,
    ): AbortController => {
        const controller = new AbortController();

        (async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/chat/message/stream`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders(),
                    },
                    body: JSON.stringify({ message, session_id: sessionId || null }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Stream request failed: ${response.status}`);
                }

                const reader = response.body!.getReader();
                const decoder = new TextDecoder();
                let resolvedSessionId = sessionId ?? '';
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });

                    // SSE frames are separated by double newlines
                    const frames = buffer.split('\n\n');
                    // Keep the last (potentially incomplete) frame in the buffer
                    buffer = frames.pop() ?? '';

                    for (const frame of frames) {
                        const line = frame.trim();
                        if (!line.startsWith('data: ')) continue;
                        const data = line.slice(6);

                        if (data === '[DONE]') {
                            onDone(resolvedSessionId);
                            return;
                        }

                        // First frame is a JSON metadata object with session_id
                        try {
                            const meta = JSON.parse(data) as { session_id: string };
                            if (meta.session_id) {
                                resolvedSessionId = meta.session_id;
                            }
                        } catch {
                            // Not JSON → it's a text chunk; restore real newlines
                            onChunk(data.replaceAll('\\n', '\n'));
                        }
                    }
                }
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    onError(err as Error);
                }
            }
        })();

        return controller;
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
