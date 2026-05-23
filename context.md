# EcoPoint Project Context

## Overview
**EcoPoint** is a gamified web-based waste management platform that integrates AI, Cloud Computing, and Computer Networks. It is designed to deliver smart waste classification and real-time, reward-driven user engagement within a scalable system.

**Team Members (Kelompok 3 Serangkai):**
- Fahmi Irfan Faiz (Ketua)
- Benjamin Sigit 
- Reza Hanif Firmansyah

## Tech Stack
The repository is structured into three main directories, each serving a distinct purpose with its own technology stack:

### 1. Frontend (`/frontend`)
- **Framework:** Next.js (v16.1.6) with React 19.
- **Styling:** Tailwind CSS v4.
- **UI Components:** Radix UI primitives and Lucide React icons.
- **Other tools:** Supabase JS (likely used for external storage/auth), canvas-confetti (gamification effects).
- **Language:** TypeScript.

### 2. Backend (`/backend`)
- **Framework:** Node.js with Express.js (v5).
- **Language:** TypeScript (`tsx` for dev, `tsc` for build).
- **Database ORM:** Prisma Client (`@prisma/client` v7.8.0) and `@prisma/adapter-pg`.
- **Database Engine:** PostgreSQL.
- **Authentication:** `jsonwebtoken` and `bcrypt`.
- **Other features:** `web-push` for push notifications.

### 3. AI Service (`/ai`)
- **Framework:** FastAPI with Uvicorn.
- **Language:** Python (>=3.13) managed via `uv` package manager.
- **Image Processing:** Pillow (`PIL`) for handling images before passing them to the AI classification model.

---

## Database Architecture (Prisma Schema)

The database uses PostgreSQL, managed by Prisma, and is structured around a strong gamification and reward system. Key models include:

### User Management
- **`users`**: Stores user information including `nim`, `email`, `password`, `total_poin`, `role` (default 'mahasiswa'), and `fakultas`.
- **`levels`**: Admin-configurable level definitions based on lifetime points.

### Core Feature: Waste Reporting
- **`waste_reports`**: Records waste reported by users. Includes `foto_url`, `kategori_user` (user's guess), `kategori_ai` (AI's classification), `status_validasi`, and `poin_didapat`. 

### Gamification & Rewards
- **`rewards`**: Available items that users can redeem with their points (`stok`, `poin_dibutuhkan`).
- **`redemptions`**: Transaction logs of users redeeming rewards.
- **`badges`**: Achievement badges with specific point/action requirements.
- **`user_badges`**: Junction table tracking which badges a user has earned.

### Daily Challenges
- **`daily_challenges`**: Master list of available challenges.
- **`challenge_of_the_day`**: Instances of challenges active on specific dates.
- **`user_daily_challenges`**: Tracks individual user progress and point claims for the daily challenges.

### Notifications
- **`notifications`**: Stores push notification payloads, user endpoints, and web-push subscription details (`p256dh`, `auth`).

---
*This file was generated to serve as an AI context reference point.*
