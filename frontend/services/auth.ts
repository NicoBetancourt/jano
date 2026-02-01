import { API_BASE_URL, handleResponse, tokenManager, getAuthHeaders } from './api';

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface UserInfo {
    id: number;
    email: string;
    role: string;
    is_active: boolean;
}

export const authService = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        const data = await handleResponse(response);

        // Store token after successful login
        tokenManager.setToken(data.access_token, data.token_type);

        return data;
    },

    register: async (email: string, password: string): Promise<UserInfo> => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        return await handleResponse(response);
    },

    getCurrentUser: async (): Promise<UserInfo> => {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    },

    logout: () => {
        tokenManager.clearToken();
    },

    isAuthenticated: () => {
        return tokenManager.isAuthenticated();
    }
};
