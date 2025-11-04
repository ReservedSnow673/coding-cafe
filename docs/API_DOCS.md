# API Documentation

Complete API reference for PlakshaConnect backend endpoints.

---

## Base URL

**Local Development:** `http://localhost:8000`

**API Prefix:** `/api`

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  }
}
```

---

## Authentication Endpoints

### Request OTP

**Endpoint:** `POST /api/auth/request-otp`

**Description:** Sends a 6-digit OTP to the provided Plaksha email address.

**Request Body:**
```json
{
  "email": "student@plaksha.edu.in"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OTP sent to email",
  "expires_in": 300
}
```

**Errors:**
- `400`: Invalid email format
- `403`: Email domain not allowed (must be @plaksha.edu.in)
- `429`: Too many requests (rate limited)

---

### Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Description:** Verifies the OTP and returns a JWT token.

**Request Body:**
```json
{
  "email": "student@plaksha.edu.in",
  "otp": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 1800,
    "user": {
      "id": "uuid",
      "email": "student@plaksha.edu.in",
      "name": "John Doe",
      "role": "student",
      "profile_picture": "url",
      "hostel": "Hostel A",
      "course": "Computer Science",
      "year": 2
    }
  }
}
```

**Errors:**
- `400`: Invalid OTP
- `401`: OTP expired
- `404`: Email not found

---

### Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Invalidates the current JWT token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Get Current User

**Endpoint:** `GET /api/auth/me`

**Description:** Returns the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "student@plaksha.edu.in",
    "name": "John Doe",
    "role": "student",
    "profile_picture": "url",
    "hostel": "Hostel A",
    "course": "Computer Science",
    "year": 2,
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

---

## User Endpoints

### Update Profile

**Endpoint:** `PUT /api/users/profile`

**Description:** Updates the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "profile_picture": "url",
  "hostel": "Hostel B",
  "course": "Computer Science",
  "year": 3
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "student@plaksha.edu.in",
    "name": "John Doe",
    "profile_picture": "url",
    "hostel": "Hostel B",
    "course": "Computer Science",
    "year": 3
  }
}
```

---

### Get User by ID

**Endpoint:** `GET /api/users/{user_id}`

**Description:** Retrieves public profile information for a specific user.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Jane Smith",
    "profile_picture": "url",
    "hostel": "Hostel A",
    "course": "Data Science",
    "year": 1
  }
}
```

---

## Location Endpoints

### Share Location

**Endpoint:** `POST /api/location/share`

**Description:** Shares the user's current campus location.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "latitude": 30.7333,
  "longitude": 76.7794,
  "visibility": "all",
  "duration": 3600
}
```

**Parameters:**
- `latitude`: Decimal, required
- `longitude`: Decimal, required
- `visibility`: Enum (`all`, `friends`, `group`), default: `all`
- `duration`: Integer (seconds), default: 3600 (1 hour)

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "latitude": 30.7333,
    "longitude": 76.7794,
    "visibility": "all",
    "expires_at": "2025-11-04T12:30:00Z"
  }
}
```

---

### Get Nearby Locations

**Endpoint:** `GET /api/location/nearby`

**Description:** Retrieves locations of users currently sharing their location.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `radius`: Integer (meters), default: 500

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "locations": [
      {
        "user": {
          "id": "uuid",
          "name": "Jane Smith",
          "profile_picture": "url"
        },
        "latitude": 30.7334,
        "longitude": 76.7795,
        "distance": 45,
        "shared_at": "2025-11-04T11:45:00Z"
      }
    ]
  }
}
```

---

### Stop Sharing Location

**Endpoint:** `DELETE /api/location/{location_id}`

**Description:** Stops sharing the specified location.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Location sharing stopped"
}
```

---

## Chat Endpoints

### Get Chat Groups

**Endpoint:** `GET /api/chat/groups`

**Description:** Retrieves all chat groups the user is a member of.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `type`: Enum (`hostel`, `club`, `course`, `team`), optional

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "uuid",
        "name": "Hostel A Common Room",
        "type": "hostel",
        "context_id": "hostel_a",
        "member_count": 45,
        "last_message": {
          "content": "Hey everyone!",
          "sender": "John Doe",
          "timestamp": "2025-11-04T11:30:00Z"
        },
        "unread_count": 3
      }
    ]
  }
}
```

