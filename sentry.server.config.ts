import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Filter out sensitive data
    beforeSend(event, hint) {
        // Don't send events if no DSN is configured
        if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
            return null;
        }

        // Filter out sensitive information
        if (event.request) {
            delete event.request.cookies;
            delete event.request.headers;
        }

        return event;
    },

    // Ignore certain errors
    ignoreErrors: [
        'ECONNREFUSED',
        'ETIMEDOUT',
    ],
});
