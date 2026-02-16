# Dexi - Architecture Decisions & Design Patterns

This document explains the architectural choices and design patterns used in building Dexi.

## 🏗️ Overall Architecture

### Architecture Style: Monolithic with Clear Separation
**Decision:** Separate backend and frontend, but deployable independently  
**Rationale:**
- Clear separation of concerns
- Independent scaling possible
- Easier to maintain and debug
- Can evolve to microservices if needed

### Communication: REST API
**Decision:** RESTful API with JSON  
**Rationale:**
- Simple and well-understood
- Excellent tooling support
- Easy to test and document
- Works well with React

## 🔙 Backend Architecture

### Pattern: MVC (Model-View-Controller) + Service Layer

```
Request → Route → Middleware → Controller → Service → Model → Database
                                    ↓
                                Response
```

**Why MVC + Services?**
- **Models**: Data structure and validation
- **Controllers**: HTTP request/response handling
- **Services**: Business logic (OCR, export, logging)
- **Separation**: Each layer has single responsibility

### File Organization

```
backend/
├── models/          # Data schemas (what data looks like)
├── controllers/     # Request handlers (HTTP layer)
├── services/        # Business logic (core functionality)
├── middleware/      # Cross-cutting concerns (auth, errors)
├── routes/          # API endpoint definitions
├── config/          # Configuration (database, etc.)
└── utils/           # Helper functions
```

**Rationale:**
- **Scalability**: Easy to find and modify code
- **Testability**: Each layer can be tested independently
- **Maintainability**: Clear responsibility boundaries

### Key Design Patterns

#### 1. Middleware Pattern
```javascript
app.use(cors());
app.use(express.json());
app.use('/api/cards', protect, cardRoutes);
```

**Benefits:**
- Reusable authentication logic
- Centralized error handling
- Request/response transformation
- Logging and monitoring

#### 2. Factory Pattern (JWT Token Generation)
```javascript
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};
```

**Benefits:**
- Consistent token creation
- Easy to modify token structure
- Single source of truth

#### 3. Repository Pattern (Mongoose Models)
```javascript
const user = await User.findById(id);
await user.save();
```

**Benefits:**
- Abstraction over database operations
- Easy to switch databases if needed
- Consistent data access

#### 4. Service Pattern (Business Logic)
```javascript
// OCR Service
class OCRService {
  async extractText(imagePath) { ... }
  parseContactInfo(ocrText) { ... }
}
```

**Benefits:**
- Separates business logic from HTTP
- Reusable across different controllers
- Easier to test

### Authentication Strategy

**JWT (JSON Web Tokens)**

**Flow:**
1. User logs in with credentials
2. Server verifies and issues JWT
3. Client stores token
4. Token sent with each request
5. Server verifies token

**Why JWT?**
- Stateless (no server session storage)
- Scalable (can distribute across servers)
- Self-contained (includes user data)
- Standard and well-supported

**Security Measures:**
- Password hashing with bcrypt (10 salt rounds)
- Token expiration (7 days)
- Secure HTTP-only cookies possible
- Role-based middleware protection

### Database Design

**MongoDB with Mongoose**

**Why MongoDB?**
- Flexible schema for contact data
- JSON-like documents match JavaScript
- Easy to iterate during development
- Good for unstructured OCR data

**Schema Strategies:**

1. **Normalization**: Separate collections
   - Users, Cards, Contacts, Tags, ActivityLogs
   - Reduces data duplication
   - Clear relationships

2. **Indexing**: Performance optimization
   ```javascript
   cardSchema.index({ userId: 1, createdAt: -1 });
   contactSchema.index({ fullName: 'text', company: 'text' });
   ```
   - Faster queries
   - Efficient searches
   - Better sorting performance

3. **Referencing vs Embedding**:
   - Tags: Referenced (many-to-many)
   - User data: Referenced (one-to-many)
   - OCR text: Embedded in card

### File Upload Strategy

**Multer Middleware**

```javascript
const storage = multer.diskStorage({
  destination: 'uploads/cards',
  filename: (req, file, cb) => {
    cb(null, 'card-' + Date.now() + path.extname(file.originalname));
  }
});
```

**Why Disk Storage?**
- Simple for development
- Easy to debug
- Can switch to S3/cloud later
- Keeps files local

**Validation:**
- File type checking (images only)
- Size limits (5MB default)
- Sanitized filenames
- Directory permissions

### OCR Processing Strategy

**Asynchronous Processing**

```javascript
// Upload returns immediately
res.status(201).json({ message: "Processing..." });

// OCR runs in background
processCardOCR(cardId, imagePath);
```

**Why Async?**
- Don't block HTTP response
- Better user experience
- Handle long-running tasks
- Scalable to job queues

**Error Handling:**
- Try-catch wrapping
- Error status in database
- Logging failures
- User notification

### Activity Logging

**Strategy**: Write to database, don't fail on log errors

```javascript
try {
  await ActivityLog.create(logData);
} catch (error) {
  console.error('Logging failed:', error);
  // Don't throw - logging shouldn't break main flow
}
```

**Benefits:**
- Audit trail
- Security monitoring
- User analytics
- Debugging aid

## 🎨 Frontend Architecture

### Pattern: Component-Based Architecture

```
App
├── AuthProvider (Context)
├── Router
│   ├── Public Routes (Login, Register)
│   └── Protected Routes
│       ├── UserLayout
│       │   └── User Pages
│       └── AdminLayout
│           └── Admin Pages
```

### State Management: Context API

**Decision:** React Context API instead of Redux  
**Rationale:**
- Simpler for authentication state
- Less boilerplate
- Sufficient for current needs
- Can upgrade to Redux if needed

```javascript
<AuthProvider>
  {children}
</AuthProvider>
```

**What's in Context:**
- User data
- Authentication status
- Login/logout functions
- Loading states

### Routing Strategy

**React Router v6**

```javascript
<Route path="/dashboard" element={
  <ProtectedRoute>
    <UserLayout>
      <Dashboard />
    </UserLayout>
  </ProtectedRoute>
} />
```

**Why Nested Routes?**
- Layout wrapping
- Protected route logic
- Code organization
- Better UX transitions

### API Communication

**Axios with Interceptors**

```javascript
// Request interceptor: Add token
api.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: Handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Auto logout on 401
    }
  }
);
```

**Benefits:**
- Centralized token management
- Global error handling
- Request/response transformation
- Loading states

### UI/UX Patterns

#### 1. Loading States
```javascript
const [loading, setLoading] = useState(false);
if (loading) return <Spinner />;
```

#### 2. Error Handling
```javascript
try {
  await api.post('/cards/upload', formData);
  toast.success('Uploaded!');
} catch (error) {
  toast.error(error.response?.data?.message);
}
```

#### 3. Optimistic Updates
- Show success immediately
- Update UI before server confirms
- Roll back on error

#### 4. Pagination
- Load data in chunks
- Better performance
- Reduced server load

### CSS Architecture

**Tailwind CSS + Utility-First**

**Why Tailwind?**
- Rapid development
- Consistent design
- No CSS files to manage
- Responsive utilities built-in

**Custom Components:**
```css
.btn { @apply px-4 py-2 rounded-lg ... }
.card { @apply bg-white rounded-lg shadow ... }
```

**Benefits:**
- Reusable styles
- Design system consistency
- Easy customization

## 🔐 Security Architecture

### Defense in Depth

**Layer 1: Input Validation**
- express-validator on backend
- HTML5 validation on frontend
- Type checking
- Sanitization

**Layer 2: Authentication**
- JWT tokens
- Secure password hashing
- Token expiration
- HTTP-only cookies possible

**Layer 3: Authorization**
- Role-based middleware
- Resource ownership checks
- Admin-only routes

**Layer 4: Data Protection**
- No sensitive data in logs
- Password never returned in API
- File upload restrictions

### CORS Configuration

```javascript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
})
```

**Why Specific Origin?**
- Prevent unauthorized access
- Security best practice
- CSRF protection

## 📊 Data Flow Examples

### Card Upload Flow

```
1. User selects image
   └─> FormData created in React

2. POST /api/cards/upload
   └─> Multer middleware
       └─> File saved to disk
           └─> Card document created (status: pending)
               └─> Response sent immediately

3. Background: OCR Processing
   └─> Tesseract.js extracts text
       └─> Text parsed into fields
           └─> Contact document created
               └─> Card status updated (processed/failed)

4. User polls or receives update
   └─> Sees new contact in list
```

### Authentication Flow

