# Dexi - AI Powered Visiting Card Scanner

A production-ready full-stack SaaS application for scanning and managing visiting cards using OCR technology.

## 🏗️ Architecture

### Backend Architecture
- **Clean Architecture** with separation of concerns
- **MVC Pattern**: Controllers, Models, Services, Routes
- **Middleware Layer**: Authentication, Validation, Error Handling
- **Service Layer**: OCR Processing, Activity Logging, Export Services

### Frontend Architecture
- **Component-Based**: Reusable React components
- **Context API**: Global state management
- **Protected Routes**: Role-based access control
- **Responsive Design**: Mobile-first approach

## 🛠️ Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing
- Multer for file uploads
- Tesseract.js for OCR
- express-validator for validation

### Frontend
- React 18 with Vite
- React Router v6
- Tailwind CSS
- Axios for API calls
- Context API for state
- React Hot Toast for notifications
- Lucide React for icons

## 📁 Project Structure

```
dexi-card-scanner/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cardController.js
│   │   ├── contactController.js
│   │   ├── tagController.js
│   │   ├── dashboardController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Card.js
│   │   ├── Contact.js
│   │   ├── Tag.js
│   │   └── ActivityLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── cardRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── tagRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── adminRoutes.js
│   ├── services/
│   │   ├── ocrService.js
│   │   ├── exportService.js
│   │   └── activityLogger.js
│   ├── utils/
│   │   └── seedAdmin.js
│   ├── uploads/ (generated)
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layouts/
    │   │   │   ├── UserLayout.jsx
    │   │   │   └── AdminLayout.jsx
    │   │   └── common/
    │   │       ├── Navbar.jsx
    │   │       ├── Sidebar.jsx
    │   │       ├── Card.jsx
    │   │       └── Modal.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── user/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── UploadCard.jsx
    │   │   │   ├── Contacts.jsx
    │   │   │   ├── ContactDetail.jsx
    │   │   │   └── Tags.jsx
    │   │   └── admin/
    │   │       ├── Dashboard.jsx
    │   │       ├── UserManagement.jsx
    │   │       ├── CardModeration.jsx
    │   │       └── ActivityLogs.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running instance)
- npm or yarn

### 1. Clone and Install

```bash
# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

### 2. Environment Configuration

Create `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/dexi-card-scanner

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads/cards

ADMIN_EMAIL=admin@dexi.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Admin User

FRONTEND_URL=http://localhost:5173
```

### 3. Database Setup

Make sure MongoDB is running, then seed the admin user:

```bash
cd backend
npm run seed
```

### 4. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### 5. Default Login Credentials

**Admin Account:**
- Email: admin@dexi.com
- Password: Admin@123

## 📡 API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- PUT `/api/auth/profile` - Update profile

### Cards
- POST `/api/cards/upload` - Upload card image
- GET `/api/cards` - Get user's cards
- GET `/api/cards/:id` - Get single card
- DELETE `/api/cards/:id` - Delete card
- GET `/api/cards/:id/image` - Get card image

### Contacts
- GET `/api/contacts` - Get all contacts (with filters)
- GET `/api/contacts/:id` - Get single contact
- PUT `/api/contacts/:id` - Update contact
- DELETE `/api/contacts/:id` - Delete contact
- PATCH `/api/contacts/:id/favorite` - Toggle favorite
- GET `/api/contacts/export/csv` - Export to CSV
- GET `/api/contacts/export/vcard` - Export to vCard
- GET `/api/contacts/stats` - Get contact statistics

### Tags
- GET `/api/tags` - Get all tags
- POST `/api/tags` - Create tag
- PUT `/api/tags/:id` - Update tag
- DELETE `/api/tags/:id` - Delete tag

### Dashboard
- GET `/api/dashboard/user` - User dashboard stats
- GET `/api/dashboard/admin` - Admin dashboard stats (admin only)

### Admin
- GET `/api/admin/users` - Get all users
- GET `/api/admin/users/:id` - Get user details
- PATCH `/api/admin/users/:id/toggle-status` - Enable/disable user
- PATCH `/api/admin/users/:id/role` - Change user role
- DELETE `/api/admin/users/:id` - Delete user
- GET `/api/admin/cards` - Get all cards
- DELETE `/api/admin/cards/:id` - Delete card
- GET `/api/admin/logs` - Get activity logs

## 🔐 Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: bcrypt with salt rounds
3. **Role-Based Access**: Admin and user roles with middleware protection
4. **Input Validation**: express-validator for request validation
5. **Error Handling**: Centralized error handling middleware
6. **CORS Configuration**: Restricted cross-origin requests

