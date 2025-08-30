const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

async function createAdminUser() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vacancy-board';
        console.log('Attempting to connect to MongoDB...');
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // 5 second timeout
            socketTimeoutMS: 45000, // 45 second timeout
        });

        console.log('✅ Connected to MongoDB successfully!');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        
        if (existingAdmin) {
            console.log('Admin user already exists');
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
        
        console.log('Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Please change the password after first login.');
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        
        if (error.name === 'MongooseServerSelectionError') {
            console.log('\n🔧 Troubleshooting MongoDB Connection:');
            console.log('1. Check if MongoDB Atlas is accessible');
            console.log('2. Verify your IP is whitelisted in MongoDB Atlas');
            console.log('3. Check username/password in MONGODB_URI');
            console.log('4. Try using local MongoDB: mongodb://localhost:27017/vacancy-board');
            console.log('\n📝 To whitelist your IP in MongoDB Atlas:');
            console.log('- Go to Network Access in Atlas dashboard');
            console.log('- Click "Add IP Address"');
            console.log('- Add your current IP or use "0.0.0.0/0" for all IPs (not recommended for production)');
        }
    } finally {
        try {
            await mongoose.disconnect();
        } catch (disconnectError) {
            console.log('Disconnect error:', disconnectError.message);
        }
        process.exit(1);
    }
}

createAdminUser(); 