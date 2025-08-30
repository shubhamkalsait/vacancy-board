# CloudBlitz Job Dashboard

A modern, responsive job vacancy dashboard inspired by CloudBlitz with an orange→purple gradient theme. Built with HTML, CSS, JavaScript frontend and MongoDB backend.

## 🎨 Design Theme

**Orange→Purple Gradient:**
- Primary gradient: `linear-gradient(135deg, #ff7e00 0%, #9b00ff 100%)`
- Applied to: Header background, primary buttons, card accents, and section headings
- Font stack: Inter (Google Fonts) with system fallbacks

## ✨ Features

### For Job Seekers
- **Modern, responsive design** with CloudBlitz-inspired styling
- **Search and filter** jobs by keyword, location, and job type
- **Interactive job cards** with hover effects and gradient accents
- **Detailed job modal** with comprehensive information
- **Direct apply links** that open in new tabs
- **Pagination** for easy navigation through job listings
- **Export to CSV** functionality

### For Admins
- **Secure admin authentication** with JWT tokens
- **Admin login system** with username/password
- **Admin dashboard** with job management tools
- **Comprehensive job posting form** with all required fields
- **Client-side validation** with real-time feedback
- **Character counters** for description fields
- **Success/error notifications** with toast messages
- **Protected export functionality** (admin only)
- **Job update and delete capabilities** (admin only)

### Technical Features
- **RESTful API** with comprehensive endpoints
- **MongoDB integration** with Mongoose ODM
- **Form validation** (client and server-side)
- **Responsive design** (mobile-first approach)
- **Accessibility features** (ARIA labels, keyboard navigation)
- **Modern CSS** with CSS custom properties and utility classes

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Icons**: Font Awesome 6
- **Fonts**: Inter (Google Fonts)

## 📁 Project Structure

```
cloudblitz-dashboard/
├── public/                 # Frontend files
│   ├── index.html         # Main dashboard page
│   ├── styles.css         # Complete CSS styles
│   └── app.js             # Frontend JavaScript
├── server.js              # Express server with API routes
├── seed.js                # Database seeding script
├── package.json           # Dependencies and scripts
├── env.example            # Environment variables template
└── README.md              # Project documentation
```

## 🚀 Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd cloudblitz-dashboard
npm install
```

### 2. Set Up Environment Variables

```bash
cp env.example .env
```

Edit `.env` file with your configuration:

```env
# For MongoDB Atlas (recommended):
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cloudblitz-dashboard?retryWrites=true&w=majority

# For local MongoDB (development only):
# MONGODB_URI=mongodb://localhost:27017/cloudblitz-dashboard

PORT=3000
NODE_ENV=development
```

### 3. Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new project

2. **Create a Cluster**
   - Choose the free tier (M0)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Set Up Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password (save these securely)
   - Select "Read and write to any database"
   - Click "Add User"

4. **Set Up Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your specific IP addresses
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<dbname>` with your values
   - Update the `MONGODB_URI` in your `.env` file

### 4. Create Admin User

```bash
npm run create-admin
```

This will create a default admin user with:
- Username: `admin`
- Password: `admin123`
- Email: `admin@cloudblitz.in`

⚠️ **Important**: Change the password after first login for security.

### 5. Seed the Database

```bash
npm run seed
```

This will populate your database with 10 sample job postings.

### 6. Start the Application

```bash
# Production
npm start

# Development (with auto-restart)
npm run dev
```

### 7. Access the Dashboard

- **Main Dashboard**: `http://localhost:3000`
- **API Endpoints**: `http://localhost:3000/api/jobs`
- **Admin Login**: Click "Admin Login" button in the header

## 📊 API Endpoints

### Public Endpoints

#### GET /api/jobs
Get paginated job listings with optional filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `pageSize` (number): Items per page (default: 12)
- `search` (string): Search term for job title, company, or description
- `location` (string): Filter by location
- `type` (string): Filter by job type (Full-time, Part-time, Contract)

**Example:**
```bash
curl "http://localhost:3000/api/jobs?page=1&search=developer&location=Mumbai"
```

#### GET /api/jobs/:id
Get detailed information about a specific job.

**Example:**
```bash
curl "http://localhost:3000/api/jobs/64f8a1b2c3d4e5f6a7b8c9d0"
```



### Admin Authentication Endpoints

#### POST /api/admin/login
Admin login to get JWT token.

**Required Fields:**
- `username` (string)
- `password` (string)

**Example:**
```bash
curl -X POST "http://localhost:3000/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "admin",
    "name": "CloudBlitz Admin",
    "email": "admin@cloudblitz.in",
    "role": "super_admin"
  }
}
```

#### GET /api/admin/profile
Get admin profile (requires authentication).