---

### Create Chat Group

**Endpoint:** `POST /api/chat/groups`

**Description:** Creates a new chat group.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "CS101 Study Group",
  "type": "course",
  "context_id": "cs101"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "CS101 Study Group",
    "type": "course",
    "context_id": "cs101",
    "created_by": "uuid",
    "created_at": "2025-11-04T11:45:00Z"
  }
}
```

---

### Get Chat Messages

**Endpoint:** `GET /api/chat/groups/{group_id}/messages`

**Description:** Retrieves message history for a specific group.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit`: Integer, default: 50, max: 100
- `before`: ISO timestamp, optional (for pagination)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "sender": {
          "id": "uuid",
          "name": "John Doe",
          "profile_picture": "url"
        },
        "content": "Hello everyone!",
        "created_at": "2025-11-04T11:30:00Z"
      }
    ],
    "has_more": true
  }
}
```

---

### WebSocket: Chat Connection

**Endpoint:** `WS /ws/chat/{group_id}`

**Description:** Establishes a WebSocket connection for real-time messaging.

**Headers:**
```
Authorization: Bearer <token>
```

**Client → Server Messages:**

Send message:
```json
{
  "type": "message",
  "content": "Hello everyone!"
}
```

Typing indicator:
```json
{
  "type": "typing",
  "is_typing": true
}
```

**Server → Client Messages:**

New message:
```json
{
  "type": "message",
  "data": {
    "id": "uuid",
    "sender": {
      "id": "uuid",
      "name": "John Doe"
    },
    "content": "Hello everyone!",
    "created_at": "2025-11-04T11:30:00Z"
  }
}
```

User typing:
```json
{
  "type": "typing",
  "data": {
    "user_id": "uuid",
    "user_name": "Jane Smith",
    "is_typing": true
  }
}
```

---

## Announcement Endpoints

### Get Announcements

**Endpoint:** `GET /api/announcements`

**Description:** Retrieves campus announcements.

**Query Parameters:**
- `category`: Enum (`cultural`, `academic`, `sports`, `general`), optional
- `limit`: Integer, default: 20
- `offset`: Integer, default: 0

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "announcements": [
      {
        "id": "uuid",
        "title": "Hackathon Registration Open",
        "content": "Register for the annual hackathon...",
        "category": "academic",
        "posted_by": {
          "id": "uuid",
          "name": "Tech Club",
          "role": "club_admin"
        },
        "expires_at": "2025-11-10T23:59:59Z",
        "created_at": "2025-11-04T10:00:00Z"
      }
    ],
    "total": 15
  }
}
```

---

### Create Announcement

**Endpoint:** `POST /api/announcements`

**Description:** Creates a new announcement.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions:** `club_admin` or `sc_admin`

**Request Body:**
```json
{
  "title": "Hackathon Registration Open",
  "content": "Register for the annual hackathon by visiting...",
  "category": "academic",
  "expires_at": "2025-11-10T23:59:59Z"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Hackathon Registration Open",
    "content": "Register for the annual hackathon...",
    "category": "academic",
    "posted_by": "uuid",
    "expires_at": "2025-11-10T23:59:59Z",
    "created_at": "2025-11-04T10:00:00Z"
  }
}
```

**Errors:**
- `403`: Insufficient permissions

---

### Delete Announcement

**Endpoint:** `DELETE /api/announcements/{announcement_id}`

