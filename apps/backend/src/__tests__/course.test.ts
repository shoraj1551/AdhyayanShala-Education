import request from 'supertest';
import app from '../server';
import { prismaMock } from '../test/setup';

describe('Course Integration Tests', () => {
    describe('GET /api/courses', () => {
        it('should return a list of courses', async () => {
            const mockCourses = [
                {
                    id: '1',
                    title: 'Test Course 1',
                    description: 'Description 1',
                    instructorId: 'inst1',
                    price: 0,
                    isPublished: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: '2',
                    title: 'Test Course 2',
                    description: 'Description 2',
                    instructorId: 'inst2',
                    price: 10,
                    isPublished: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            prismaMock.course.findMany.mockResolvedValue(mockCourses as any);

            const response = await request(app).get('/api/courses');

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body).toHaveLength(2);
            expect(response.body[0].title).toBe('Test Course 1');
        });

        it('should handle errors gracefully', async () => {
            prismaMock.course.findMany.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/courses');

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Error fetching courses');
        });
    });
});
