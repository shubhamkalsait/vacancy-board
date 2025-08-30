const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function setupLocalMongo() {
    try {
        // Connect to local MongoDB
        const localUri = 'mongodb://localhost:27017/vacancy-board';
        console.log('Attempting to connect to local MongoDB...');
        
        await mongoose.connect(localUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });

        console.log('✅ Connected to local MongoDB successfully!');

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
            password: 'admin123',
            name: 'CloudBlitz Admin',
            role: 'super_admin'
        });

        await admin.save();
        
        console.log('✅ Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Please change the password after first login.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.name === 'MongooseServerSelectionError') {
            console.log('\n🔧 Local MongoDB Setup Instructions:');
            console.log('1. Install MongoDB locally:');
            console.log('   - macOS: brew install mongodb-community');
            console.log('   - Ubuntu: sudo apt install mongodb');
            console.log('   - Windows: Download from mongodb.com');
            console.log('\n2. Start MongoDB service:');
            console.log('   - macOS: brew services start mongodb-community');
            console.log('   - Ubuntu: sudo systemctl start mongodb');
            console.log('   - Windows: Start MongoDB service from Services');
            console.log('\n3. Run this script again: node setup-local-mongo.js');
        }
    } finally {
        try {
            await mongoose.disconnect();
        } catch (disconnectError) {
            console.log('Disconnect error:', disconnectError.message);
        }
        process.exit(0);
    }
}

setupLocalMongo(); 