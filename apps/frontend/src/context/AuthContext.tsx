"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface User {
    id: string;
    email: string;
    name?: string;
    role: string;
    avatar?: string;
    phoneNumber?: string;
    canDeleteAccount?: boolean;
    // Partitioned Data (Flattened for compatibility)
    bio?: string;
    linkedin?: string;
    expertise?: string;
    experience?: string;
    mentorshipFee?: number;
    studentStatus?: string;
    studentSubStatus?: string;
    interests?: string;
    balance?: number;
    totalEarnings?: number;
    bankDetails?: string;
}

// Internal type for backend response
interface BackendUserResponse extends Omit<User, 'bio' | 'linkedin' | 'expertise' | 'experience' | 'mentorshipFee' | 'studentStatus' | 'studentSubStatus' | 'interests' | 'balance' | 'totalEarnings' | 'bankDetails'> {
    instructorProfile?: {
        bio?: string;
        expertise?: string;
        experience?: string;
        linkedin?: string;
        mentorshipFee?: number;
    };
    studentProfile?: {
        studentStatus?: string;
        studentSubStatus?: string;
        interests?: string;
    };
    wallet?: {
        balance?: number;
        totalEarnings?: number;
        bankDetails?: string;
    };
}

const flattenUser = (userData: BackendUserResponse): User => {
    return {
        ...userData,
        ...(userData.instructorProfile || {}),
        ...(userData.studentProfile || {}),
        ...(userData.wallet || {}),
    } as User;
};


interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User, redirectPath?: string) => void;
    logout: (shouldRedirect?: boolean) => void;
    updateUser: (user: User) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
            // Verify token/Fetch user
            api
                .then((userData: BackendUserResponse) => {
                    setUser(flattenUser(userData));
                })

                .catch(() => {
                    logout();
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = (newToken: string, newUserResponse: any, redirectPath?: string) => {
        const newUser = flattenUser(newUserResponse);
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("token", newToken);


        if (redirectPath) {
            router.push(redirectPath);
            return;
        }

        // Role-based redirect
        if (newUser.role === 'ADMIN') {
            router.push("/admin/analytics");
        } else if (newUser.role === 'INSTRUCTOR') {
            router.push("/instructor/courses");
        } else {
            router.push("/dashboard");
        }
    };

    const logout = React.useCallback((shouldRedirect: boolean = true) => {
        const currentRole = user?.role?.toLowerCase();
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        if (shouldRedirect) {
            const redirectUrl = currentRole ? `/login?role=${currentRole}` : "/login";
            router.push(redirectUrl);
        }
    }, [router, user]);

    const updateUser = (newUserResponse: any) => {
        setUser(flattenUser(newUserResponse));
    };


    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
