# API Reference

PlakshaConnect API v2.0.0 - Complete endpoint documentation for the campus social platform.

Base URL: `http://localhost:8000/api`

Production: `https://api.plakshaconnect.com/api`

---

## Authentication

All endpoints except `/auth/request-otp` and `/auth/verify-otp` require a JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

### Email Validation

Only `@plaksha.edu.in` email addresses are accepted for registration.

---

## Auth Endpoints

### Request OTP

Send OTP code to user's email.

```http
POST /auth/request-otp
Content-Type: application/json

{
  "email": "student@plaksha.edu.in"
}
```

**Response** (200):
```json
{
  "message": "OTP sent to email",
  "otp_id": "uuid-here"
}
```

**Errors**:
- 400: Invalid email format or not @plaksha.edu.in
- 429: Too many OTP requests (rate limited)

---

### Verify OTP

Verify OTP and receive access token.

```http
POST /auth/verify-otp
Content-Type: application/json

{
  "otp_id": "uuid-from-request-otp",
  "otp_code": "123456",
  "email": "student@plaksha.edu.in"
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "user-uuid",
    "email": "student@plaksha.edu.in",
    "full_name": "John Doe",
    "phone": "+911234567890",
    "created_at": "2025-12-06T10:30:00Z"
  }
}
```

**Errors**:
- 400: Invalid or expired OTP
- 404: OTP not found

---

### Complete Profile

First-time users must complete their profile after verification.

```http
POST /auth/complete-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Doe",
  "phone": "+911234567890",
  "bio": "CS student, loves coding"
}
```

**Response** (200):
```json
{
  "message": "Profile completed",
  "user": {
    "id": "user-uuid",
    "email": "student@plaksha.edu.in",
    "full_name": "John Doe",
    "phone": "+911234567890",
    "bio": "CS student, loves coding"
  }
}
```

---

### Get Current User

```http
GET /auth/me
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "id": "user-uuid",
  "email": "student@plaksha.edu.in",
  "full_name": "John Doe",
  "phone": "+911234567890",
  "bio": "CS student, loves coding",
  "created_at": "2025-12-06T10:30:00Z"
}
```

---

## Announcements

### List Announcements

Get all announcements with pagination.

```http
GET /announcements?skip=0&limit=20
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "announcements": [
    {
      "id": "uuid",
      "title": "Campus Event Tomorrow",
      "content": "Join us for the annual tech fest...",
      "category": "events",
      "created_by": "admin-uuid",
      "created_at": "2025-12-06T10:00:00Z",
      "updated_at": "2025-12-06T10:00:00Z"
    }
  ],
  "total": 45
}
```

**Query Parameters**:
- `skip` (default: 0): Number of records to skip
- `limit` (default: 20): Max records to return
- `category` (optional): Filter by category (events, academic, general, urgent)

---

### Create Announcement

Admin only. Create a new announcement.

```http
POST /announcements
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Campus Event Tomorrow",
  "content": "Join us for the annual tech fest...",
  "category": "events"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "title": "Campus Event Tomorrow",
  "content": "Join us for the annual tech fest...",
  "category": "events",
  "created_by": "admin-uuid",
  "created_at": "2025-12-06T10:00:00Z"
}
```

---

### Update Announcement

```http
PUT /announcements/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content"
}
```

---

### Delete Announcement

```http
DELETE /announcements/{id}
Authorization: Bearer <token>
```

**Response** (204): No content

---

## Challenges

Daily coding challenges with leaderboard tracking.

### List Challenges

```http
GET /challenges?skip=0&limit=20
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "challenges": [
    {
      "id": "uuid",
      "title": "Two Sum Problem",
      "description": "Find two numbers that add up to target",
      "difficulty": "easy",
      "points": 100,
      "password_hash": "hashed-password",
      "created_at": "2025-12-06T00:00:00Z",
      "ends_at": "2025-12-07T00:00:00Z"
    }
  ],
  "total": 12
}
```

---

### Submit Challenge

Submit password to complete a challenge.

```http
POST /challenges/{id}/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "solution123"
}
```

**Response** (200):
```json
{
  "message": "Challenge completed",
  "points_earned": 100,
  "completion": {
    "challenge_id": "uuid",
    "user_id": "user-uuid",
    "completed_at": "2025-12-06T15:30:00Z"
  }
}
```

**Errors**:
- 400: Invalid password
- 409: Already completed

---

### Get Leaderboard

```http
GET /challenges/leaderboard?limit=10
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "leaderboard": [
    {
      "user_id": "uuid",
      "full_name": "John Doe",
      "total_points": 850,
      "completed_count": 8,
      "rank": 1
    }
  ]
}
```

---

## Chat

WebSocket-based group chat system.

### List Chat Groups

```http
GET /chat/groups
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "groups": [
    {
      "id": "uuid",
      "name": "CS Batch 2025",
      "description": "Computer Science batch discussion",
      "created_by": "user-uuid",
      "member_count": 45,
      "created_at": "2025-09-01T10:00:00Z"
    }
  ]
}
```

---

### Create Chat Group

```http
POST /chat/groups
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Study Group",
  "description": "Daily study sessions"
}
```

---

### Send Message

```http
POST /chat/groups/{group_id}/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hey everyone, let's meet at 5 PM"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "group_id": "group-uuid",
  "sender_id": "user-uuid",
  "content": "Hey everyone, let's meet at 5 PM",
  "created_at": "2025-12-06T15:30:00Z"
}
```