**Description:** Deletes an announcement.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions:** Creator or `sc_admin`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Announcement deleted"
}
```

---

## Issue Endpoints

### Get Issues

**Endpoint:** `GET /api/issues`

**Description:** Retrieves reported campus issues.

**Query Parameters:**
- `status`: Enum (`open`, `in_progress`, `resolved`), optional
- `category`: Enum (`maintenance`, `wifi`, `mess`, `other`), optional
- `limit`: Integer, default: 20
- `offset`: Integer, default: 0

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "issues": [
      {
        "id": "uuid",
        "title": "Broken chair in Library",
        "description": "Chair near window is broken",
        "category": "maintenance",
        "status": "open",
        "reported_by": {
          "id": "uuid",
          "name": "John Doe"
        },
        "upvotes": 12,
        "comment_count": 3,
        "created_at": "2025-11-03T14:30:00Z"
      }
    ],
    "total": 45
  }
}
```

---

### Create Issue

**Endpoint:** `POST /api/issues`

**Description:** Reports a new campus issue.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Broken chair in Library",
  "description": "Chair near window is broken and needs repair",
  "category": "maintenance"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Broken chair in Library",
    "description": "Chair near window is broken and needs repair",
    "category": "maintenance",
    "status": "open",
    "reported_by": "uuid",
    "upvotes": 0,
    "created_at": "2025-11-04T11:45:00Z"
  }
}
```

---

### Update Issue Status

**Endpoint:** `PUT /api/issues/{issue_id}/status`

**Description:** Updates the status of an issue.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions:** `sc_admin`

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "in_progress",
    "resolved_by": null,
    "resolved_at": null
  }
}
```

---

### Upvote Issue

**Endpoint:** `POST /api/issues/{issue_id}/upvote`

**Description:** Upvotes an issue to show support.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "upvotes": 13,
    "user_upvoted": true
  }
}
```

---

### Add Issue Comment

**Endpoint:** `POST /api/issues/{issue_id}/comments`

**Description:** Adds a comment to an issue.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "I noticed this too, it's been broken for days"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "I noticed this too, it's been broken for days",
    "user": {
      "id": "uuid",
      "name": "Jane Smith"
    },
    "created_at": "2025-11-04T11:50:00Z"
  }
}
```

---

### Get Issue Comments

**Endpoint:** `GET /api/issues/{issue_id}/comments`

**Description:** Retrieves all comments for an issue.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "uuid",
        "content": "I noticed this too",
        "user": {
          "id": "uuid",
          "name": "Jane Smith"
        },
        "created_at": "2025-11-04T11:50:00Z"
      }
    ]
  }
}
```

---

## Team Endpoints

### Get Teams

**Endpoint:** `GET /api/teams`

**Description:** Retrieves available teams.

**Query Parameters:**
- `tags`: Comma-separated string, optional
- `limit`: Integer, default: 20
- `offset`: Integer, default: 0

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "teams": [
      {
        "id": "uuid",
        "name": "ML Hackathon Team",
        "description": "Looking for team members with ML experience",
        "requirements": "Python, TensorFlow, previous hackathon experience",
        "tags": ["machine-learning", "hackathon", "python"],
        "created_by": {
          "id": "uuid",
          "name": "John Doe"
        },
        "member_count": 2,
        "max_members": 4,
        "created_at": "2025-11-01T10:00:00Z"
      }
    ],
    "total": 12
  }
}
```

---

### Create Team

**Endpoint:** `POST /api/teams`

**Description:** Creates a new team.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "ML Hackathon Team",
  "description": "Looking for team members with ML experience",
  "requirements": "Python, TensorFlow, previous hackathon experience",
  "tags": ["machine-learning", "hackathon", "python"],
  "max_members": 4
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "ML Hackathon Team",
    "description": "Looking for team members with ML experience",
    "requirements": "Python, TensorFlow, previous hackathon experience",
    "tags": ["machine-learning", "hackathon", "python"],
    "created_by": "uuid",
    "member_count": 1,
    "max_members": 4,
    "created_at": "2025-11-04T11:45:00Z"
  }
}
```

---

### Join Team

**Endpoint:** `POST /api/teams/{team_id}/join`

**Description:** Joins a team.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Successfully joined team",
  "data": {
    "team_id": "uuid",
    "member_count": 3
  }
}
```

**Errors:**
- `400`: Team is full
- `409`: Already a member

---

### Leave Team

**Endpoint:** `DELETE /api/teams/{team_id}/leave`

