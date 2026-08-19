# Admin Panel Setup Guide

Next.js 14 admin interface for the Student-Teacher Learning Management Platform.

## Prerequisites

- Node.js 18+
- Backend API running at `http://localhost:8787`

## Install

```bash
cd admin-panel
npm install --include=dev
```

## Configure

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8787
```

## Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Default admin credentials:

- Email: `admin@edulearn.bd`
- Password: `Admin@12345`

## Build

```bash
npm run build
```

## Features

- Admin login
- Dashboard with stats
- Users, students, and teachers management
- Teacher applications (approve/reject/block/unblock)
- Class posts and live class management
- Notification history
- Reports
- Audit logs
- Responsive sidebar layout

## Pages

- `/` — Login
- `/dashboard` — Stats
- `/users` — All users with status actions
- `/students` — Students list with block/unblock/deactivate
- `/teachers` — Teacher applications with approve/reject/block/unblock
- `/applications` — Redirects to teacher applications
- `/classes` — Class posts management
- `/live-classes` — Live class management
- `/notifications` — Notification history
- `/reports` — Platform reports
- `/audit-logs` — Audit logs
