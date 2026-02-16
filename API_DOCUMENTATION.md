# Dexi API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response 201:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response 200:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "..."
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-..."
    }
  }
}
```

---

## Card Endpoints

### Upload Card
```http
POST /cards/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- card: (file) Image file

Response 201:
{
  "success": true,
  "message": "Card uploaded successfully. Processing OCR...",
  "data": {
    "card": {
      "_id": "...",
      "userId": "...",
      "imagePath": "uploads/cards/card-123.jpg",
      "status": "pending",
      "createdAt": "..."
    }
  }
}
```

### Get User's Cards
```http
GET /cards?page=1&limit=20&status=processed
Authorization: Bearer <token>

Query Parameters:
- page (optional): Page number, default 1
- limit (optional): Items per page, default 20
- status (optional): pending | processed | failed

Response 200:
{
  "success": true,
  "data": {
    "cards": [...],
    "totalPages": 5,
    "currentPage": 1,
    "totalCards": 100
  }
}
```

### Get Single Card
```http
GET /cards/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "card": { ... },
    "contact": { ... }
  }
}
```

### Delete Card
```http
DELETE /cards/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Card deleted successfully"
}
```

---

## Contact Endpoints

### Get Contacts
```http
GET /contacts?page=1&search=john&company=acme&favorite=true
Authorization: Bearer <token>

Query Parameters:
- page: Page number
- limit: Items per page
- search: Text search
- company: Filter by company
- favorite: Filter favorites (true/false)
- tags: Comma-separated tag IDs

Response 200:
{
  "success": true,
  "data": {
    "contacts": [
      {
        "_id": "...",
        "fullName": "John Doe",
        "designation": "CEO",
        "company": "Acme Corp",
        "email": "john@acme.com",
        "phone": "+1234567890",
        "website": "https://acme.com",
        "address": "123 Main St",
        "tags": [...],
        "isFavorite": false,
        "createdAt": "..."
      }
    ],
    "totalPages": 3,
    "currentPage": 1,
    "totalContacts": 50
  }
}
```

### Get Single Contact
```http
GET /contacts/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "contact": { ... }
  }
}
```

### Update Contact
```http
PUT /contacts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Smith",
  "designation": "CTO",
  "company": "Acme Corp",
  "email": "john.smith@acme.com",
  "phone": "+1234567890",
  "website": "https://acme.com",
  "address": "456 New St",
  "tags": ["tag_id_1", "tag_id_2"],
  "isFavorite": true
}

Response 200:
{
  "success": true,
  "message": "Contact updated successfully",
  "data": {
    "contact": { ... }
  }
}
```

### Delete Contact
```http
DELETE /contacts/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

### Toggle Favorite
```http
PATCH /contacts/:id/favorite
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Contact added to favorites",
  "data": {
    "contact": { ... }
  }
}
```

### Export to CSV
```http
GET /contacts/export/csv
Authorization: Bearer <token>

Response 200:
Content-Type: text/csv
Content-Disposition: attachment; filename=contacts.csv

Full Name,Designation,Company,Email,Phone,...
John Doe,CEO,Acme Corp,john@acme.com,+1234567890,...
```

### Export to vCard
```http
GET /contacts/export/vcard
Authorization: Bearer <token>

Response 200:
Content-Type: text/vcard
Content-Disposition: attachment; filename=contacts.vcf

BEGIN:VCARD
VERSION:3.0
N:Doe;John;;;
FN:John Doe
...
END:VCARD
```

### Get Contact Statistics
```http
GET /contacts/stats
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "totalContacts": 150,
    "favoritesCount": 25,
    "uniqueCompanies": 45
  }
}
```

---

## Tag Endpoints

### Get All Tags
```http
GET /tags
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "tags": [
      {
        "_id": "...",
        "userId": "...",
        "tagName": "Client",
        "color": "#3B82F6",
        "createdAt": "..."
      }
    ]
  }
}
```

### Create Tag
```http
POST /tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "tagName": "Important",
  "color": "#EF4444"
}

Response 201:
{
  "success": true,
  "message": "Tag created successfully",
  "data": {
    "tag": { ... }
  }
}
```

### Update Tag
```http
PUT /tags/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "tagName": "VIP",
  "color": "#10B981"
}

Response 200:
{
  "success": true,
  "message": "Tag updated successfully",
  "data": {
    "tag": { ... }
  }
}
```

### Delete Tag
```http
DELETE /tags/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Tag deleted successfully"
}
```

---

## Dashboard Endpoints

### User Dashboard
```http
GET /dashboard/user
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "stats": {
      "cardsUploaded": 25,
      "totalContacts": 150,
      "favoritesCount": 30
    },
    "recentUploads": [...],
    "recentContacts": [...],
    "dailyActivity": [
      { "_id": "2024-01-15", "count": 5 },
      { "_id": "2024-01-16", "count": 3 }
    ]
  }
}
```

