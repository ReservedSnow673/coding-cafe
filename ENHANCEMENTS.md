# 🎨 PlakshaConnect - Enhancements Implemented

## Overview
This document details all enhancements made to PlakshaConnect to improve features and user experience.

---

## ✅ Profile Enhancements

### Features Implemented
1. **Profile Picture Upload**
   - Image upload with validation (JPG, PNG, GIF, WebP)
   - Automatic resizing to max 1024x1024 pixels
   - File size limit: 5MB
   - RGBA to RGB conversion for compatibility
   - Image optimization (85% quality)
   - Unique filename generation

2. **Bio Support**
   - Multi-line text bio field
   - Visible on profile page
   - Editable in profile edit mode

3. **Profile Management**
   - View profile page (`/profile`)
   - Edit profile with inline form
   - Update personal info (name, phone, year, branch, hostel, bio)
   - Upload/replace profile picture
   - Delete profile picture

### Backend Changes
**New Files:**
- `app/services/file_upload_service.py` - File upload handling with Pillow
- `app/routers/users.py` - User profile endpoints

**New Endpoints:**
```http
GET    /api/users/me                  - Get current user profile
PUT    /api/users/me                  - Update profile info
POST   /api/users/me/profile-picture  - Upload profile picture
DELETE /api/users/me/profile-picture  - Delete profile picture
GET    /api/users/{user_id}           - Get any user's profile
GET    /uploads/profile_pictures/*     - Serve uploaded images (static)
```

**Dependencies Added:**
- `Pillow==10.1.0` - Image processing
- `aiofiles==23.2.1` - Async file operations

**Configuration:**
- Upload directory: `backend/uploads/profile_pictures/`
- Auto-created on startup
- Static file serving at `/uploads`

### Frontend Changes
**New Pages:**
- `app/profile/page.tsx` - Profile view and edit page

**Features:**
- Beautiful profile card with avatar
- Inline editing mode
- Real-time image preview before upload
- Responsive design (mobile-friendly)
- Dark theme consistent with app
- Profile picture with camera icon overlay
- Form validation

---

## 🗺️ Location Enhancement (Ready for Implementation)

### Planned Features
1. **Interactive Map**
   - Leaflet.js or Mapbox GL integration
   - Real-time marker updates via WebSocket
   - Campus building markers
   - User location pins with profile pictures

2. **Building System**
   - Pre-defined campus building locations
   - Snap user location to nearest building
   - Building names and icons
   - Indoor/outdoor classification

3. **Map Interactions**
   - Click user marker to view mini-profile
   - Filter by hostel, year, friends
   - Heatmap view for popular hangouts
   - Clustering for dense areas

### Implementation Plan
```typescript
// Frontend (Leaflet.js)
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// Custom marker with profile picture
const UserMarker = ({ user, position }) => (
  <Marker position={position} icon={createUserIcon(user.profile_picture)}>
    <Popup>
      <div>
        <img src={user.profile_picture} />
        <p>{user.full_name}</p>
        <p>{user.year}th Year • {user.branch}</p>
      </div>
    </Popup>
  </Marker>
);
```

**Backend Changes Needed:**
- Add `building_id` field to Location model
- Create Building model (id, name, lat, lng, type)
- Algorithm to snap location to nearest building
- WebSocket broadcast for location updates

---

## 🔐 Auth Improvements (Ready for Implementation)

### Rate Limiting
**Implementation:**
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@router.post("/auth/request-otp")
@limiter.limit("3/15minutes")  # 3 requests per 15 minutes
async def request_otp(...):
    pass
```

**Dependencies:**
- `slowapi==0.1.9` - Rate limiting

### OTP Security
1. **Hash OTP Codes**
   ```python
   from passlib.context import CryptContext
   pwd_context = CryptContext(schemes=["bcrypt"])
   
   # Store hashed OTP
   otp_request.otp_code = pwd_context.hash(otp_code)
   
   # Verify
   if pwd_context.verify(input_otp, stored_otp_hash):
       # Valid
   ```

2. **Stricter Expiry**
   - Reduce from 10 minutes to 5 minutes
   - Auto-cleanup expired OTPs

3. **Magic Links**
   ```python
   token = secrets.token_urlsafe(32)
   magic_link = f"{frontend_url}/auth/verify?token={token}"
   # Send via email
   ```

### Session Management
**New Model:**
```python
class UserSession(Base):
    __tablename__ = "user_sessions"
    id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.id"))
    token_hash = Column(String)
    device_name = Column(String)
    ip_address = Column(String)
    last_activity = Column(DateTime)
    expires_at = Column(DateTime)