---

### Get Group Messages

```http
GET /chat/groups/{group_id}/messages?skip=0&limit=50
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "messages": [
    {
      "id": "uuid",
      "sender": {
        "id": "user-uuid",
        "full_name": "John Doe"
      },
      "content": "Hey everyone",
      "created_at": "2025-12-06T15:30:00Z"
    }
  ],
  "total": 234
}
```

---

### WebSocket Connection

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/chat/{group_id}?token={jwt_token}');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('New message:', message);
};

ws.send(JSON.stringify({
  type: 'message',
  content: 'Hello everyone'
}));
```

---

## Issues

Report and track campus issues.

### List Issues

```http
GET /issues?skip=0&limit=20&status=open
Authorization: Bearer <token>
```

**Query Parameters**:
- `status`: open, in_progress, resolved, closed
- `category`: maintenance, facilities, academic, other

**Response** (200):
```json
{
  "issues": [
    {
      "id": "uuid",
      "title": "AC not working in Lab 3",
      "description": "Air conditioning has been off since morning",
      "category": "maintenance",
      "status": "open",
      "location": "Building A, Lab 3",
      "created_by": "user-uuid",
      "created_at": "2025-12-06T09:00:00Z",
      "upvotes": 12
    }
  ],
  "total": 23
}
```

---

### Create Issue

```http
POST /issues
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "WiFi Down in Hostel",
  "description": "No internet connection since last night",
  "category": "facilities",
  "location": "Hostel Block B"
}
```

---

### Upvote Issue

```http
POST /issues/{id}/upvote
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "Issue upvoted",
  "upvotes": 13
}
```

---

### Add Comment

```http
POST /issues/{id}/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Same issue in Block C as well"
}
```

---

## Teams

Student teams and collaborations.

### List Teams

```http
GET /teams?skip=0&limit=20
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "teams": [
    {
      "id": "uuid",
      "name": "Tech Club",
      "description": "Building cool projects together",
      "created_by": "user-uuid",
      "member_count": 15,
      "created_at": "2025-09-15T10:00:00Z"
    }
  ]
}
```

---

### Create Team

```http
POST /teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Robotics Team",
  "description": "Competing in national robotics competition"
}
```

---

### Join Team

```http
POST /teams/{id}/join
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "Joined team successfully",
  "team": {
    "id": "uuid",
    "name": "Robotics Team",
    "member_count": 16
  }
}
```

---

## Mess Reviews

Dining hall ratings and reviews.

### List Reviews

```http
GET /mess-reviews?date=2025-12-06&meal_type=lunch
Authorization: Bearer <token>
```

**Query Parameters**:
- `date`: YYYY-MM-DD format
- `meal_type`: breakfast, lunch, dinner

**Response** (200):
```json
{
  "reviews": [
    {
      "id": "uuid",
      "meal_type": "lunch",
      "rating": 4,
      "comment": "Good variety today",
      "date": "2025-12-06",
      "user": {
        "id": "user-uuid",
        "full_name": "John Doe"
      },
      "created_at": "2025-12-06T13:30:00Z"
    }
  ],
  "average_rating": 3.8
}
```

---

### Submit Review

```http
POST /mess-reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "meal_type": "lunch",
  "rating": 4,
  "comment": "Good food today",
  "date": "2025-12-06"
}
```

**Validation**:
- `rating`: 1-5 stars
- One review per meal per day per user

---

## Location Sharing

Real-time location tracking for campus events.

### Share Location

```http
POST /location/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 30.3564,
  "longitude": 76.3734,
  "accuracy": 10.5,
  "duration_minutes": 30
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "user_id": "user-uuid",
  "latitude": 30.3564,
  "longitude": 76.3734,
  "shared_at": "2025-12-06T15:30:00Z",
  "expires_at": "2025-12-06T16:00:00Z"
}
```

---

### Get Nearby Users

```http
GET /location/nearby?radius=1000
Authorization: Bearer <token>
```

**Query Parameters**:
- `radius`: Search radius in meters (default: 1000)

**Response** (200):
```json
{
  "users": [
    {
      "id": "user-uuid",
      "full_name": "Jane Smith",
      "latitude": 30.3570,
      "longitude": 76.3740,
      "distance": 85.4,
      "shared_at": "2025-12-06T15:28:00Z"
    }
  ]
}
```

---

### Stop Sharing

```http
DELETE /location/share
Authorization: Bearer <token>
```

**Response** (204): No content

---

## Rate Limiting

API implements rate limiting to prevent abuse:

- **Authentication**: 5 requests per minute
- **Standard endpoints**: 100 requests per minute
- **WebSocket connections**: 10 per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638792000
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message here",
  "code": "ERROR_CODE",
  "timestamp": "2025-12-06T15:30:00Z"
}
```

**Common HTTP Status Codes**:
- 400: Bad Request - Invalid input
- 401: Unauthorized - Missing or invalid token
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource doesn't exist
- 409: Conflict - Duplicate resource
- 422: Validation Error - Invalid request body
- 429: Too Many Requests - Rate limit exceeded
- 500: Internal Server Error

---

## Development Mode

For testing without authentication, enable dev mode in frontend by toggling the dev mode switch in the UI. This bypasses authentication but should never be used in production.

---

## Webhooks (Coming Soon)

Webhook support for external integrations will be added in v2.1.0.

---

For interactive API testing, visit:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc
