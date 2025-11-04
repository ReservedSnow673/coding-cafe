# Project Structure

This document provides a detailed explanation of the PlakshaConnect project structure, including the purpose of each directory and module.

---

## Root Structure

```
plaksha-connect/
├── frontend/          # Next.js frontend application
├── backend/           # FastAPI backend application
├── docs/              # Documentation files
└── README.md          # Project overview
```

---

## Frontend Structure

```
frontend/
├── app/                    # Next.js App Router directory
│   ├── (auth)/            # Authentication routes group
│   │   ├── login/         # Login page
│   │   └── verify/        # OTP verification page
│   ├── (dashboard)/       # Main dashboard routes group
│   │   ├── announcements/ # Announcements feed
│   │   ├── chat/          # Group chat interface
│   │   ├── issues/        # Issue reporting and tracking
│   │   ├── location/      # Campus location sharing
│   │   ├── mess-review/   # Mess review portal
│   │   ├── teams/         # Team formation board
│   │   └── challenges/    # Campus challenges
│   ├── api/               # API route handlers (if needed)
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Homepage
│
├── components/             # Reusable React components
│   ├── ui/                # Base UI components (buttons, inputs, cards)
│   ├── auth/              # Authentication-related components
│   ├── chat/              # Chat components (message bubble, input, etc.)
│   ├── location/          # Location sharing components
│   └── shared/            # Shared components (navbar, sidebar, etc.)
│
├── lib/                    # Utility functions and configurations
│   ├── api.ts             # API client and request helpers
│   ├── websocket.ts       # WebSocket connection manager
│   ├── auth.ts            # Authentication utilities
│   └── utils.ts           # General utility functions
│
├── types/                  # TypeScript type definitions
│   ├── user.ts            # User-related types
│   ├── chat.ts            # Chat-related types
│   ├── announcement.ts    # Announcement types
│   └── index.ts           # Exported types
│
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts         # Authentication hook
│   ├── useWebSocket.ts    # WebSocket hook
│   └── useApi.ts          # API request hook
│
├── contexts/               # React Context providers
│   ├── AuthContext.tsx    # Authentication context
│   └── ThemeContext.tsx   # Theme/UI context
│
├── public/                 # Static assets
│   ├── images/            # Image files
│   └── icons/             # Icon files
│
├── styles/                 # Global styles
│   └── globals.css        # Global CSS
│
├── .env.local              # Environment variables
├── next.config.js          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Dependencies and scripts
```

### Frontend Module Descriptions

#### App Directory (`app/`)

**Route Groups:**
- `(auth)/`: Authentication-related pages (login, OTP verification)
- `(dashboard)/`: Main application features after authentication

**Feature Modules:**
- `announcements/`: Display and filter campus announcements
- `chat/`: Real-time group chat interface with message history
- `issues/`: Report, track, and comment on campus issues
- `location/`: Share and view campus locations
- `mess-review/`: Submit and view mess reviews with ratings
- `teams/`: Create and join project teams
- `challenges/`: View and complete campus challenges

#### Components Directory (`components/`)

**UI Components (`ui/`):**
- Reusable, styled base components (buttons, inputs, cards, modals)
- Built with consistency and accessibility in mind

**Feature Components:**
- `auth/`: OTP input, login form, verification components
- `chat/`: Message bubbles, chat input, user list
- `location/`: Map display, location card, privacy settings
- `shared/`: Navbar, sidebar, footer, notifications

#### Library Directory (`lib/`)

**API Client (`api.ts`):**
- Centralized API request functions
- Request/response interceptors
- Error handling
- Authentication header injection

**WebSocket Manager (`websocket.ts`):**
- WebSocket connection management
- Event listeners and emitters
- Reconnection logic
- Message queue for offline support

**Authentication Utilities (`auth.ts`):**
- Token storage and retrieval
- User session management
- Role-based access control helpers

#### Types Directory (`types/`)

TypeScript interfaces and types for:
- User profiles and authentication
- Chat messages and groups
- Announcements and categories
- Issues and comments
- Teams and members
- Reviews and ratings

#### Hooks Directory (`hooks/`)

Custom React hooks for:
- Authentication state (`useAuth`)
- WebSocket connections (`useWebSocket`)
- API requests with loading/error states (`useApi`)
- Form handling (`useForm`)

---

## Backend Structure

