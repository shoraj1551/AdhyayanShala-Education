import Redis from 'ioredis';
import { config } from '../config/env.config';
import Logger from '../lib/logger';

class CacheService {
    private redis: Redis | null = null;
    private memoryCache: Map<string, { value: any, expires: number }> = new Map();

    constructor() {
        if (config.REDIS_URL) {
            try {
                this.redis = new Redis(config.REDIS_URL, {
                    maxRetriesPerRequest: 3,
                    retryStrategy: (times) => Math.min(times * 50, 2000),
                });
                this.redis.on('error', (err) => {
                    Logger.error('Redis connection error:', err);
                });
                this.redis.on('connect', () => {
                    Logger.info('Connected to Redis for caching');
                });
            } catch (error) {
                Logger.error('Failed to initialize Redis:', error);
            }
        } else {
            Logger.info('No REDIS_URL found, using in-memory fallback for caching');
        }
    }

    async get<T>(key: string): Promise<T | null> {
        if (this.redis) {
            try {
                const data = await this.redis.get(key);
                return data ? JSON.parse(data) : null;
            } catch (error) {
                Logger.error(`Cache get error for ${key}:`, error);
                return null;
            }
        }

        const cached = this.memoryCache.get(key);
        if (cached && cached.expires > Date.now()) {
            return cached.value as T;
        }
        if (cached) this.memoryCache.delete(key);
        return null;
    }

    async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
        if (this.redis) {
            try {
                await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
            } catch (error) {
                Logger.error(`Cache set error for ${key}:`, error);
            }
            return;
        }

        this.memoryCache.set(key, {
            value,
            expires: Date.now() + (ttlSeconds * 1000)
        });
    }

    async del(key: string): Promise<void> {
        if (this.redis) {
            try {
                await this.redis.del(key);
            } catch (error) {
                Logger.error(`Cache delete error for ${key}:`, error);
            }
            return;
        }
        this.memoryCache.delete(key);
    }
}

export default new CacheService();
