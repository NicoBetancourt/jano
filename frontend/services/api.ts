export const API_BASE_URL = '/api';

// Token management
const TOKEN_KEY = 'access_token';
const TOKEN_TYPE_KEY = 'token_type';

export const tokenManager = {
    setToken: (accessToken: string, tokenType: string = 'bearer') => {
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(TOKEN_TYPE_KEY, tokenType);
    },

    getToken: (): string | null => {
        return localStorage.getItem(TOKEN_KEY);
    },

    getTokenType: (): string => {
        return localStorage.getItem(TOKEN_TYPE_KEY) || 'bearer';
    },

    clearToken: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_TYPE_KEY);
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem(TOKEN_KEY);
    }
};

// Auth headers helper
export const getAuthHeaders = (): HeadersInit => {
    const token = tokenManager.getToken();
    const tokenType = tokenManager.getTokenType();
    return token ? { 'Authorization': `${tokenType} ${token}` } : {};
};

// Callback for handling unauthorized errors (401)
let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorized = (callback: () => void) => {
    onUnauthorizedCallback = callback;
};

// Enhanced response handler with auth error detection
export const handleResponse = async (response: Response) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
        tokenManager.clearToken();
        if (onUnauthorizedCallback) {
            onUnauthorizedCallback();
        }
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
        return null;
    }

    return response.json();
};
