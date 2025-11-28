# Location Map Feature - Implementation Guide

## Overview

The interactive campus map displays real-time locations of students and campus buildings with profile picture markers and automatic building assignment.

## Backend Implementation

### 1. Database Schema

**Buildings Table** (migrations/versions/002_buildings.py)
- Stores all campus buildings with coordinates
- BuildingType enum: academic, hostel, dining, sports, administrative, recreational, library, other
- Fields: name, code, type, latitude, longitude, description, floor_count, capacity

**Location Model Updates**
- Added building_id foreign key (nullable, SET NULL on delete)
- Relationship to Building model
- Auto-assigned when user location is within 200m of a building

### 2. Distance Calculations

**Haversine Formula** (app/services/building_service.py)
- Calculates great circle distance between two coordinates
- Returns distance in meters
- Used for nearest building detection

**Functions:**
```python
find_nearest_building(db, lat, lng) -> (Building, distance)
get_buildings_in_radius(db, lat, lng, radius) -> [(Building, distance), ...]
auto_assign_building_to_location(db, location_id, max_distance=200)
```

### 3. API Endpoints

**Buildings:**
```
GET    /api/buildings/                          - List all buildings
POST   /api/buildings/                          - Create building (admin)
GET    /api/buildings/{id}                      - Get building by ID
PUT    /api/buildings/{id}                      - Update building (admin)
DELETE /api/buildings/{id}                      - Delete building (admin)
GET    /api/buildings/nearest/{lat}/{lng}       - Find nearest building
GET    /api/buildings/radius/{lat}/{lng}?radius - Get buildings in radius
```

**Location Map:**
```
GET    /api/locations/all?radius=10000&limit=100 - Get all active locations with user data
```

Response includes:
- Location coordinates
- User info (id, full_name, email, profile_picture)
- Building info (if assigned)

### 4. Seeding Campus Data

**Script:** backend/scripts/seed_buildings.py

Run after migrations:
```bash
cd backend
source venv/bin/activate
python -m scripts.seed_buildings
```

**Default Buildings:**
- 2 Academic Blocks (AC1, AC2)
- 4 Hostels (BH1, BH2, GH1, GH2)
- 2 Dining (MESS, CAF)
- 1 Library (LIB)
- 2 Sports (SPORT, GYM)
- 1 Admin (ADMIN)
- 2 Recreational (SAC, AUD)

**Coordinates:** Example coordinates provided (30.35xx, 76.37xx) - Replace with actual campus coordinates.

## Frontend Implementation

### 1. Map Component

**Component:** frontend/components/CampusMap.tsx

**Features:**
- Interactive Leaflet map with OpenStreetMap tiles
- Custom markers for buildings (emoji icons)
- Custom markers for users (profile pictures)
- Info popups on marker click
- Legend showing marker types
- Auto-refresh every 10 seconds
- Statistics panel (building count, active users)

**Building Marker Icons:**
```
Academic: 🏫
Hostel: 🏠
Dining: 🍽️
Sports: ⚽
Admin: 🏢
Recreational: 🎭
Library: 📚
Other: 📍
```

**User Markers:**
- Circular profile picture
- Blue border (3px)
- White background
- 40x40 pixels
- Fallback to UI Avatars if no profile picture

### 2. Page Integration

**Route:** /location/map

**File:** frontend/app/location/map/page.tsx

**Dynamic Loading:**
- Uses Next.js dynamic import with ssr: false
- Prevents SSR issues with Leaflet
- Loading spinner while map initializes

### 3. Styling

**CSS:** frontend/app/globals.css

```css
.leaflet-container { height: 100%; width: 100%; z-index: 1; }
.custom-div-icon { background: transparent; border: none; }
.custom-user-icon { background: transparent; border: none; }
```

## Setup Instructions

### 1. Install Dependencies

**Backend:**
```bash
cd backend
# Already included in requirements.txt:
# - SQLAlchemy (ORM)
# - Alembic (migrations)
# - FastAPI (API)
```

**Frontend:**
```bash
cd frontend
npm install react-leaflet leaflet @types/leaflet --legacy-peer-deps
```

### 2. Run Migrations

```bash
cd backend
source venv/bin/activate
python -m alembic upgrade head
```