```
backend/
├── app/
│   ├── routers/            # API route handlers
│   │   ├── auth.py         # Authentication endpoints
│   │   ├── users.py        # User management endpoints
│   │   ├── announcements.py # Announcement endpoints
│   │   ├── chat.py         # Chat endpoints
│   │   ├── issues.py       # Issue reporting endpoints
│   │   ├── location.py     # Location sharing endpoints
│   │   ├── mess_review.py  # Mess review endpoints
│   │   ├── teams.py        # Team formation endpoints
│   │   └── challenges.py   # Challenge endpoints
│   │
│   ├── models/             # SQLAlchemy database models
│   │   ├── user.py         # User model
│   │   ├── announcement.py # Announcement model
│   │   ├── chat.py         # Chat models (groups, messages)
│   │   ├── issue.py        # Issue and comment models
│   │   ├── location.py     # Location model
│   │   ├── mess_review.py  # Mess review model
│   │   ├── team.py         # Team and member models
│   │   └── challenge.py    # Challenge models
│   │
│   ├── schemas/            # Pydantic schemas for validation
│   │   ├── auth.py         # Auth request/response schemas
│   │   ├── user.py         # User schemas
│   │   ├── announcement.py # Announcement schemas
│   │   ├── chat.py         # Chat schemas
│   │   ├── issue.py        # Issue schemas
│   │   ├── location.py     # Location schemas
│   │   ├── mess_review.py  # Mess review schemas
│   │   ├── team.py         # Team schemas
│   │   └── challenge.py    # Challenge schemas
│   │
│   ├── services/           # Business logic layer
│   │   ├── auth_service.py # Authentication logic
│   │   ├── email_service.py # Email sending (OTP)
│   │   ├── websocket_service.py # WebSocket management
│   │   ├── location_service.py # Location calculations
│   │   └── notification_service.py # Push notifications
│   │
│   ├── core/               # Core configurations
│   │   ├── config.py       # Application configuration
│   │   ├── security.py     # Security utilities (JWT, hashing)
│   │   └── database.py     # Database connection and session
│   │
│   ├── middleware/         # Custom middleware
│   │   ├── auth.py         # JWT authentication middleware
│   │   ├── cors.py         # CORS configuration
│   │   └── error_handler.py # Global error handling
│   │
│   ├── utils/              # Utility functions
│   │   ├── validators.py   # Custom validators
│   │   ├── helpers.py      # Helper functions
│   │   └── constants.py    # Application constants
│   │
│   └── main.py             # Application entry point
│
├── migrations/             # Alembic database migrations
│   ├── versions/           # Migration version files
│   └── env.py              # Alembic environment config
│
├── tests/                  # Unit and integration tests
│   ├── test_auth.py        # Authentication tests
│   ├── test_api.py         # API endpoint tests
│   └── conftest.py         # Test configurations
│
├── .env                    # Environment variables
├── alembic.ini             # Alembic configuration
├── requirements.txt        # Python dependencies
└── README.md               # Backend-specific documentation
```

### Backend Module Descriptions

#### Routers Directory (`routers/`)

API endpoint handlers organized by feature:
- Each router handles HTTP requests for a specific domain
- Implements request validation, business logic delegation, and response formatting
- Uses dependency injection for database sessions and authentication

**Example router structure:**
```python
# routers/announcements.py
- GET /announcements (list all)
- POST /announcements (create new)
- GET /announcements/{id} (get specific)
- PUT /announcements/{id} (update)
- DELETE /announcements/{id} (delete)
```

#### Models Directory (`models/`)

SQLAlchemy ORM models defining database schema:
- Each model represents a database table
- Defines columns, data types, and constraints
- Establishes relationships between tables
- Includes indexes for query optimization

**Model relationships:**
- User → many Locations (one-to-many)
- User → many ChatMessages (one-to-many)
- ChatGroup → many ChatMessages (one-to-many)
- Team → many TeamMembers (one-to-many through junction table)
- Issue → many IssueComments (one-to-many)

#### Schemas Directory (`schemas/`)

Pydantic models for request/response validation:
- Input validation for API requests
- Output serialization for API responses
- Type safety and automatic documentation
- Data transformation and computed fields

**Schema types:**
- `Create` schemas: For POST requests
- `Update` schemas: For PUT/PATCH requests
- `Response` schemas: For API responses
- `InDB` schemas: For database representations

#### Services Directory (`services/`)

