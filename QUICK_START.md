# Dexi - Quick Start Guide

## 🎯 What You Have

A complete, production-ready full-stack SaaS application with:

### Backend (Node.js + Express + MongoDB)
- ✅ Complete REST API with 40+ endpoints
- ✅ JWT authentication with role-based access
- ✅ OCR integration using Tesseract.js
- ✅ File upload handling with Multer
- ✅ Activity logging system
- ✅ Export functionality (CSV & vCard)
- ✅ Clean architecture with MVC pattern

### Frontend (React + Vite + Tailwind)
- ✅ User authentication (login/register)
- ✅ User dashboard with analytics
- ✅ Card upload and management
- ✅ Contact management (CRUD)
- ✅ Search and filter functionality
- ✅ Admin panel with full controls
- ✅ Responsive, modern UI

## 📂 Project Structure

```
dexi-card-scanner/
├── backend/                    # Node.js Backend
│   ├── config/                 # Database configuration
│   ├── controllers/            # Request handlers (6 controllers)
│   ├── middleware/             # Auth, validation, error handling
│   ├── models/                 # MongoDB schemas (5 models)
│   ├── routes/                 # API routes (6 route files)
│   ├── services/               # Business logic (OCR, export, logging)
│   ├── utils/                  # Utilities (admin seeder)
│   ├── .env.example            # Environment template
│   ├── package.json            # Dependencies
│   └── server.js               # Express server
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── layouts/        # UserLayout, AdminLayout
│   │   ├── context/            # AuthContext for state
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── user/           # User dashboard pages
│   │   │   └── admin/          # Admin panel pages
│   │   ├── services/           # API client (Axios)
│   │   ├── App.jsx             # Main app with routing
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Tailwind styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── README.md                   # Full documentation
├── API_DOCUMENTATION.md        # Complete API reference
└── QUICK_START.md             # This file
```

## 🚀 Installation (5 Minutes)

