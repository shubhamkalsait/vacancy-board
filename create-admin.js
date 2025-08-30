const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/cloudblitz-dashboard?retryWrites=true&w=majority';

// Admin Schema (same as in server.js)
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
const bcrypt = require('bcryptjs');
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

const Admin = mongoose.model('Admin', adminSchema);

async function createAdminUser() {
    try {
        console.log('🌱 Connecting to MongoDB...');
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });

        console.log('✅ Connected to MongoDB successfully!');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });

        if (existingAdmin) {
            console.log('Admin user already exists');
            console.log('Username: admin');
            console.log('Email: admin@cloudblitz.in');
            console.log('To reset password, delete the admin user and run this script again.');
            process.exit(0);
        }

        // Create new admin user
        const admin = new Admin({
            username: 'admin',
            email: 'admin@cloudblitz.in',
            password: 'admin123', // This will be hashed automatically
            name: 'CloudBlitz Admin',
            role: 'super_admin'
        });

        await admin.save();

        console.log('✅ Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Email: admin@cloudblitz.in');
        console.log('⚠️  Please change the password after first login for security.');

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        
        if (error.name === 'MongooseServerSelectionError') {
            console.log('\n🔧 MongoDB Atlas Connection Troubleshooting:');
            console.log('1. Check if your IP is whitelisted in MongoDB Atlas Network Access');
            console.log('2. Verify username and password in your connection string');
            console.log('3. Ensure your Atlas cluster is active and running');
            console.log('4. Check your connection string format in .env file');
        }
    } finally {
        try {
            await mongoose.disconnect();
            console.log('🔌 Disconnected from MongoDB');
        } catch (disconnectError) {
            console.log('Disconnect error:', disconnectError.message);
        }
        process.exit(0);
    }
}

createAdminUser(); 