Business logic layer separating concerns:
- **auth_service.py**: OTP generation, JWT creation, token validation
- **email_service.py**: SMTP configuration, email templates, sending logic
- **websocket_service.py**: Connection management, message broadcasting
- **location_service.py**: Distance calculations, privacy filtering
- **notification_service.py**: Notification creation and delivery

#### Core Directory (`core/`)

**config.py:**
- Environment variable loading
- Application settings
- Feature flags
- External service configurations

**security.py:**
- Password hashing (bcrypt)
- JWT token creation and validation
- OTP generation
- Security utilities

**database.py:**
- Database connection pool
- Session management
- Base model configuration
- Database health checks

#### Middleware Directory (`middleware/`)

**auth.py:**
- JWT token extraction from headers
- Token validation
- User identity injection into request context
- Role-based access control enforcement

**cors.py:**
- CORS origin validation
- Preflight request handling
- Security headers

**error_handler.py:**
- Global exception handling
- Standardized error responses
- Logging integration

---

## Database Migrations

Located in `backend/migrations/`:

**Migration workflow:**
1. Modify database models in `models/`
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Review generated migration in `migrations/versions/`
4. Apply migration: `alembic upgrade head`

**Migration files contain:**
- `upgrade()`: Forward migration logic
- `downgrade()`: Rollback logic
- Timestamp and revision ID
- Dependencies on previous migrations

---

## Configuration Files

### Frontend Configuration

**next.config.js:**
- Next.js framework configuration
- Webpack customization
- Environment variable exposure
- Build optimization

**tsconfig.json:**
- TypeScript compiler options
- Path aliases
- Type checking strictness

**tailwind.config.js:**
- Design system configuration
- Custom colors and spacing
- Plugin configuration

### Backend Configuration

**alembic.ini:**
- Migration directory path
- Database connection string template
- Logging configuration

**requirements.txt:**
Core dependencies:
- `fastapi`: Web framework
- `uvicorn`: ASGI server
- `sqlalchemy`: ORM
- `alembic`: Migration tool
- `pydantic`: Data validation
- `python-jose`: JWT handling
- `passlib`: Password hashing
- `python-multipart`: File uploads
- `websockets`: WebSocket support
- `psycopg2-binary`: PostgreSQL driver

---

## Module Communication Flow

### HTTP Request Flow

```
Frontend → API Request → Backend Router → Service Layer → Database → Response
```

1. Frontend makes HTTP request via `lib/api.ts`
2. Backend router receives request
3. Request validated against Pydantic schema
4. Service layer executes business logic
5. Database queried via SQLAlchemy
6. Response formatted and returned

### WebSocket Flow

```
Frontend → WebSocket Connection → Backend WebSocket Handler → Broadcast to Clients
```

1. Frontend establishes WebSocket connection via `lib/websocket.ts`
2. Backend authenticates connection
3. Client subscribes to specific channels (e.g., chat group)
4. Messages broadcast to all subscribed clients in real-time

### Authentication Flow

```
User → Request OTP → Email Sent → Verify OTP → JWT Token → Authenticated Requests
```

1. User enters email
2. Backend generates 6-digit OTP
3. OTP sent via email service
4. User enters OTP
5. Backend validates OTP
6. JWT token issued
7. Token stored in frontend
8. Token sent with subsequent requests

---

## Module Interdependencies

### Frontend Dependencies

- `app/` pages depend on `components/` and `lib/`
- `components/` depend on `types/` and `hooks/`
- `lib/api.ts` depends on `lib/auth.ts` for token management
- `hooks/` depend on `lib/` and `contexts/`

### Backend Dependencies

- `routers/` depend on `schemas/`, `models/`, and `services/`
- `services/` depend on `models/` and `core/`
- `models/` depend on `core/database.py`
- `middleware/` depends on `core/security.py`

---

## Modularity Principles

PlakshaConnect is designed with modularity in mind:

1. **Feature Isolation**: Each feature has dedicated router, model, schema, and service
2. **Shared Core**: Common functionality (auth, database) centralized in `core/`
3. **Loose Coupling**: Services communicate through well-defined interfaces
4. **Easy Extension**: New features can be added without modifying existing code

**Adding a new feature:**
1. Create model in `models/`
2. Create schemas in `schemas/`
3. Create router in `routers/`
4. Create service (if needed) in `services/`
5. Register router in `main.py`
6. Create migration
7. Build frontend UI in `app/` and `components/`

---

For additional details on specific modules, refer to inline code documentation.
