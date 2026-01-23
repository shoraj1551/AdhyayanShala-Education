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

    delete: async (url: string, token?: string) => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${API_URL}${url}`, {
            method: 'DELETE',
            headers,
        });
        if (res.status === 204) return;
        return handleResponse(res);
    },
};

async function handleResponse(res: Response) {
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'An error occurred');
    }
    return res.json();
}

// Helper specific to tests
export const submitTest = async (testId: string, answers: any[], token: string) => {
    return api.post(`/tests/${testId}/submit`, { answers }, token);
}