### Admin Dashboard
```http
GET /dashboard/admin
Authorization: Bearer <token>
Role: admin

Response 200:
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 100,
      "totalCards": 500,
      "totalContacts": 1500,
      "activeUsers": 85,
      "inactiveUsers": 15
    },
    "dailyUploads": [...],
    "mostActiveUsers": [...],
    "ocrStats": [
      { "_id": "processed", "count": 450 },
      { "_id": "failed", "count": 50 }
    ]
  }
}
```

---

## Admin Endpoints

All admin endpoints require `admin` role.

### Get All Users
```http
GET /admin/users?page=1&search=john&role=user&isActive=true
Authorization: Bearer <token>
Role: admin

Query Parameters:
- page: Page number
- limit: Items per page
- search: Search by name or email
- role: Filter by role (user/admin)
- isActive: Filter by active status

Response 200:
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "isActive": true,
        "createdAt": "...",
        "cardCount": 10,
        "contactCount": 50
      }
    ],
    "totalPages": 5,
    "currentPage": 1,
    "totalUsers": 100
  }
}
```

### Get User Details
```http
GET /admin/users/:id
Authorization: Bearer <token>
Role: admin

Response 200:
{
  "success": true,
  "data": {
    "user": { ... },
    "stats": {
      "cardCount": 10,
      "contactCount": 50
    },
    "recentCards": [...],
    "recentContacts": [...]
  }
}
```

### Toggle User Status
```http
PATCH /admin/users/:id/toggle-status
Authorization: Bearer <token>
Role: admin

Response 200:
{
  "success": true,
  "message": "User disabled successfully",
  "data": {
    "user": { ... }
  }
}
```

### Change User Role
```http
PATCH /admin/users/:id/role
Authorization: Bearer <token>
Role: admin
Content-Type: application/json

{
  "role": "admin"
}

Response 200:
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "user": { ... }
  }
}
```

### Delete User
```http
DELETE /admin/users/:id
Authorization: Bearer <token>
Role: admin

Response 200:
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Get All Cards (Moderation)
```http
GET /admin/cards?page=1&status=processed&userId=...
Authorization: Bearer <token>
Role: admin

Response 200:
{
  "success": true,
  "data": {
    "cards": [...],
    "totalPages": 10,
    "currentPage": 1,
    "totalCards": 200
  }
}
```

### Delete Card (Admin)
```http
DELETE /admin/cards/:id
Authorization: Bearer <token>
Role: admin

Response 200:
{
  "success": true,
  "message": "Card deleted successfully"
}
```

### Get Activity Logs
```http
GET /admin/logs?page=1&action=card_uploaded&userId=...
Authorization: Bearer <token>
Role: admin

Query Parameters:
- page: Page number
- limit: Items per page (default 50)
- action: Filter by action type
- userId: Filter by user

Response 200:
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "...",
        "userId": { ... },
        "action": "card_uploaded",
        "entityType": "card",
        "entityId": "...",
        "metadata": { ... },
        "ipAddress": "...",
        "timestamp": "..."
      }
    ],
    "totalPages": 20,
    "currentPage": 1,
    "totalLogs": 1000
  }
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Email is required",
    "Password must be at least 6 characters"
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Not authorized to access this route. Please login."
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "User role 'user' is not authorized to access this route"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Server Error"
}
```

---

## Activity Log Actions

Available action types:
- `user_registered`
- `user_login`
- `card_uploaded`
- `card_deleted`
- `contact_created`
- `contact_updated`
- `contact_deleted`
- `ocr_processed`
- `ocr_failed`
- `export_csv`
- `export_vcard`
- `admin_user_disabled`
- `admin_user_enabled`
- `admin_user_deleted`
- `admin_card_deleted`

---

## Rate Limiting

Currently not implemented. Consider adding in production:
- 100 requests per 15 minutes per IP
- 1000 requests per hour per authenticated user
- 10 file uploads per hour per user

---

## File Upload Limits

- Maximum file size: 5MB (configurable via MAX_FILE_SIZE)
- Allowed formats: .jpg, .jpeg, .png, .gif, .webp
- Storage location: `uploads/cards/`

---

## OCR Processing

1. Card image uploaded
2. OCR extraction runs asynchronously
3. Text parsed into structured data
4. Contact created automatically
5. Card status updated (processed/failed)

OCR confidence score available in card record.

---

## Security Notes

1. **JWT Tokens**: Expire after 7 days (configurable)
2. **Password Requirements**: Minimum 6 characters
3. **CORS**: Configured for frontend URL only
4. **Input Sanitization**: All inputs validated
5. **File Validation**: Images only, size limit enforced