This will:
- Create buildings table (002_buildings)
- Add building_id to locations table
- Create BuildingType enum

### 3. Seed Buildings

```bash
cd backend
source venv/bin/activate
python -m scripts.seed_buildings
```

Output:
```
Seeding campus buildings...
Successfully seeded 14 buildings!
  academic: 2
  hostel: 4
  dining: 2
  sports: 2
  administrative: 1
  recreational: 2
  library: 1
```

### 4. Update Coordinates

**Edit:** backend/scripts/seed_buildings.py

Replace example coordinates with actual campus building coordinates:
```python
{
    "name": "Academic Block 1",
    "code": "AC1",
    "building_type": BuildingType.ACADEMIC,
    "latitude": 30.3533,  # <- Replace with actual
    "longitude": 76.3737,  # <- Replace with actual
    ...
}
```

### 5. Test API Endpoints

**Get all buildings:**
```bash
curl http://localhost:8000/api/buildings/
```

**Find nearest building:**
```bash
curl "http://localhost:8000/api/buildings/nearest/30.3535/76.3740"
```

**Get active locations:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/locations/all?limit=50"
```

### 6. Access Map

Navigate to: http://localhost:3000/location/map

## Features

### Auto Building Assignment

When a user shares their location:
1. System calculates distance to all buildings
2. Finds nearest building
3. If within 200 meters, assigns building_id to location
4. Building info included in location responses

**Algorithm:**
```python
# Haversine distance calculation
# If distance <= 200m: assign building_id
# Else: building_id remains NULL
```

### Real-time Updates

**Current Implementation:**
- Polls /api/locations/all every 10 seconds
- Refreshes user markers on map
- Updates active user count

**Future Enhancement (WebSocket):**
```javascript
const ws = new WebSocket('ws://localhost:8000/api/locations/ws');
ws.onmessage = (event) => {
  const location = JSON.parse(event.data);
  // Update marker position in real-time
};
```

### Map Controls

**Info Panel (Top Left):**
- Building count
- Active user count
- Refresh button

**Legend (Top Right):**
- Building type icons
- User marker example

**Interactions:**
- Zoom: Mouse wheel or +/- buttons
- Pan: Click and drag
- Marker click: Show info popup
- Double click: Zoom in

## Customization

### Change Map Tiles

Edit CampusMap.tsx:
```tsx
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  // Change to:
  // Satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  // Dark: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
/>
```

### Adjust Building Detection Radius

Edit building_service.py:
```python
auto_assign_building_to_location(db, location_id, max_distance_meters=200)
# Change max_distance_meters to desired value
```

### Change User Marker Style

Edit CampusMap.tsx userIcon function:
```tsx
border: 3px solid #3b82f6;  // Change border color
width: 40px; height: 40px;   // Change size
border-radius: 50%;          // Change shape (square: 0%)
```

### Modify Refresh Rate

Edit CampusMap.tsx setupWebSocket:
```tsx
const interval = setInterval(() => {
  loadUserLocations();
}, 10000);  // Change from 10s to desired interval
```

## Testing

### 1. Create Test Locations

```bash
curl -X POST http://localhost:8000/api/locations/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 30.3533,
    "longitude": 76.3737,
    "visibility": "public"
  }'
```

### 2. Verify Building Assignment

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/locations/me
```

Response should include:
```json
{
  "building_id": "uuid",
  "building": {
    "name": "Academic Block 1",
    "code": "AC1",
    ...
  }
}
```

### 3. Check Map Display

1. Open http://localhost:3000/location/map
2. Verify buildings appear with emoji markers
3. Share your location
4. Verify your profile picture appears on map
5. Click markers to see info popups

## Troubleshooting

### Map Not Loading

**Issue:** Blank screen or "Loading map..." stuck

**Solutions:**
1. Check browser console for errors
2. Verify Leaflet CSS is loaded (view page source)
3. Check API_URL in .env.local
4. Try hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Buildings Not Showing

**Issue:** No building markers on map

**Solutions:**
1. Verify buildings exist:
   ```bash
   curl http://localhost:8000/api/buildings/
   ```
2. Check coordinates are within map bounds
3. Verify BuildingType enum matches frontend icons

### User Markers Missing

**Issue:** Profile pictures not displaying