**Headers:**
- `Authorization: Bearer <token>`

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/admin/profile"
```

### Admin Job Management Endpoints

#### POST /api/jobs (Admin only)
Create a new job posting (requires authentication).

**Headers:**
- `Authorization: Bearer <token>`

**Required Fields:**
- `title` (string, max 100 chars)
- `company` (string, max 50 chars)
- `location` (string, max 50 chars)
- `jobType` (enum: "Full-time", "Part-time", "Contract")
- `experience` (string, max 50 chars)
- `shortDescription` (string, max 200 chars)
- `fullDescription` (string, max 2000 chars)
- `applyLink` (string, valid URL)

**Optional Fields:**
- `salary` (string, max 50 chars)

**Example:**
```bash
curl -X POST "http://localhost:3000/api/jobs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Senior Developer",
    "company": "TechCorp",
    "location": "Mumbai, India",
    "jobType": "Full-time",
    "experience": "5-8 years",
    "shortDescription": "Join our team to build amazing applications",
    "fullDescription": "Detailed job description...",
    "applyLink": "https://techcorp.com/apply"
  }'
```

#### PUT /api/jobs/:id (Admin only)
Update a job posting (requires authentication).

**Headers:**
- `Authorization: Bearer <token>`

**Example:**
```bash
curl -X PUT "http://localhost:3000/api/jobs/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Updated Job Title",
    "salary": "₹20,00,000 - ₹30,00,000"
  }'
```

#### DELETE /api/jobs/:id (Admin only)
Delete a job posting (requires authentication).

**Headers:**
- `Authorization: Bearer <token>`

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/jobs/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer <token>"
```

#### GET /api/admin/jobs/export (Admin only)
Export all jobs as CSV (requires authentication).

**Headers:**
- `Authorization: Bearer <token>`

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/admin/jobs/export" \
  -o cloudblitz-jobs-export.csv
```

## 🎯 Usage Guide

### For Job Seekers

1. **Browse Jobs**: View all available positions on the main dashboard
2. **Search**: Use the search bar to find specific jobs or skills
3. **Filter**: Use location and job type filters to narrow results
4. **View Details**: Click on any job card to see full details
5. **Apply**: Click "Apply" to be redirected to the application form
6. **Export**: Download all jobs as CSV for offline review

### For Admins

1. **Admin Login**: Click the "Admin Login" button in the header
2. **Authentication**: Enter username and password to access admin features
3. **Admin Dashboard**: Access job management tools and export functionality
4. **Post a Job**: Fill out the comprehensive job posting form
5. **Validation**: All required fields are validated in real-time
6. **Submit**: Click "Post Job" to create the listing
7. **Success**: New jobs appear at the top of the list immediately
8. **Export**: Download job data as CSV (admin only)
9. **Logout**: Securely log out when finished

## 🎨 Design System

### Color Palette
- **Primary Orange**: `#ff7e00`
- **Primary Purple**: `#9b00ff`
- **Secondary Orange**: `#ff9500`
- **Secondary Purple**: `#8b00ff`
- **Neutral Grays**: 50-900 scale for text and backgrounds

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Fallback**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)
- **Font Sizes**: xs (0.75rem) to 4xl (2.25rem)

### Spacing
- **Base Unit**: 0.25rem (4px)
- **Scale**: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16 units

### Border Radius
- **Small**: 0.375rem (6px)
- **Medium**: 0.5rem (8px)
- **Large**: 0.75rem (12px)
- **Extra Large**: 1rem (16px)
- **2XL**: 1.5rem (24px)

## 🔧 Customization

### Styling
The design can be customized by modifying CSS custom properties in `public/styles.css`:

```css
:root {
  --gradient-primary: linear-gradient(135deg, #ff7e00 0%, #9b00ff 100%);
  --orange-primary: #ff7e00;
  --purple-primary: #9b00ff;
  /* ... other variables */
}
```

### Configuration
- Environment variables in `.env` file
- MongoDB connection settings
- Server port configuration

## 🧪 Testing

### API Testing with curl

```bash
# Get all jobs
curl "http://localhost:3000/api/jobs"

# Search for developer jobs
curl "http://localhost:3000/api/jobs?search=developer"

# Get jobs from Mumbai
curl "http://localhost:3000/api/jobs?location=Mumbai"

# Export jobs to CSV
curl "http://localhost:3000/api/jobs/export" -o jobs.csv
```

### Manual Testing Checklist
- [ ] Responsive design on mobile, tablet, and desktop
- [ ] Search functionality works correctly
- [ ] Filters apply and clear properly
- [ ] Job cards display all information
- [ ] Modal opens and displays job details
- [ ] Apply links open in new tabs
- [ ] Admin login works with valid credentials
- [ ] Admin dashboard displays correctly after login
- [ ] Job posting form validates all fields
- [ ] Form submission creates new jobs (admin only)
- [ ] Export functionality downloads CSV (admin only)
- [ ] Logout functionality works correctly
- [ ] Public users cannot access admin features
- [ ] Pagination works correctly

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Setup for Production
1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Configure proper CORS settings if needed
4. Set up reverse proxy (nginx) for better performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section below

## 🔧 Troubleshooting

### MongoDB Connection Issues
1. **Atlas Connection**: Check if your IP is whitelisted in Network Access
2. **Credentials**: Verify username and password in connection string
3. **Connection String**: Ensure proper format and database name
4. **Cluster Status**: Check if your Atlas cluster is active

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Form Validation Issues
- Check browser console for JavaScript errors
- Ensure all required fields are filled
- Verify URL format for apply links

---

**Built with ❤️ by CloudBlitz Team**

*Inspired by the modern design principles of CloudBlitz*