### Step 1: Prerequisites
Make sure you have installed:
- Node.js v16+ ([download](https://nodejs.org/))
- MongoDB ([download](https://www.mongodb.com/try/download/community))
- npm (comes with Node.js)

### Step 2: Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 3: Configure Environment

```bash
# In backend directory
cp .env.example .env

# Edit .env file with your settings
# At minimum, set:
# - MONGODB_URI (if not using default)
# - JWT_SECRET (change to a random string)
```

### Step 4: Database Setup

```bash
# Make sure MongoDB is running
# Then seed the admin user:
cd backend
npm run seed
```

This creates the default admin account:
- Email: `admin@dexi.com`
- Password: `Admin@123`

### Step 5: Run the Application

Open TWO terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

## 🎉 You're Ready!

Open http://localhost:5173 in your browser.

### First Steps:
1. **Login as admin**: admin@dexi.com / Admin@123
2. **Or create a user account**: Click "Sign up"
3. **Upload a card**: Go to "Upload Card" and select an image
4. **Wait for OCR**: Processing takes 5-15 seconds
5. **View contacts**: Check the extracted contact information
6. **Explore features**: Edit, tag, favorite, export contacts

## 🔑 Default Credentials

**Admin Account:**
- Email: `admin@dexi.com`
- Password: `Admin@123`

⚠️ **Change this password immediately after first login!**

## 📱 Features Overview

### User Panel
1. **Dashboard** - View statistics and recent uploads
2. **Upload Card** - Upload visiting card images
3. **Contacts** - Manage extracted contacts
   - Search and filter
   - Edit contact details
   - Add tags
   - Mark as favorite
   - Delete contacts
   - Export to CSV/vCard
4. **Tags** - Create and manage tags for organization

### Admin Panel
1. **Dashboard** - System-wide analytics
   - Total users, cards, contacts
   - Daily upload activity
   - Most active users
   - OCR success rate
2. **User Management**
   - View all users
   - Search users
   - Enable/disable accounts
   - Change user roles
   - Delete users
3. **Card Moderation**
   - View all uploaded cards
   - Review OCR results
   - Delete inappropriate content
4. **Activity Logs**
   - Monitor all system activities
   - Filter by action type or user
   - Track security events

## 🛠️ Development

### File Structure Explained

**Backend:**
- `models/` - MongoDB schemas with Mongoose
- `controllers/` - Handle HTTP requests, call services
- `services/` - Business logic (OCR, export, logging)
- `middleware/` - Authentication, validation, error handling
- `routes/` - API endpoint definitions

**Frontend:**
- `context/` - Global state management (Auth)
- `pages/` - React components for each route
- `components/` - Reusable UI components
- `services/` - API client with Axios

### Adding Features

**New API Endpoint:**
1. Create controller method in `backend/controllers/`
2. Add route in `backend/routes/`
3. Update frontend API calls in `frontend/src/`

**New Page:**
1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.jsx`
3. Add navigation link in layout

## 📝 Common Tasks

### Change Admin Password
```javascript
// In MongoDB or through API:
// Update user with email admin@dexi.com
```

### Add More Admin Users
```javascript
// Method 1: Through admin panel (change user role to admin)
// Method 2: Edit utils/seedAdmin.js and run npm run seed
```

### Customize Upload Limits
```env
# In backend/.env
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

### Customize OCR Settings
Edit `backend/services/ocrService.js`:
- Language: Change 'eng' to other language code
- Confidence threshold
- Parsing logic

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongod` or `brew services start mongodb-community`
- Check port 5000 is free: `lsof -i :5000`
- Verify .env file exists and is configured

### Frontend won't start
- Clear node_modules: `rm -rf node_modules && npm install`
- Check port 5173 is free
- Verify backend is running

### OCR not working
- Check Tesseract.js installation: `npm ls tesseract.js`
- Verify image file format (should be .jpg, .png, .gif, .webp)
- Check backend logs for OCR errors

### MongoDB connection failed
- Verify MongoDB is running
- Check MONGODB_URI in .env
- Try default: `mongodb://localhost:27017/dexi-card-scanner`

### "Token invalid" errors
- Clear localStorage in browser
- Re-login to get fresh token
- Check JWT_SECRET is set in .env

## 📊 Testing the Application

### Manual Testing Checklist

**Authentication:**
- [  ] Register new user
- [ ] Login with credentials
- [ ] Access protected routes
- [ ] Logout

**Card Upload:**
- [ ] Upload an image
- [ ] Wait for OCR processing
- [ ] Verify contact created
- [ ] Check extracted data accuracy

**Contact Management:**
- [ ] View contacts list
- [ ] Search contacts
- [ ] Edit contact details
- [ ] Add/remove tags
- [ ] Toggle favorite
- [ ] Delete contact

**Export:**
- [ ] Export to CSV
- [ ] Export to vCard
- [ ] Verify file downloads

**Admin Features:**
- [ ] View admin dashboard
- [ ] Manage users
- [ ] View all cards
- [ ] Check activity logs
- [ ] Disable/enable users

## 🚢 Production Deployment

### Environment Variables
Update for production:
```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
MONGODB_URI=<production-mongodb-uri>
FRONTEND_URL=<your-frontend-domain>
```

### Security Checklist
- [ ] Change default admin password
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Set secure CORS origins
- [ ] Add rate limiting
- [ ] Enable input sanitization
- [ ] Set security headers
- [ ] Use environment variables for secrets

### Recommended Hosting

**Backend:**
- Railway.app (easiest)
- Heroku
- Render.com
- AWS EC2
- DigitalOcean

**Frontend:**
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront

**Database:**
- MongoDB Atlas (recommended)
- AWS DocumentDB

## 📚 Further Documentation

- `README.md` - Complete project documentation
- `API_DOCUMENTATION.md` - Full API reference
- Backend code comments - Inline documentation
- Frontend component comments - Props and usage

## 🤝 Need Help?

**Common Issues:**
1. Check MongoDB is running
2. Verify all dependencies installed
3. Check .env configuration
4. Review backend logs in terminal
5. Check browser console for frontend errors

**File Locations:**
- Backend logs: Terminal running `npm run dev`
- Frontend errors: Browser console (F12)
- Uploaded files: `backend/uploads/cards/`

## 🎓 Learning Resources

This project demonstrates:
- RESTful API design
- JWT authentication
- Role-based access control
- File upload handling
- OCR integration
- MongoDB with Mongoose
- React with Context API
- Protected routing
- Form handling
- State management

Perfect for learning full-stack development!

---

## 📦 What's Included

**43 Files Created:**
- 19 Backend files (controllers, models, routes, services)
- 15 Frontend files (pages, components, services)
- 9 Configuration files
- Full documentation

**All Features Working:**
✅ Authentication system
✅ Card upload with OCR
✅ Contact management
✅ Tag system
✅ Export functionality
✅ Admin panel
✅ Activity logging
✅ Search & filter
✅ Responsive UI

**Production-Ready:**
✅ Error handling
✅ Input validation
✅ Security middleware
✅ Clean architecture
✅ Scalable structure
✅ Documentation

---

Built with ❤️ - Happy Coding! 🚀