## 🎯 Features

### User Panel
✅ User registration and login
✅ Upload visiting card images
✅ Automatic OCR text extraction
✅ Parsed structured contact information
✅ Contact management (CRUD operations)
✅ Search and filter contacts
✅ Tag system for categorization
✅ Mark contacts as favorites
✅ Export contacts (CSV & vCard)
✅ User dashboard with statistics

### Admin Panel
✅ Admin dashboard with analytics
✅ User management
✅ Enable/disable users
✅ Change user roles
✅ Card moderation
✅ View all uploaded cards
✅ Delete inappropriate content
✅ Activity logs
✅ System monitoring

## 📊 Database Schemas

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  isActive: Boolean,
  createdAt: Date
}
```

### Card Schema
```javascript
{
  userId: ObjectId,
  imagePath: String,
  ocrText: String,
  status: String (pending/processed/failed),
  errorMessage: String,
  createdAt: Date
}
```

### Contact Schema
```javascript
{
  userId: ObjectId,
  cardId: ObjectId,
  fullName: String,
  designation: String,
  company: String,
  email: String,
  phone: String,
  website: String,
  address: String,
  tags: [ObjectId],
  isFavorite: Boolean,
  createdAt: Date
}
```

### Tag Schema
```javascript
{
  userId: ObjectId,
  tagName: String,
  color: String,
  createdAt: Date
}
```

### ActivityLog Schema
```javascript
{
  userId: ObjectId,
  action: String,
  entityType: String,
  entityId: ObjectId,
  metadata: Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

## 🔄 Workflow

1. **User Registration**: User signs up with email and password
2. **Card Upload**: User uploads visiting card image
3. **OCR Processing**: Tesseract.js extracts text from image
4. **Data Parsing**: Service parses OCR text into structured data
5. **Contact Creation**: Parsed data saved as contact
6. **Management**: User can edit, delete, tag, and favorite contacts
7. **Export**: User can export contacts to CSV or vCard format

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] User registration
- [ ] User login
- [ ] Token persistence
- [ ] Protected route access

**Card Upload:**
- [ ] Image upload validation
- [ ] OCR processing
- [ ] Contact creation
- [ ] Error handling

**Contact Management:**
- [ ] View contacts list
- [ ] Search functionality
- [ ] Filter by company
- [ ] Edit contact
- [ ] Delete contact
- [ ] Toggle favorite

**Admin Features:**
- [ ] View all users
- [ ] Disable user
- [ ] Delete user
- [ ] View all cards
- [ ] Delete card
- [ ] View activity logs

## 🐛 Common Issues & Solutions

### Backend Issues

**MongoDB Connection Error:**
```bash
# Make sure MongoDB is running
# Windows: net start MongoDB
# macOS/Linux: brew services start mongodb-community
# or: sudo systemctl start mongod
```

**Port Already in Use:**
```bash
# Change PORT in .env file
# Or kill the process using port 5000
```

**Upload Directory Error:**
```bash
# Manually create uploads directory
mkdir -p uploads/cards
```

### Frontend Issues

**Module Not Found:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API Connection Error:**
- Check if backend is running
- Verify VITE_API_URL in frontend (if set)
- Check CORS configuration

## 📝 Development Notes

### Adding New Features

1. **Backend**: Create controller → Add route → Update model if needed
2. **Frontend**: Create component → Add route → Connect to API
3. **Testing**: Test all CRUD operations and edge cases

### Code Organization

- Keep controllers thin, move business logic to services
- Use middleware for reusable functionality
- Follow React best practices for components
- Use proper error handling everywhere

### Performance Optimization

- Add indexes on frequently queried fields
- Implement pagination for large datasets
- Lazy load images and components
- Cache frequently accessed data

## 🚢 Production Deployment

### Environment Variables

Update production environment variables:
- Use strong JWT_SECRET
- Set NODE_ENV=production
- Use production MongoDB URI
- Configure proper CORS origins

### Security Checklist

- [ ] Change default admin credentials
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Add input sanitization
- [ ] Enable CSRF protection
- [ ] Set security headers

### Hosting Recommendations

**Backend:**
- Heroku, Railway, Render
- AWS EC2, DigitalOcean
- Vercel, Netlify Functions

**Frontend:**
- Vercel, Netlify
- AWS S3 + CloudFront
- GitHub Pages

**Database:**
- MongoDB Atlas
- AWS DocumentDB

## 📄 License

MIT License - feel free to use this project for learning and commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@dexi.com

---

Built with ❤️ using React, Node.js, and MongoDB
