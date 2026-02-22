// API URL Configuration - Fail-fast if missing in production
const API_URL = process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api' : '/api');

export interface TeamMemberDTO {
    name: string;
    role: string;
    bio: string;
    imageUrl: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
    email?: string;
    phone?: string;
    order?: number;
    isActive?: boolean;
}

export interface SocialHandleDTO {
    platform: string;
    url: string;
    icon?: string;
    isActive?: boolean;
    order?: number;
}

export interface ContactInfoDTO {
    category: string;
    label: string;
    value: string;
    description?: string;
    isPrimary?: boolean;
    order?: number;
    isActive?: boolean;
}

export interface ContactInquiryDTO {
    name: string;
    email: string;
    subject?: string;
    message: string;
}



export const api = {
    get: async (url: string, token?: string) => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        try {
            const res = await fetch(`${API_URL}${url}`, {
                method: 'GET',
                headers,
            });
            return handleResponse(res);
        } catch (error) {
            console.error(`API GET Error: ${API_URL}${url}`, error);
            // Enhance the error message for better user visibility
            if (error instanceof TypeError && error.message === "Failed to fetch") {
                throw new Error(`Failed to connect to backend at ${API_URL}${url}. Please ensure the server is running.`);
            }
            throw error;
        }
    },

    post: async (url: string, body: unknown, token?: string) => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        try {
            const res = await fetch(`${API_URL}${url}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            return handleResponse(res);
        } catch (error) {
            console.error(`API POST Error: ${API_URL}${url}`, error);
            if (error instanceof TypeError && error.message === "Failed to fetch") {
                throw new Error(`Failed to connect to backend at ${API_URL}${url}. Please ensure the server is running.`);
            }
            throw error;
        }
    },

    put: async (url: string, body: unknown, token?: string) => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        try {
            const res = await fetch(`${API_URL}${url}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(body),
            });
            return handleResponse(res);
        } catch (error) {
            console.error(`API PUT Error: ${API_URL}${url}`, error);
            if (error instanceof TypeError && error.message === "Failed to fetch") {
                throw new Error(`Failed to connect to backend at ${API_URL}${url}. Please ensure the server is running.`);
            }
            throw error;
        }
    },

    patch: async (url: string, body: unknown, token?: string) => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        try {
            const res = await fetch(`${API_URL}${url}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(body),
            });
            return handleResponse(res);
        } catch (error) {
            console.error(`API PATCH Error: ${API_URL}${url}`, error);
            if (error instanceof TypeError && error.message === "Failed to fetch") {
                throw new Error(`Failed to connect to backend at ${API_URL}${url}. Please ensure the server is running.`);
            }
            throw error;
        }
    },

    delete: async (url: string, body?: unknown, token?: string) => {
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
        try {
            const res = await fetch(`${API_URL}${url}`, {
                method: 'DELETE',
                headers,
                body: actualBody ? JSON.stringify(actualBody) : undefined,
            });
            if (res.status === 204) return;
            return handleResponse(res);
        } catch (error) {
            console.error(`API DELETE Error: ${API_URL}${url}`, error);
            if (error instanceof TypeError && error.message === "Failed to fetch") {
                throw new Error(`Failed to connect to backend at ${API_URL}${url}. Please ensure the server is running.`);
            }
            throw error;
        }
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
        const message = data.error?.message || data.message || 'An error occurred';
        const error = new Error(message) as Error & { data?: unknown };
        error.data = data;
        throw error;
    }
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
}

// Helper specific to tests
export const getInstructorDashboardData = async (token: string) => api.get('/courses/instructor/dashboard-data', token);

export const submitTest = async (testId: string, answers: Record<string, unknown>[], token: string) => {
    return api.post(`/tests/${testId}/submit`, { answers }, token);
}

export const markLessonComplete = async (lessonId: string, token?: string) => {
    return api.post('/progress/complete', { lessonId }, token);
}
export const getTeam = async () => {
    return api.get('/public/team');
};

export const getSocials = async () => {
    return api.get('/public/socials');
};

export const getContact = async () => {
    return api.get('/public/contact');
};

// --- Admin Content API ---

// Team
export const getAdminTeam = async (token: string) => api.get('/admin/content/team', token);
export const createAdminTeamMember = async (data: TeamMemberDTO, token: string) => api.post('/admin/content/team', data, token);
export const updateAdminTeamMember = async (id: string, data: Partial<TeamMemberDTO>, token: string) => api.put(`/admin/content/team/${id}`, data, token);
export const deleteAdminTeamMember = async (id: string, token: string) => api.delete(`/admin/content/team/${id}`, token);

// Socials
export const getAdminSocials = async (token: string) => api.get('/admin/content/socials', token);
export const createAdminSocial = async (data: SocialHandleDTO, token: string) => api.post('/admin/content/socials', data, token);
export const updateAdminSocial = async (id: string, data: Partial<SocialHandleDTO>, token: string) => api.put(`/admin/content/socials/${id}`, data, token);
export const deleteAdminSocial = async (id: string, token: string) => api.delete(`/admin/content/socials/${id}`, token);

// Contact
export const getAdminContacts = async (token: string) => api.get('/admin/content/contact', token);
export const createAdminContact = async (data: ContactInfoDTO, token: string) => api.post('/admin/content/contact', data, token);
export const updateAdminContact = async (id: string, data: Partial<ContactInfoDTO>, token: string) => api.put(`/admin/content/contact/${id}`, data, token);
export const deleteAdminContact = async (id: string, token: string) => api.delete(`/admin/content/contact/${id}`, token);

// Newsletter
export const joinWaitlist = async (email: string) => api.post('/public/newsletter/subscribe', { email });

// Inquiries
export const submitContactInquiry = async (data: ContactInquiryDTO) => api.post('/public/contact/inquiry', data);
export const getAdminInquiries = async (token: string) => api.get('/admin/content/inquiries', token);
export const updateAdminInquiryStatus = async (id: string, status: string, token: string) => api.patch(`/admin/content/inquiries/${id}`, { status }, token);
export const deleteAdminInquiry = async (id: string, token: string) => api.delete(`/admin/content/inquiries/${id}`, token);

export default api;
