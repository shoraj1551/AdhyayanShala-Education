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
    // Extended Profile Fields
    bio?: string;
    linkedin?: string;
    expertise?: string;
    phoneNumber?: string;
}

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
                .get("/auth/me", storedToken)
                .then((userData) => {
                    setUser(userData);
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

    const login = (newToken: string, newUser: User, redirectPath?: string) => {
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
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        if (shouldRedirect) {
            router.push("/login");
        }
    }, [router]);

    const updateUser = (newUser: User) => {
        setUser(newUser);
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
