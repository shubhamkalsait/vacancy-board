const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vacancy-board';
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
        console.log('\n🔧 MongoDB Connection Troubleshooting:');
        console.log('1. Check if MongoDB Atlas is accessible');
        console.log('2. Verify your IP is whitelisted in MongoDB Atlas');
        console.log('3. Check username/password in MONGODB_URI');
        console.log('4. Try using local MongoDB: mongodb://localhost:27017/vacancy-board');
    }
});
db.once('open', () => {
    console.log('✅ Connected to MongoDB successfully!');
});

// Models
const Vacancy = require('./models/Vacancy');
const Admin = require('./models/Admin');

// Routes
app.use('/api/vacancies', require('./routes/vacancies'));
app.use('/api/admin', require('./routes/admin'));

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 