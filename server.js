const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/cloudblitz-dashboard?retryWrites=true&w=majority';
console.log('Attempting to connect to MongoDB...');

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
});

const db = mongoose.connection;
db.on('error', (error) => {
    console.error('❌ MongoDB connection error:', error.message);
            if (error.name === 'MongooseServerSelectionError') {
            console.log('\n🔧 MongoDB Atlas Connection Troubleshooting:');
            console.log('1. Check if your IP is whitelisted in MongoDB Atlas Network Access');
            console.log('2. Verify username and password in your connection string');
            console.log('3. Ensure your Atlas cluster is active and running');
            console.log('4. Check your connection string format in .env file');
        }
});
db.once('open', () => {
    console.log('✅ Connected to MongoDB successfully!');
});

// Job Schema
const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
        maxlength: [100, 'Job title cannot exceed 100 characters']
    },
    company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        maxlength: [50, 'Company name cannot exceed 50 characters']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
        maxlength: [50, 'Location cannot exceed 50 characters']
    },
    jobType: {
        type: String,
        required: [true, 'Job type is required'],
        enum: {
            values: ['Full-time', 'Part-time', 'Contract'],
            message: 'Job type must be Full-time, Part-time, or Contract'
        }
    },
    experience: {
        type: String,
        required: [true, 'Experience level is required'],
        trim: true,
        maxlength: [50, 'Experience cannot exceed 50 characters']
    },
    salary: {
        type: String,
        trim: true,
        maxlength: [50, 'Salary cannot exceed 50 characters']
    },
    shortDescription: {
        type: String,
        required: [true, 'Short description is required'],
        trim: true,
        maxlength: [200, 'Short description cannot exceed 200 characters']
    },
    fullDescription: {
        type: String,
        required: [true, 'Full description is required'],
        trim: true,
        maxlength: [2000, 'Full description cannot exceed 2000 characters']
    },
    applyLink: {
        type: String,
        required: [true, 'Apply link is required'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Apply link must be a valid URL starting with http:// or https://'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for search functionality
jobSchema.index({ title: 'text', company: 'text', location: 'text', shortDescription: 'text' });

const Job = mongoose.model('Job', jobSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'super_admin'],
        default: 'admin'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

// JWT Middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            error: 'Access denied',
            message: 'No token provided' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.adminId);
        
        if (!admin || !admin.isActive) {
            return res.status(401).json({ 
                error: 'Access denied',
                message: 'Invalid or inactive admin account' 
            });
        }

        req.admin = admin;
        next();
    } catch (error) {
        return res.status(403).json({ 
            error: 'Access denied',
            message: 'Invalid token' 
        });
    }
};

// Routes

// GET /api/jobs - Get paginated job list with filters
app.get('/api/jobs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 12;
        const search = req.query.search || '';
        const location = req.query.location || '';
        const type = req.query.type || '';

        // Build query
        let query = {};
        
        if (search) {
            query.$text = { $search: search };
        }
        
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        
        if (type) {
            query.jobType = type;
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * pageSize;

        // Execute query
        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        // Get total count for pagination
        const total = await Job.countDocuments(query);
        const totalPages = Math.ceil(total / pageSize);

        res.json({
            jobs,
            pagination: {
                currentPage: page,
                totalPages,
                total,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ 
            error: 'Failed to fetch jobs',
            message: error.message 
        });
    }
});



// GET /api/jobs/:id - Get single job details
app.get('/api/jobs/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        
        if (!job) {
            return res.status(404).json({ 
                error: 'Job not found',
                message: 'The requested job posting does not exist'
            });
        }

        res.json(job);

    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ 
            error: 'Failed to fetch job',
            message: error.message 
        });
    }
});

// Admin Authentication Routes

// POST /api/admin/login - Admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: 'Missing credentials',
                message: 'Username and password are required'
            });
        }

        // Find admin by username
        const admin = await Admin.findOne({ username, isActive: true });
        
        if (!admin) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Invalid username or password'
            });
        }

        // Check password
        const isPasswordValid = await admin.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Invalid username or password'
            });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate JWT token
        const token = jwt.sign(
            { adminId: admin._id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            error: 'Login failed',
            message: error.message
        });
    }
});

// GET /api/admin/profile - Get admin profile
app.get('/api/admin/profile', authenticateToken, async (req, res) => {
    try {
        res.json({
            admin: {
                id: req.admin._id,
                username: req.admin.username,
                name: req.admin.name,
                email: req.admin.email,
                role: req.admin.role,
                lastLogin: req.admin.lastLogin
            }
        });
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({
            error: 'Failed to fetch profile',
            message: error.message
        });
    }
});

// POST /api/jobs - Create a new job posting (Admin only)
app.post('/api/jobs', authenticateToken, async (req, res) => {
    try {
        const jobData = req.body;

        // Validate required fields
        const requiredFields = ['title', 'company', 'location', 'jobType', 'experience', 'shortDescription', 'fullDescription', 'applyLink'];
        const missingFields = requiredFields.filter(field => !jobData[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: `The following fields are required: ${missingFields.join(', ')}`
            });
        }

        // Create new job
        const job = new Job(jobData);
        await job.save();

        res.status(201).json({
            message: 'Job posted successfully',
            job
        });

    } catch (error) {
        console.error('Error creating job:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: 'Validation error',
                message: messages.join(', ')
            });
        }

        res.status(500).json({ 
            error: 'Failed to create job',
            message: error.message 
        });
    }
});

// DELETE /api/jobs/:id - Delete a job (Admin only)
app.delete('/api/jobs/:id', authenticateToken, async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        
        if (!job) {
            return res.status(404).json({ 
                error: 'Job not found',
                message: 'The requested job posting does not exist'
            });
        }

        res.json({
            message: 'Job deleted successfully',
            deletedJob: job
        });

    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ 
            error: 'Failed to delete job',
            message: error.message 
        });
    }
});

// PUT /api/jobs/:id - Update a job (Admin only)
app.put('/api/jobs/:id', authenticateToken, async (req, res) => {
    try {
        const jobData = req.body;
        const job = await Job.findByIdAndUpdate(req.params.id, jobData, { new: true, runValidators: true });
        
        if (!job) {
            return res.status(404).json({ 
                error: 'Job not found',
                message: 'The requested job posting does not exist'
            });
        }

        res.json({
            message: 'Job updated successfully',
            job
        });

    } catch (error) {
        console.error('Error updating job:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: 'Validation error',
                message: messages.join(', ')
            });
        }

        res.status(500).json({ 
            error: 'Failed to update job',
            message: error.message 
        });
    }
});

// GET /api/admin/jobs/export - Export jobs as CSV (Admin only)
app.get('/api/admin/jobs/export', authenticateToken, async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        
        // Create CSV content
        const csvHeader = 'Title,Company,Location,Job Type,Experience,Salary,Short Description,Apply Link,Created At\n';
        const csvRows = jobs.map(job => {
            return `"${job.title}","${job.company}","${job.location}","${job.jobType}","${job.experience}","${job.salary || ''}","${job.shortDescription}","${job.applyLink}","${job.createdAt.toISOString()}"`;
        }).join('\n');
        
        const csvContent = csvHeader + csvRows;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="cloudblitz-jobs-export.csv"');
        res.send(csvContent);

    } catch (error) {
        console.error('Error exporting jobs:', error);
        res.status(500).json({ 
            error: 'Failed to export jobs',
            message: error.message 
        });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CloudBlitz Job Dashboard running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api/jobs`);
}); 