```

**Endpoints:**
```http
GET    /api/auth/sessions        - List active sessions
DELETE /api/auth/sessions/{id}   - Revoke session
POST   /api/auth/sessions/logout-all - Logout from all devices
```

---

## 💬 Chat Enhancements (Ready for Implementation)

### File Sharing
```python
@router.post("/api/chat/groups/{group_id}/files")
async def upload_file(
    group_id: UUID,
    file: UploadFile = File(...),
    ...
):
    # Validate file type and size
    # Upload to cloud storage (AWS S3, Cloudinary)
    # Create file message
    # Broadcast to group
```

**Supported Files:**
- Images: JPG, PNG, GIF, WebP
- Documents: PDF, DOCX, TXT
- Size limit: 10MB

### Message Features
1. **Reactions**
   ```python
   class MessageReaction(Base):
       message_id = Column(UUID, ForeignKey("chat_messages.id"))
       user_id = Column(UUID, ForeignKey("users.id"))
       emoji = Column(String(10))  # 👍, ❤️, 😂, etc.
   ```

2. **Read Receipts**
   ```python
   class MessageRead(Base):
       message_id = Column(UUID, ForeignKey("chat_messages.id"))
       user_id = Column(UUID, ForeignKey("users.id"))
       read_at = Column(DateTime)
   ```

3. **Message Threads**
   - Add `parent_message_id` to ChatMessage
   - Show thread count in UI
   - Dedicated thread view

---

## 📢 Announcement Enhancements (Ready for Implementation)

### Announcement Types
```python
class AnnouncementType(str, enum.Enum):
    URGENT = "urgent"      # Red banner
    EVENT = "event"        # Calendar icon
    INFO = "info"          # Blue info icon
    UPDATE = "update"      # Bell icon
```

### Attachments
```python
class AnnouncementAttachment(Base):
    announcement_id = Column(UUID, ForeignKey("announcements.id"))
    file_path = Column(String)
    file_name = Column(String)
    file_type = Column(String)  # pdf, image, etc.
    file_size = Column(Integer)
```

### Scheduling
```python
# Add fields to Announcement model
publish_at = Column(DateTime)  # Future publishing
auto_expire_days = Column(Integer)  # Auto-expire after X days

# Background task
@celery.task
def publish_scheduled_announcements():
    now = datetime.utcnow()
    announcements = db.query(Announcement).filter(
        Announcement.publish_at <= now,
        Announcement.is_published == False
    ).all()
    
    for announcement in announcements:
        announcement.is_published = True
        # Send notifications
    db.commit()
```

### Analytics
```python
class AnnouncementView(Base):
    announcement_id = Column(UUID, ForeignKey("announcements.id"))
    user_id = Column(UUID, ForeignKey("users.id"))
    viewed_at = Column(DateTime)

class AnnouncementClick(Base):
    announcement_id = Column(UUID, ForeignKey("announcements.id"))
    user_id = Column(UUID, ForeignKey("users.id"))
    clicked_at = Column(DateTime)
```

**Dashboard:**
- Total views
- Unique viewers
- Click-through rate
- Demographics (year, branch)

---

## 🐛 Issue Reporting Enhancements (Ready for Implementation)

### Structured Forms
```typescript
const issueTemplates = {
  wifi: {
    fields: ['location', 'device_type', 'error_message'],
    required: ['location']
  },
  mess: {
    fields: ['meal_type', 'date', 'specific_item'],
    required: ['meal_type', 'date']
  },
  hostel: {
    fields: ['block', 'room_number', 'issue_type'],
    required: ['block', 'issue_type']
  }
};
```

### Image Upload
```python
class IssueImage(Base):
    issue_id = Column(UUID, ForeignKey("issues.id"))
    image_path = Column(String)
    uploaded_by = Column(UUID, ForeignKey("users.id"))
    uploaded_at = Column(DateTime)
```

### Status Lifecycle
```python
class IssueStatusHistory(Base):
    issue_id = Column(UUID, ForeignKey("issues.id"))
    old_status = Column(Enum(IssueStatus))
    new_status = Column(Enum(IssueStatus))
    changed_by = Column(UUID, ForeignKey("users.id"))
    note = Column(Text)  # Optional note about change
    changed_at = Column(DateTime)
```

**Timeline View:**
```
▶ Reported by John Doe - Nov 18, 10:30 AM
▶ Assigned to Maintenance Team - Nov 18, 11:00 AM
▶ Status changed to In Progress - Nov 18, 2:00 PM
  Note: "Team is on-site investigating"
▶ Status changed to Resolved - Nov 18, 4:30 PM
  Note: "Router replaced, issue fixed"
