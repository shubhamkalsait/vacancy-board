# CloudBlitz Job Vacancy Dashboard

A modern job vacancy dashboard built with HTML, CSS, JavaScript frontend and MongoDB backend, inspired by the CloudBlitz website design.

## Features

### For Candidates
- **Modern, responsive design** with CloudBlitz-inspired styling
- **Search and filter** jobs by location, type, and experience level
- **Detailed job view** with comprehensive information
- **Direct apply links** to external application forms
- **Share functionality** for job postings
- **Pagination** for easy navigation through job listings
- **Real-time statistics** display

### For Admins
- **Secure authentication** with JWT tokens
- **Dashboard overview** with key metrics
- **CRUD operations** for job vacancies
- **Bulk management** of job postings
- **Profile management** and password changes
- **Responsive admin panel** with modern UI

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Custom CSS with modern design patterns
- **Icons**: Font Awesome
- **Fonts**: Inter (Google Fonts)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vacancy-board
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/vacancy-board
   JWT_SECRET=your-super-secret-jwt-key
   PORT=3000
   NODE_ENV=development
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Ensure MongoDB is running on the specified URI

5. **Create initial admin user**
   ```bash
   # Start the server first
   npm start
   
   # Then create an admin user via API or database
   ```

6. **Start the application**
   ```bash
   npm start
   # or for development with auto-restart
   npm run dev
   ```

## Project Structure

```
vacancy-board/
├── public/                 # Frontend files
│   ├── index.html         # Main candidate view
│   ├── admin.html         # Admin panel
│   ├── styles.css         # Main styles
│   ├── admin-styles.css   # Admin panel styles
│   ├── script.js          # Main JavaScript
│   └── admin-script.js    # Admin JavaScript
├── models/                # MongoDB models
│   ├── Vacancy.js         # Job vacancy model
│   └── Admin.js           # Admin user model
├── routes/                # API routes
│   ├── vacancies.js       # Vacancy CRUD operations
│   └── admin.js           # Admin authentication
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── env.example            # Environment variables template
└── README.md              # Project documentation
```

## API Endpoints

### Public Endpoints
- `GET /api/vacancies` - Get all active vacancies
- `GET /api/vacancies/:id` - Get specific vacancy details
- `GET /api/vacancies/stats/overview` - Get vacancy statistics

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `POST /api/admin/register` - Create new admin
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile
- `PUT /api/admin/change-password` - Change admin password

### Vacancy Management (Admin only)
- `POST /api/vacancies` - Create new vacancy
- `PUT /api/vacancies/:id` - Update vacancy
- `DELETE /api/vacancies/:id` - Delete vacancy

## Usage

### For Candidates
1. Visit the main page at `http://localhost:3000`
2. Browse available job openings
3. Use search and filters to find relevant positions
4. Click on job cards to view detailed information
5. Use the "Apply Now" button to redirect to application forms

### For Admins
1. Access admin panel at `http://localhost:3000/admin`
2. Login with admin credentials
3. Navigate through different sections:
   - **Overview**: View dashboard statistics
   - **Vacancies**: Manage all job postings
   - **Add Vacancy**: Create new job postings
   - **Profile**: Update account information

## Features in Detail

### Search and Filtering
- Real-time search across job titles, descriptions, and companies
- Filter by location, job type, and experience level
- Clear filters functionality
- Pagination for large result sets

### Job Management
- Comprehensive job posting form with all necessary fields
- Dynamic requirements and benefits input
- Rich text descriptions
- Expiry date management
- Active/inactive status control

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Protected admin routes
- Input validation and sanitization

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Cross-browser compatibility

## Customization

### Styling
The design is inspired by CloudBlitz and can be customized by modifying:
- `public/styles.css` - Main candidate view styles
- `public/admin-styles.css` - Admin panel styles

### Configuration
- Environment variables in `.env` file
- MongoDB connection settings
- JWT secret key
- Server port configuration

## Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Use a strong JWT secret
3. Configure MongoDB Atlas or production MongoDB instance
4. Set up proper CORS settings if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ by CloudBlitz Team**