**Description:** Leaves a team.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Successfully left team"
}
```

---

### Get Team Members

**Endpoint:** `GET /api/teams/{team_id}/members`

**Description:** Retrieves team members.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "uuid",
        "name": "John Doe",
        "profile_picture": "url",
        "course": "Computer Science",
        "year": 2,
        "joined_at": "2025-11-01T10:00:00Z"
      }
    ]
  }
}
```

---

## Mess Review Endpoints

### Get Mess Reviews

**Endpoint:** `GET /api/mess-reviews`

**Description:** Retrieves mess reviews.

**Query Parameters:**
- `date`: Date (YYYY-MM-DD), optional (defaults to today)
- `meal_type`: Enum (`breakfast`, `lunch`, `dinner`), optional

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "name": "John Doe"
        },
        "date": "2025-11-04",
        "meal_type": "lunch",
        "taste_rating": 4,
        "hygiene_rating": 5,
        "service_rating": 4,
        "portion_rating": 3,
        "comment": "Food was good today!",
        "created_at": "2025-11-04T13:30:00Z"
      }
    ],
    "stats": {
      "average_taste": 3.8,
      "average_hygiene": 4.2,
      "average_service": 4.0,
      "average_portion": 3.5,
      "total_reviews": 45
    }
  }
}
```

---

### Create Mess Review

**Endpoint:** `POST /api/mess-reviews`

**Description:** Submits a mess review.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "date": "2025-11-04",
  "meal_type": "lunch",
  "taste_rating": 4,
  "hygiene_rating": 5,
  "service_rating": 4,
  "portion_rating": 3,
  "comment": "Food was good today!"
}
```

**Parameters:**
- All ratings: Integer 1-5
- `comment`: String, optional

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "date": "2025-11-04",
    "meal_type": "lunch",
    "taste_rating": 4,
    "hygiene_rating": 5,
    "service_rating": 4,
    "portion_rating": 3,
    "comment": "Food was good today!",
    "created_at": "2025-11-04T13:30:00Z"
  }
}
```

**Errors:**
- `409`: User already reviewed this meal

---

### Get Mess Statistics

**Endpoint:** `GET /api/mess-reviews/stats`

**Description:** Retrieves aggregated mess statistics.

**Query Parameters:**
- `start_date`: Date (YYYY-MM-DD), required
- `end_date`: Date (YYYY-MM-DD), required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2025-10-28",
      "end": "2025-11-04"
    },
    "overall": {
      "average_taste": 3.8,
      "average_hygiene": 4.2,
      "average_service": 4.0,
      "average_portion": 3.5,
      "total_reviews": 312
    },
    "by_meal": {
      "breakfast": {
        "average_taste": 3.5,
        "average_hygiene": 4.1,
        "average_service": 3.9,
        "average_portion": 3.7,
        "total_reviews": 98
      },
      "lunch": {
        "average_taste": 4.0,
        "average_hygiene": 4.3,
        "average_service": 4.1,
        "average_portion": 3.6,
        "total_reviews": 115
      },
      "dinner": {
        "average_taste": 3.9,
        "average_hygiene": 4.2,
        "average_service": 4.0,
        "average_portion": 3.3,
        "total_reviews": 99
      }
    }
  }
}
```

---

## Challenge Endpoints

### Get Challenges

**Endpoint:** `GET /api/challenges`

**Description:** Retrieves campus challenges.

