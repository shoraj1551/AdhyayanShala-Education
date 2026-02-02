const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = {
    get: async (url: string, token?: string) => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${API_URL}${url}`, {
            method: 'GET',
            headers,
        });
        return handleResponse(res);
    },

    post: async (url: string, body: any, token?: string) => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${API_URL}${url}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        return handleResponse(res);
    },

    put: async (url: string, body: any, token?: string) => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${API_URL}${url}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
        });
        return handleResponse(res);
    },

    delete: async (url: string, body?: any, token?: string) => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        // Handle optional body vs token arguments if token is passed as 2nd arg in legacy calls
        // But strict typing suggests clean signature update.
        // Let's assume explicit usage: api.delete(url, body, token).
        // If existing calls are api.delete(url, token), we need to handle that?
        // Current signature was: delete(url, token).
        // Conflict!
        // New signature: delete(url, options: { body?: any, token?: string }) might be better?
        // Or check type of 2nd arg.

        let actualToken = token;
        let actualBody = body;

        // Overload handling if 2nd arg is string (token)
        if (typeof body === 'string') {
            actualToken = body;
            actualBody = undefined;
        }

        if (actualToken) {
            headers['Authorization'] = `Bearer ${actualToken}`;
        }
        const res = await fetch(`${API_URL}${url}`, {
            method: 'DELETE',
            headers,
            body: actualBody ? JSON.stringify(actualBody) : undefined,
        });
        if (res.status === 204) return;
        return handleResponse(res);
    },

    upload: async (file: File, token?: string) => {
        const formData = new FormData();
        formData.append('file', file);

        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        // distinct: NO Content-Type header so fetch sets boundary
        const res = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers,
            body: formData,
        });
        return handleResponse(res);
    },
};

async function handleResponse(res: Response) {
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const error = new Error(data.message || 'An error occurred') as any;
        error.data = data; // Attach full data including validation errors
        throw error;
    }
    return res.json();
}

// Helper specific to tests
export const submitTest = async (testId: string, answers: any[], token: string) => {
    return api.post(`/tests/${testId}/submit`, { answers }, token);
}
export default api;
