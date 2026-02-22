import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import prisma from '../lib/prisma';

jest.mock('../lib/prisma', () => ({
    __esModule: true,
    default: mockDeep<PrismaClient>(),
}));

jest.mock('../services/cache.service', () => ({
    __esModule: true,
    default: {
        get: jest.fn(() => Promise.resolve(null)),
        set: jest.fn(() => Promise.resolve()),
        del: jest.fn(() => Promise.resolve()),
    },
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
    mockReset(prismaMock);
});