**Solutions:**
1. Check CORS settings (allow API URL)
2. Verify profile pictures exist in uploads/
3. Check network tab for 404 errors
4. Verify API returns profile_picture field

### Building Not Auto-Assigned

**Issue:** location.building_id is null despite being near building

**Solutions:**
1. Check distance calculation:
   ```bash
   curl "http://localhost:8000/api/buildings/nearest/LAT/LNG"
   ```
2. Verify distance < 200m
3. Check buildings table has correct coordinates
4. Manually trigger assignment:
   ```python
   from app.services.building_service import auto_assign_building_to_location
   auto_assign_building_to_location(db, location_id, max_distance_meters=500)
   ```

### Performance Issues

**Issue:** Map slow with many users

**Solutions:**
1. Reduce refresh rate (increase interval to 30s)
2. Add pagination to /api/locations/all
3. Implement clustering for markers:
   ```bash
   npm install react-leaflet-cluster
   ```
4. Use WebSocket instead of polling

## Next Steps

### Recommended Enhancements

1. **WebSocket Location Broadcasting**
   - Real-time position updates
   - No polling overhead
   - Instant marker movement

2. **User Filtering**
   - Filter by year/branch
   - Show only friends
   - Search users on map

3. **Geofencing Alerts**
   - Notify when friends nearby
   - Alerts when entering/leaving buildings
   - Study group location tracking

4. **Heatmap View**
   - Show popular areas
   - Peak hours visualization
   - Building occupancy estimates

5. **Route Planning**
   - Walking directions between buildings
   - Estimated walk time
   - Campus shortcuts

6. **Offline Support**
   - Cache building data
   - Offline map tiles
   - PWA support

## API Reference

### Building Endpoints

**List Buildings**
```http
GET /api/buildings/
Response: [BuildingResponse]
```

**Create Building**
```http
POST /api/buildings/
Authorization: Bearer TOKEN
Body: BuildingCreate
Response: BuildingResponse
```

**Get Nearest Building**
```http
GET /api/buildings/nearest/{lat}/{lng}
Response: BuildingWithDistance
```

**Buildings in Radius**
```http
GET /api/buildings/radius/{lat}/{lng}?radius=500
Response: [BuildingWithDistance]
```

### Location Endpoints

**Get All Active Locations**
```http
GET /api/locations/all?radius=10000&limit=100
Response: [LocationWithUser]
```

**Share Location**
```http
POST /api/locations/
Authorization: Bearer TOKEN
Body: LocationCreate
Response: LocationResponse
```

### Response Schemas

**LocationWithUser:**
```typescript
{
  id: UUID;
  user_id: UUID;
  building_id: UUID | null;
  latitude: number;
  longitude: number;
  address: string | null;
  visibility: string;
  is_active: boolean;
  user: {
    id: UUID;
    full_name: string;
    email: string;
    profile_picture: string | null;
  };
  building: BuildingResponse | null;
}
```

**BuildingResponse:**
```typescript
{
  id: UUID;
  name: string;
  code: string;
  building_type: string;
  latitude: number;
  longitude: number;
  description: string;
  floor_count: string;
  capacity: string;
  created_at: string;
  updated_at: string;
}
```

## Files Modified/Created

**Backend:**
- app/models/building.py (new)
- app/models/location.py (modified - added building_id)
- app/models/__init__.py (modified - import Building)
- app/schemas/building.py (new)
- app/schemas/location.py (modified - added LocationWithUser)
- app/services/building_service.py (new)
- app/routers/building.py (new)
- app/routers/location.py (modified - added /all endpoint)
- app/main.py (modified - added building router)
- migrations/versions/002_buildings.py (new)
- scripts/seed_buildings.py (new)

**Frontend:**
- components/CampusMap.tsx (new)
- app/location/map/page.tsx (new)
- app/globals.css (modified - added Leaflet styles)
- package.json (modified - added react-leaflet, leaflet)

**Total:**
- 8 new files
- 5 modified files
- ~1200 lines of code

## Support

For issues or questions:
1. Check backend logs: Look for errors in terminal running uvicorn
2. Check frontend console: Open browser DevTools
3. Verify API responses: Use curl or Postman to test endpoints
4. Check database: Query buildings and locations tables

Happy mapping!