**Query Parameters:**
- `active`: Boolean, optional (shows only active challenges)
- `limit`: Integer, default: 20
- `offset`: Integer, default: 0

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "challenges": [
      {
        "id": "uuid",
        "title": "Eco-Friendly Week",
        "description": "Use reusable bottles and bags for a week",
        "points": 50,
        "created_by": {
          "id": "uuid",
          "name": "Environment Club"
        },
        "start_date": "2025-11-01T00:00:00Z",
        "end_date": "2025-11-07T23:59:59Z",
        "completed_by": 23,
        "user_completed": false
      }
    ],
    "total": 8
  }
}
```

---

### Create Challenge

**Endpoint:** `POST /api/challenges`

**Description:** Creates a new challenge.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissions:** `club_admin` or `sc_admin`

**Request Body:**
```json
{
  "title": "Eco-Friendly Week",
  "description": "Use reusable bottles and bags for a week",
  "points": 50,
  "start_date": "2025-11-01T00:00:00Z",
  "end_date": "2025-11-07T23:59:59Z"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Eco-Friendly Week",
    "description": "Use reusable bottles and bags for a week",
    "points": 50,
    "created_by": "uuid",
    "start_date": "2025-11-01T00:00:00Z",
    "end_date": "2025-11-07T23:59:59Z",
    "created_at": "2025-10-31T10:00:00Z"
  }
}
```

---

### Complete Challenge

**Endpoint:** `POST /api/challenges/{challenge_id}/complete`

**Description:** Marks a challenge as completed by the user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Challenge completed!",
  "data": {
    "challenge_id": "uuid",
    "points_earned": 50,
    "total_points": 250,
    "completed_at": "2025-11-04T12:00:00Z"
  }
}
```

**Errors:**
- `400`: Challenge not active or already completed
- `404`: Challenge not found

---

### Get Leaderboard

**Endpoint:** `GET /api/challenges/leaderboard`

**Description:** Retrieves the campus challenge leaderboard.

**Query Parameters:**
- `limit`: Integer, default: 50

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user": {
          "id": "uuid",
          "name": "Jane Smith",
          "profile_picture": "url"
        },
        "total_points": 450,
        "challenges_completed": 9
      },
      {
        "rank": 2,
        "user": {
          "id": "uuid",
          "name": "John Doe",
          "profile_picture": "url"
        },
        "total_points": 400,
        "challenges_completed": 8
      }
    ],
    "current_user_rank": 15,
    "current_user_points": 250
  }
}
```

---

### Get User Challenge Stats

**Endpoint:** `GET /api/challenges/stats`

**Description:** Retrieves challenge statistics for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total_points": 250,
    "challenges_completed": 5,
    "challenges_available": 3,
    "rank": 15,
    "recent_completions": [
      {
        "challenge": {
          "id": "uuid",
          "title": "Eco-Friendly Week",
          "points": 50
        },
        "completed_at": "2025-11-04T12:00:00Z"
      }
    ]
  }
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

| Endpoint Type | Rate Limit |
|---------------|------------|
| Authentication | 5 requests / 5 minutes |
| Read operations (GET) | 100 requests / minute |
| Write operations (POST, PUT, DELETE) | 30 requests / minute |
| WebSocket connections | 10 connections / minute |

**Rate limit headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699099200
```

**Rate limit exceeded response:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later",
    "retry_after": 60
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Request validation failed |
| `UNAUTHORIZED` | Missing or invalid authentication token |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict (e.g., duplicate entry) |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SERVER_ERROR` | Internal server error |
| `DATABASE_ERROR` | Database operation failed |
| `VALIDATION_ERROR` | Data validation failed |

---

## Pagination

List endpoints support pagination using `limit` and `offset`:

```
GET /api/teams?limit=20&offset=40
```

Response includes pagination metadata:
```json
{
  "success": true,
  "data": {
    "teams": [...],
    "pagination": {
      "limit": 20,
      "offset": 40,
      "total": 125,
      "has_next": true,
      "has_previous": true
    }
  }
}
```

---

## Filtering and Sorting

Many endpoints support filtering and sorting:

**Filtering:**
```
GET /api/announcements?category=academic&status=active
```

**Sorting:**
```
GET /api/issues?sort_by=upvotes&order=desc
```

---

## WebSocket Events

### Connection

Establish connection:
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/chat/group_id?token=jwt_token');
```

### Heartbeat

Server sends ping every 30 seconds:
```json
{
  "type": "ping"
}
```

Client should respond with pong:
```json
{
  "type": "pong"
}
```

### Error Messages

```json
{
  "type": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid token"
  }
}
```

---

For implementation examples and code snippets, refer to the frontend `lib/api.ts` file.