```
1. User submits login form
   └─> POST /api/auth/login

2. Server validates credentials
   └─> bcrypt.compare(password, hashedPassword)
       └─> Generate JWT token
           └─> Return user + token

3. Frontend stores token
   └─> localStorage.setItem('token', token)
       └─> Set in Axios headers
           └─> Update AuthContext

4. Subsequent requests
   └─> Token in Authorization header
       └─> Middleware verifies
           └─> Request continues
```

## 🎯 Design Principles Applied

### 1. Single Responsibility Principle
- Each controller handles one resource
- Each service has one purpose
- Components have single concerns

### 2. Don't Repeat Yourself (DRY)
- Reusable middleware
- Shared components
- Service functions
- Utility helpers

### 3. Separation of Concerns
- Backend vs Frontend
- Controllers vs Services
- Business logic vs Presentation
- Data vs UI

### 4. KISS (Keep It Simple, Stupid)
- No over-engineering
- Clear naming
- Straightforward logic
- Minimal dependencies

### 5. YAGNI (You Aren't Gonna Need It)
- No speculative features
- Build what's needed now
- Easy to extend later

## 🚀 Scalability Considerations

### Current Scale: Single Server
Good for: 1,000-10,000 users

### Next Steps for Growth:

**10K-100K Users:**
1. Add Redis for caching
2. Separate file storage (S3)
3. Load balancer
4. Database indexing optimization

**100K-1M Users:**
1. Microservices separation
2. Message queue (RabbitMQ/Redis)
3. CDN for static assets
4. Database replication

**Modular Design Enables:**
- Easy service extraction
- Independent scaling
- Technology swapping
- Feature addition

## 📝 Trade-offs & Limitations

### Current Limitations

1. **OCR Accuracy**
   - Depends on image quality
   - May need manual corrections
   - *Future:* AI/ML improvements

2. **File Storage**
   - Local disk only
   - *Future:* Cloud storage (S3)

3. **Real-time Updates**
   - Polling required
   - *Future:* WebSockets

4. **Search**
   - Basic text search
   - *Future:* Elasticsearch

5. **Rate Limiting**
   - Not implemented
   - *Future:* Express rate limiter

### Intentional Trade-offs

| Decision | Pro | Con | Future |
|----------|-----|-----|--------|
| MongoDB | Flexible schema | No ACID transactions | Add Redis |
| JWT | Stateless | Can't revoke easily | Add blacklist |
| Disk storage | Simple | Not scalable | Move to S3 |
| Async OCR | Non-blocking | No real-time update | Add WebSockets |

## 🔄 Extensibility Points

Easy to add:
- ✅ New API endpoints
- ✅ New UI pages
- ✅ Additional user roles
- ✅ More export formats
- ✅ OCR language support
- ✅ Bulk operations
- ✅ Email notifications
- ✅ Team collaboration

## 📚 Technology Choices Summary

| Component | Choice | Why |
|-----------|--------|-----|
| Backend Framework | Express.js | Mature, flexible, fast |
| Database | MongoDB | Flexible schema, JSON-like |
| ODM | Mongoose | Schema validation, middleware |
| Auth | JWT | Stateless, scalable |
| Password | bcrypt | Industry standard, secure |
| File Upload | Multer | Simple, reliable |
| OCR | Tesseract.js | Open source, good accuracy |
| Frontend Framework | React | Component-based, popular |
| Build Tool | Vite | Fast, modern, simple |
| Styling | Tailwind CSS | Utility-first, rapid dev |
| Routing | React Router | Standard, powerful |
| HTTP Client | Axios | Interceptors, easy to use |
| State | Context API | Simple, sufficient |
| Validation | express-validator | Comprehensive, chainable |

## 🎓 Learning & Best Practices

### Code Organization Wins
1. Feature-based folders
2. Clear naming conventions
3. Consistent error handling
4. Comprehensive logging

### Development Wins
1. Hot reloading (Vite + Nodemon)
2. Environment variables
3. Seed scripts
4. Clear documentation

### Production Wins
1. Error recovery
2. Activity logging
3. Input validation
4. Security middleware

---

This architecture is designed to be:
- **Simple** to understand and modify
- **Scalable** to grow with your needs
- **Secure** from the ground up
- **Maintainable** with clear patterns
- **Extensible** for future features

The foundation is solid, the patterns are clear, and the code is production-ready! 🚀