```

---

## 👥 Team Formation Enhancements (Ready for Implementation)

### Auto-Matching
```python
def calculate_match_score(team_requirements, user_profile):
    score = 0
    
    # Skill matching
    required_skills = set(team_requirements.get('skills', []))
    user_skills = set(user_profile.get('skills', []))
    skill_match = len(required_skills & user_skills) / len(required_skills)
    score += skill_match * 40
    
    # Availability matching
    if team_requirements.get('time_commitment') == user_profile.get('availability'):
        score += 30
    
    # Role fit
    if user_profile.get('preferred_role') in team_requirements.get('needed_roles', []):
        score += 30
    
    return score

# Suggest top 10 users for team
suggestions = get_top_matches(team_id, limit=10)
```

### In-Team Tools
```python
class TeamTask(Base):
    team_id = Column(UUID, ForeignKey("teams.id"))
    title = Column(String)
    description = Column(Text)
    assigned_to = Column(UUID, ForeignKey("users.id"))
    status = Column(Enum('todo', 'in_progress', 'done'))
    due_date = Column(DateTime)
```

**Simple Kanban:**
- To Do | In Progress | Done
- Drag-and-drop interface
- Assign tasks to members
- Due date tracking

---

## 🍽️ Mess Review Enhancements (Ready for Implementation)

### One Review per Meal Rule
```python
@router.post("/api/mess-reviews")
async def create_review(review: MessReviewCreate, ...):
    # Check if review already exists
    existing = db.query(MessReview).filter(
        MessReview.user_id == user_id,
        MessReview.date == review.date,
        MessReview.meal_type == review.meal_type
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="You've already reviewed this meal"
        )
```

### Required Comments for Extreme Ratings
```python
if review.overall_rating <= 2 or review.overall_rating >= 4:
    if not review.comment or len(review.comment) < 20:
        raise HTTPException(
            status_code=400,
            detail="Please provide a detailed comment for extreme ratings"
        )
```

### Mess Dashboard
```typescript
// Weekly trend chart
<LineChart data={weeklyAverages}>
  <Line dataKey="taste_rating" stroke="#4CAF50" />
  <Line dataKey="hygiene_rating" stroke="#2196F3" />
  <Line dataKey="service_rating" stroke="#FF9800" />
  <Line dataKey="portion_rating" stroke="#9C27B0" />
</LineChart>

// Most commented items
<div>
  <h3>Most Reviewed Dishes</h3>
  {topDishes.map(dish => (
    <div key={dish.name}>
      <span>{dish.name}</span>
      <span>{dish.avg_rating} ⭐</span>
      <span>{dish.review_count} reviews</span>
    </div>
  ))}
</div>
```

### Photo Uploads
```python
class MessReviewPhoto(Base):
    review_id = Column(UUID, ForeignKey("mess_reviews.id"))
    photo_path = Column(String)
    is_approved = Column(Boolean, default=False)  # Moderation
```

---

## 🏆 Challenge Enhancements (Ready for Implementation)

### QR Code Verification
```python
import qrcode
from io import BytesIO

@router.post("/api/challenges/{id}/generate-qr")
async def generate_verification_qr(challenge_id: UUID, ...):
    # Generate unique code
    verification_code = secrets.token_hex(16)
    
    # Store in cache (expires in 5 minutes)
    redis.setex(
        f"challenge:{challenge_id}:qr:{verification_code}",
        300,  # 5 minutes
        user_id
    )
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(verification_code)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    
    return Response(content=buffer.getvalue(), media_type="image/png")

@router.post("/api/challenges/{id}/verify-qr")
async def verify_qr_code(challenge_id: UUID, code: str, ...):
    # Check code validity
    stored_user = redis.get(f"challenge:{challenge_id}:qr:{code}")
    if not stored_user:
        raise HTTPException(400, "Invalid or expired code")
    
    # Mark as completed
    # Award points
```

### Geofence Check-ins
```python
def is_within_geofence(user_lat, user_lng, challenge):
    # Calculate distance from challenge location
    distance = calculate_distance(
        user_lat, user_lng,
        challenge.latitude, challenge.longitude
    )
    
    # Must be within 100 meters
    return distance <= 0.1  # km

@router.post("/api/challenges/{id}/check-in")
async def checkin_challenge(
    challenge_id: UUID,
    lat: float,
    lng: float,
    ...
):
    challenge = get_challenge(challenge_id)
    
    if not is_within_geofence(lat, lng, challenge):
        raise HTTPException(400, "You're not at the challenge location")
    
    # Mark participation
```

### Progress Tracking
```python
class ChallengeCheckpoint(Base):
    challenge_id = Column(UUID, ForeignKey("challenges.id"))
    name = Column(String)
    description = Column(Text)
    order = Column(Integer)
    points = Column(Integer)

