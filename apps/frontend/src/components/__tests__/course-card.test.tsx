import { render, screen } from '@testing-library/react';
import { CourseCard } from '@/components/course-card';
import { useAuth } from '@/context/AuthContext';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

jest.mock('@/context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
    api: {
        get: jest.fn(() => Promise.resolve({ isEnrolled: false })),
        post: jest.fn(),
    },
}));

describe('CourseCard Component', () => {
    const mockCourse = {
        id: '1',
        title: 'Test Course',
        description: 'This is a test course description',
        level: 'Beginner',
        price: 0,
        _count: { modules: 5 }
    };

    beforeEach(() => {
        (useAuth as jest.Mock).mockReturnValue({
            user: null,
            token: null,
        });
    });

    it('renders course details correctly', () => {
        render(<CourseCard course={mockCourse} />);

        expect(screen.getByText('Test Course')).toBeInTheDocument();
        expect(screen.getByText('Beginner')).toBeInTheDocument();
        expect(screen.getByText('5 Modules')).toBeInTheDocument();
    });

    it('shows "Enroll Now" and price for free course', () => {
        render(<CourseCard course={mockCourse} />);
        expect(screen.getByRole('button', { name: /Enroll Now/i })).toBeInTheDocument();
        expect(screen.getByText('₹0')).toBeInTheDocument();
    });

    it('shows "Enroll Now" and price for paid course', () => {
        render(<CourseCard course={{ ...mockCourse, price: 1000 }} />);
        expect(screen.getByRole('button', { name: /Enroll Now/i })).toBeInTheDocument();
        expect(screen.getByText('₹1,000')).toBeInTheDocument();
    });
});
