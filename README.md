# Shoraj Learning Platform

A scalable, secure, and product-grade learning platform for hosting courses and online tests.

## Mission

To provide a robust backend and an intuitive frontend for delivering educational content and assessments, distinct from the personal portfolio site.

## Architecture

This project is a Monorepo:

- **apps/backend**: Node.js/Express + PostgreSQL core service.
- **apps/frontend**: Next.js 15 application.
- **packages/shared**: Shared TypeScript types and utilities.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Locally**:
    ```bash
    npm run dev
    ```

## Development

- **Backend**: Located in `apps/backend`. Uses Prisma for DB management.
- **Frontend**: Located in `apps/frontend`.