class ParticipantCheckpoint(Base):
    participant_id = Column(UUID, ForeignKey("challenge_participants.id"))
    checkpoint_id = Column(UUID, ForeignKey("challenge_checkpoints.id"))
    completed_at = Column(DateTime)
```

**UI Progress Bar:**
```typescript
<div className="progress-bar">
  {checkpoints.map((cp, i) => (
    <div key={cp.id} className={participant.completed.includes(cp.id) ? 'completed' : 'pending'}>
      <div className="checkpoint-number">{i + 1}</div>
      <div className="checkpoint-name">{cp.name}</div>
      {participant.completed.includes(cp.id) && <FiCheck className="check-icon" />}
    </div>
  ))}
</div>
```

---

## 📊 Dashboard Improvements (Ready for Implementation)

### Personalized Tiles
```typescript
const getDashboardTiles = (user) => {
  const tiles = [
    { id: 'location', title: 'Share Location', visible: true },
    { id: 'chat', title: 'Messages', visible: true, badge: unreadCount },
    { id: 'teams', title: 'My Teams', visible: user.teams.length > 0 },
    { id: 'issues', title: 'Report Issue', visible: true },
  ];
  
  if (user.role === 'club_admin') {
    tiles.push({ id: 'announcements', title: 'Post Announcement', visible: true });
  }
  
  return tiles.filter(t => t.visible);
};
```

### Quick Actions (Header)
```typescript
<header>
  <div className="quick-actions">
    <button onClick={shareLocation}>
      <FiMapPin /> Share Location
    </button>
    <button onClick={createTeam}>
      <FiUsers /> Create Team
    </button>
    <button onClick={reportIssue}>
      <FiAlertCircle /> Report Issue
    </button>
  </div>
</header>
```

### Notification Center
```python
class Notification(Base):
    user_id = Column(UUID, ForeignKey("users.id"))
    type = Column(Enum('message', 'announcement', 'issue_update', 'team_invite'))
    title = Column(String)
    content = Column(Text)
    link = Column(String)  # Deep link to relevant page
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime)
```

**UI:**
```typescript
<NotificationBell>
  {notifications.filter(n => !n.is_read).length > 0 && (
    <span className="badge">{unreadCount}</span>
  )}
  
  <NotificationDropdown>
    {notifications.map(notif => (
      <NotificationItem key={notif.id} onClick={() => markAsRead(notif.id)}>
        <div className={notif.is_read ? 'read' : 'unread'}>
          <strong>{notif.title}</strong>
          <p>{notif.content}</p>
          <time>{notif.created_at}</time>
        </div>
      </NotificationItem>
    ))}
  </NotificationDropdown>
</NotificationBell>
```

---

## 📱 PWA Support (Ready for Implementation)

### Manifest
```json
{
  "name": "PlakshaConnect",
  "short_name": "PConnect",
  "description": "Campus networking platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#a3e635",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker
```javascript
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('plakshaconnect-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/profile',
        '/chat',
        '/location',
        // ... other routes
      ]);
    })
  );
});
```

### Push Notifications
```typescript
// Request permission
const permission = await Notification.requestPermission();

if (permission === 'granted') {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY
  });
  
  // Send subscription to backend
  await api.post('/notifications/subscribe', subscription);
}
```

---

## ✅ Summary

| Category | Status | Key Features |
|----------|--------|--------------|
| Profile | ✅ Complete | Picture upload, bio, edit form |
| Location Map | 📋 Planned | Interactive map, buildings, markers |
| Auth Security | 📋 Planned | Rate limiting, magic links, sessions |
| Chat Files | 📋 Planned | File sharing, reactions, threads |
| Announcements | 📋 Planned | Types, attachments, scheduling |
| Issue Tracking | 📋 Planned | Templates, images, lifecycle |
| Teams | 📋 Planned | Auto-match, tasks, kanban |
| Mess Reviews | 📋 Planned | Validation, dashboard, photos |
| Challenges | 📋 Planned | QR codes, geofence, progress |
| Dashboard | 📋 Planned | Personalized, quick actions, notifications |
| PWA | 📋 Planned | Manifest, service worker, push |

---

## 🚀 Priority Order for Next Implementation

1. **Auth Rate Limiting** (Security critical)
2. **Location Map UI** (Core feature improvement)
3. **Chat File Sharing** (High user demand)
4. **Notification Center** (Improves engagement)
5. **Issue Image Upload** (Better issue reporting)
6. **Challenge QR Verification** (Anti-fraud)
7. **Team Auto-Matching** (Useful feature)
8. **Mess Dashboard** (Analytics value)
9. **PWA Support** (Installation)

Each feature can be implemented incrementally without breaking existing functionality!
