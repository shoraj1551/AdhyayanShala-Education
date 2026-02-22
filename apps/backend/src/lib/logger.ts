import winston from 'winston';
import { config } from '../config/env.config';

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const level = () => {
    const env = config.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => {
            const { timestamp, level, message, stack, ...meta } = info;
            let log = `${timestamp} ${level}: ${message}`;
            if (stack) log += `\n${stack}`;
            if (Object.keys(meta).length > 0) log += `\n${JSON.stringify(meta, null, 2)}`;
            return log;
        }
    ),
);

const transports = [
    new winston.transports.Console(),
];

const Logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
});

export default Logger;
