# PlakshaConnect

> Connecting Plaksha together

**PlakshaConnect** is a modular campus networking and collaboration platform built for Plaksha University students. It provides a centralized space to connect with peers, manage campus life, collaborate on projects, and stay informed about campus activities—all without the noise of traditional social media.

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Structure](#api-structure)
- [Documentation](#documentation)

---

## Overview

PlakshaConnect addresses real student needs by offering:

- **Campus Location Sharing** – Meet up with friends and discover who's around campus
- **Group Chat System** – Real-time communication for hostels, clubs, and courses
- **Announcement Hub** – Stay updated with club, SC, and campus announcements
- **Issue Reporting** – Report and track campus issues transparently
- **Team Formation** – Find teammates for hackathons, projects, and competitions
- **Mess Review Portal** – Rate and review daily mess menus
- **Campus Challenges** – Participate in mini quests and earn recognition

The platform is modular, scalable, and designed to evolve with new features over time.

---

## Core Features

### 1. Authentication System
- OTP-based email login (no passwords required)
- JWT token authentication for secure sessions
- Role-based access control: `student`, `club_admin`, `sc_admin`
- Plaksha University email verification

### 2. Campus Location Sharing
- Temporary location sharing within campus
- Privacy controls (visible to all, friends, or groups)
- Real-time updates via WebSockets
- Auto-expiring location data

### 3. Group Chat System
- Real-time messaging for hostels, clubs, and courses
- Context-specific channels (course-based, club-based, team-based)
- WebSocket-powered live updates
- Message history and search

### 4. Announcement Hub
- Role-based posting (club admins, SC admins)
- Category-based organization (Cultural, Academic, Sports, etc.)
- Auto-expiring announcements to reduce clutter
- Subscription-based filtering

### 5. Issue Reporting & Tracking
- Student-initiated issue reporting (maintenance, Wi-Fi, mess, etc.)
- Admin/SC resolution tracking
- Upvoting and commenting system
- Transparent status updates

### 6. Team Formation Board
- Post team requirements with skill tags
- Browse open teams or create new ones
- Integrated chat for team coordination
- Project/hackathon categorization

### 7. Mess Review Portal
- Daily menu reviews and ratings
- Multi-metric rating system (taste, hygiene, service, portion)
- Aggregated weekly statistics
- Trend visualization

### 8. Campus Challenges
- Club/faculty-created mini quests
- Point-based achievement system
- Optional leaderboards
- Badge and XP rewards

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js (TypeScript) | Modern React framework with SSR, routing, and optimized performance |
| **Backend** | FastAPI (Python) | High-performance API development with automatic documentation |
| **Database** | PostgreSQL | Relational database with ACID compliance and advanced querying |
| **Real-time** | WebSockets | Live chat, location updates, and dynamic announcements |
| **Authentication** | JWT + OTP | Secure token-based auth with email verification |
| **ORM** | SQLAlchemy | Database abstraction and migration management |
| **Validation** | Pydantic | Request/response schema validation |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│  - UI Components  - State Management  - WebSocket Client│
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/HTTPS + WebSocket
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend (FastAPI)                      │
│  - API Routes  - Business Logic  - WebSocket Server     │
│  - Authentication  - Authorization  - Data Validation   │
└──────────────────────┬──────────────────────────────────┘
                       │ SQL Queries
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   Database (PostgreSQL)                 │
│  - User Data  - Messages  - Issues  - Reviews  - Teams  │
└─────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
User → Enter Email → Backend Generates OTP → Email Sent
                                ↓
User → Enter OTP → Backend Validates → JWT Token Issued
                                ↓
JWT Token → Stored in Client → Sent with Each Request
                                ↓
Backend → Validates JWT → Grants Access to Protected Routes
```

### Real-time Communication Flow

```
Client A → WebSocket Connection → Backend Server
                                      ↓
Client B → WebSocket Connection → Backend Server
                                      ↓
         Message/Update → Broadcast to All Connected Clients
```

---

## Project Structure

```
plaksha-connect/
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── verify/
│   │   ├── (dashboard)/
│   │   │   ├── announcements/
│   │   │   ├── chat/
│   │   │   ├── issues/
│   │   │   ├── location/
│   │   │   ├── mess-review/
│   │   │   ├── teams/
│   │   │   └── challenges/
│   │   ├── api/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── location/
│   │   └── shared/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── websocket.ts
│   │   └── utils.ts
│   ├── types/
│   └── public/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── announcements.py
│   │   │   ├── chat.py
│   │   │   ├── issues.py
│   │   │   ├── location.py
│   │   │   ├── mess_review.py
│   │   │   ├── teams.py
│   │   │   └── challenges.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── announcement.py
│   │   │   ├── chat.py
│   │   │   ├── issue.py
│   │   │   ├── location.py
│   │   │   ├── mess_review.py
│   │   │   ├── team.py
│   │   │   └── challenge.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── announcement.py
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── email_service.py
│   │   │   ├── websocket_service.py
│   │   │   └── ...
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── database.py
│   │   ├── middleware/
│   │   │   ├── auth.py
│   │   │   └── cors.py
│   │   └── main.py
│   ├── migrations/
│   │   └── versions/
│   └── tests/
│
├── docs/
│   ├── SETUP.md
│   ├── STRUCTURE.md
│   ├── API_DOCS.md
│   ├── DEPLOYMENT.md
│   └── LICENSE.md
│
└── README.md
```

---

## Database Schema

### Core Tables

#### users
```
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- name (VARCHAR)
- role (ENUM: student, club_admin, sc_admin)
- profile_picture (VARCHAR)
- hostel (VARCHAR)
- course (VARCHAR)
- year (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### otp_requests
```
- id (UUID, PK)
- email (VARCHAR)
- otp_code (VARCHAR)
- expires_at (TIMESTAMP)
- verified (BOOLEAN)
- created_at (TIMESTAMP)
```

#### locations
```
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- latitude (DECIMAL)
- longitude (DECIMAL)
- visibility (ENUM: all, friends, group)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### chat_groups
```
- id (UUID, PK)
- name (VARCHAR)
- type (ENUM: hostel, club, course, team)
- context_id (VARCHAR)
- created_by (UUID, FK -> users.id)
- created_at (TIMESTAMP)
```

#### chat_messages
```
- id (UUID, PK)
- group_id (UUID, FK -> chat_groups.id)
- sender_id (UUID, FK -> users.id)
- content (TEXT)
- created_at (TIMESTAMP)
```

#### announcements
```
- id (UUID, PK)
- title (VARCHAR)
- content (TEXT)
- category (ENUM: cultural, academic, sports, general)
- posted_by (UUID, FK -> users.id)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### issues
```
- id (UUID, PK)
- title (VARCHAR)
- description (TEXT)
- category (ENUM: maintenance, wifi, mess, other)
- status (ENUM: open, in_progress, resolved)
- reported_by (UUID, FK -> users.id)
- resolved_by (UUID, FK -> users.id, NULLABLE)
- upvotes (INTEGER)
- created_at (TIMESTAMP)
- resolved_at (TIMESTAMP, NULLABLE)
```

#### issue_comments
```
- id (UUID, PK)
- issue_id (UUID, FK -> issues.id)
- user_id (UUID, FK -> users.id)
- content (TEXT)
- created_at (TIMESTAMP)
```

#### teams
```
- id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- requirements (TEXT)
- tags (ARRAY[VARCHAR])
- created_by (UUID, FK -> users.id)
- max_members (INTEGER)
- created_at (TIMESTAMP)
```

#### team_members
```
- id (UUID, PK)
- team_id (UUID, FK -> teams.id)
- user_id (UUID, FK -> users.id)
- joined_at (TIMESTAMP)
```

#### mess_reviews
```
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- date (DATE)
- meal_type (ENUM: breakfast, lunch, dinner)
- taste_rating (INTEGER)
- hygiene_rating (INTEGER)
- service_rating (INTEGER)
- portion_rating (INTEGER)
- comment (TEXT)
- created_at (TIMESTAMP)
```

#### challenges
```
- id (UUID, PK)
- title (VARCHAR)
- description (TEXT)
- points (INTEGER)
- created_by (UUID, FK -> users.id)
- start_date (TIMESTAMP)
- end_date (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### challenge_completions
```
- id (UUID, PK)
- challenge_id (UUID, FK -> challenges.id)
- user_id (UUID, FK -> users.id)
- completed_at (TIMESTAMP)
```

---

## API Structure

### Authentication Endpoints

**POST** `/api/auth/request-otp`
- Request: `{ email: string }`
- Response: `{ message: string }`

**POST** `/api/auth/verify-otp`
- Request: `{ email: string, otp: string }`
- Response: `{ token: string, user: UserObject }`

**POST** `/api/auth/logout`
- Headers: `Authorization: Bearer <token>`
- Response: `{ message: string }`

---

### Location Endpoints

**POST** `/api/location/share`
- Headers: `Authorization: Bearer <token>`
- Request: `{ latitude: number, longitude: number, visibility: string, duration: number }`
- Response: `{ id: string, expires_at: string }`

**GET** `/api/location/nearby`
- Headers: `Authorization: Bearer <token>`
- Response: `{ locations: LocationObject[] }`

**DELETE** `/api/location/{location_id}`
- Headers: `Authorization: Bearer <token>`
- Response: `{ message: string }`

---

### Chat Endpoints

**GET** `/api/chat/groups`
- Headers: `Authorization: Bearer <token>`
- Response: `{ groups: GroupObject[] }`

**POST** `/api/chat/groups`
- Headers: `Authorization: Bearer <token>`
- Request: `{ name: string, type: string, context_id: string }`
- Response: `{ group: GroupObject }`

**GET** `/api/chat/groups/{group_id}/messages`
- Headers: `Authorization: Bearer <token>`
- Query: `?limit=50&before=<timestamp>`
- Response: `{ messages: MessageObject[] }`

**WebSocket** `/ws/chat/{group_id}`
- Headers: `Authorization: Bearer <token>`
- Events: `message`, `typing`, `user_joined`, `user_left`

---

### Announcement Endpoints

**GET** `/api/announcements`
- Query: `?category=<category>&limit=20`
- Response: `{ announcements: AnnouncementObject[] }`

**POST** `/api/announcements`
- Headers: `Authorization: Bearer <token>`
- Permissions: `club_admin`, `sc_admin`
- Request: `{ title: string, content: string, category: string, expires_at: string }`
- Response: `{ announcement: AnnouncementObject }`

**DELETE** `/api/announcements/{announcement_id}`
- Headers: `Authorization: Bearer <token>`
- Permissions: `creator` or `sc_admin`
- Response: `{ message: string }`

---

### Issue Endpoints

**GET** `/api/issues`
- Query: `?status=<status>&category=<category>`
- Response: `{ issues: IssueObject[] }`

**POST** `/api/issues`
- Headers: `Authorization: Bearer <token>`
- Request: `{ title: string, description: string, category: string }`
- Response: `{ issue: IssueObject }`

**PUT** `/api/issues/{issue_id}/status`
- Headers: `Authorization: Bearer <token>`
- Permissions: `sc_admin`
- Request: `{ status: string }`
- Response: `{ issue: IssueObject }`

**POST** `/api/issues/{issue_id}/upvote`
- Headers: `Authorization: Bearer <token>`
- Response: `{ upvotes: number }`

**POST** `/api/issues/{issue_id}/comments`
- Headers: `Authorization: Bearer <token>`
- Request: `{ content: string }`
- Response: `{ comment: CommentObject }`

---

### Team Endpoints

**GET** `/api/teams`
- Query: `?tags=<tag1,tag2>`
- Response: `{ teams: TeamObject[] }`

**POST** `/api/teams`
- Headers: `Authorization: Bearer <token>`
- Request: `{ name: string, description: string, requirements: string, tags: string[], max_members: number }`
- Response: `{ team: TeamObject }`

**POST** `/api/teams/{team_id}/join`
- Headers: `Authorization: Bearer <token>`
- Response: `{ message: string }`

**DELETE** `/api/teams/{team_id}/leave`
- Headers: `Authorization: Bearer <token>`
- Response: `{ message: string }`

---

### Mess Review Endpoints

**GET** `/api/mess-reviews`
- Query: `?date=<YYYY-MM-DD>&meal_type=<type>`
- Response: `{ reviews: ReviewObject[], stats: StatsObject }`

**POST** `/api/mess-reviews`
- Headers: `Authorization: Bearer <token>`
- Request: `{ date: string, meal_type: string, taste_rating: number, hygiene_rating: number, service_rating: number, portion_rating: number, comment: string }`
- Response: `{ review: ReviewObject }`

**GET** `/api/mess-reviews/stats`
- Query: `?start_date=<date>&end_date=<date>`
- Response: `{ aggregated_stats: StatsObject }`

---

### Challenge Endpoints

**GET** `/api/challenges`
- Query: `?active=true`
- Response: `{ challenges: ChallengeObject[] }`

**POST** `/api/challenges`
- Headers: `Authorization: Bearer <token>`
- Permissions: `club_admin`, `sc_admin`
- Request: `{ title: string, description: string, points: number, start_date: string, end_date: string }`
- Response: `{ challenge: ChallengeObject }`

**POST** `/api/challenges/{challenge_id}/complete`
- Headers: `Authorization: Bearer <token>`
- Response: `{ completion: CompletionObject, total_points: number }`

**GET** `/api/challenges/leaderboard`
- Response: `{ leaderboard: LeaderboardEntry[] }`

---

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[SETUP.md](docs/SETUP.md)** – Installation and local development setup
- **[STRUCTURE.md](docs/STRUCTURE.md)** – Detailed project structure and module explanations
- **[API_DOCS.md](docs/API_DOCS.md)** – Complete API reference with request/response examples
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** – Deployment instructions and configuration
- **[LICENSE.md](docs/LICENSE.md)** – Project license information

---

## Getting Started

For local development setup and installation instructions, please refer to [docs/SETUP.md](docs/SETUP.md).

---

**PlakshaConnect** – Built with care for the Plaksha community.
