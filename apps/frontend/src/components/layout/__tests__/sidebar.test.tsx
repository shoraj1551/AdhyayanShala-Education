import { render, screen } from '@testing-library/react';
import { Topbar } from '@/components/layout/topbar';
import { useAuth } from '@/context/AuthContext';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('next/navigation', () => ({
    usePathname: () => '/dashboard',
}));

jest.mock('@/context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

// Mock Sheet components to just render children since they need context
jest.mock('@/components/ui/sheet', () => ({
    Sheet: ({ children }: any) => <div>{children}</div>,
    SheetTrigger: ({ children }: any) => <button>{children}</button>,
    SheetContent: ({ children }: any) => <div>{children}</div>,
}));

describe('Topbar Sidebar Menu', () => {
    const mockLogout = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows standard links for students', () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { role: 'STUDENT', name: 'Test Student', email: 'student@test.com' },
            logout: mockLogout,
        });

        render(<Topbar />);

        // Check common links
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Browse Courses')).toBeInTheDocument();

        // Check restricted links are ABSENT
        expect(screen.queryByText('Create Course')).not.toBeInTheDocument();
        expect(screen.queryByText('Admin (Tests)')).not.toBeInTheDocument();
    });

    it('shows "Create Course" for instructors', () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { role: 'INSTRUCTOR', name: 'Test Instructor', email: 'inst@test.com' },
            logout: mockLogout,
        });

        render(<Topbar />);

        expect(screen.getByText('Create Course')).toBeInTheDocument();
    });

    it('shows "Admin (Tests)" for admins', () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { role: 'ADMIN', name: 'Test Admin', email: 'admin@test.com' },
            logout: mockLogout,
        });

        render(<Topbar />);

        expect(screen.getByText('Admin (Tests)')).toBeInTheDocument();
    });
});
