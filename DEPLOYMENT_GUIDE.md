# AdhyayanShala Education - Deployment & Infrastructure Guide

## Overview

The platform has been rebranded to **AdhyayanShala Education** and migrated to a robust, production-ready architecture using **PostgreSQL** and **Docker**.

## Architecture

- **Frontend**: Next.js 14 (App Router) running on Port `3000`.
- **Backend**: Express.js / Node.js API running on Port `3001`.
- **Database**: PostgreSQL 15 (Containerized) running on Port `5432`.
- **Orchestration**: Docker Compose.

---

## Prerequisites

1. **Docker Desktop**: Must be installed and running. [Download Here](https://www.docker.com/products/docker-desktop/).
2. **Git**: To clone/pull the repository.

---

## How to Run Locally (Production Mode)

To verify the production build locally (simulating the AWS/VPS environment):

1. **Start the Infrastructure**:
   Open a terminal in the project root and run:

   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

2. **Access the Application**:
   - **Website**: [http://localhost:3000](http://localhost:3000)
   - **API**: [http://localhost:3001](http://localhost:3001)
   - **Database**: `localhost:5432` (User: `admin`, Pass: `admin123`)

3. **Stop the Application**:

   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

---

## Local Development (Legacy Mode)

If you want to code and develop features (hot-reloading enabled):

1. **Ensure Database is Running**:
   You still need the interface to the Postgres database.

   ```bash
   # Start ONLY the database
   docker-compose -f docker-compose.prod.yml up -d postgres
   ```

2. **Run Dev Server**:

   ```bash
   npm run dev
   ```

   *Note: Ensure your `apps/backend/.env` points to the Postgres database.*

---

## Deployment Guide (AWS EC2 / VPS)

### 1. Provision Server

- Launch an **Ubuntu 22.04 LTS** instance on AWS EC2 (t3.medium recommended) or DigitalOcean.
- Open Ports: `80` (HTTP), `443` (HTTPS), `3000`, `3001`.

### 2. Install Docker

SSH into your server and install Docker:

```bash
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl start docker
sudo systemctl enable docker
```

### 3. Deploy Code

```bash
# Clone the repository
git clone https://github.com/shoraj1551/AdhyayanShala-Education.git
cd AdhyayanShala-Education

# Pull latest changes (if already cloned)
git pull origin dev

# Run the stack
sudo docker-compose -f docker-compose.prod.yml up -d --build
```

### 4. Database Migrations

The `docker-compose.prod.yml` is configured to automatically run `npx prisma migrate deploy` on backend startup, so your database schema should stay in sync automatically.

---

## Troubleshooting

### "Docker Desktop is not running"

You must start the Docker Desktop application on Windows before running any docker commands.

### Port Conflicts (EADDRINUSE)

If you see error `Bind for 0.0.0.0:3000 failed: port is already allocated`:

- Stop any other running web servers (like a stray `npm run dev` terminal).
- Run `docker-compose -f docker-compose.prod.yml down` to clear stuck containers.
