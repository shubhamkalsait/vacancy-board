const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find admin by username
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Check if admin is active
        if (!admin.isActive) {
            return res.status(401).json({ message: 'Account is deactivated' });
        }
        
        // Verify password
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Update last login
        admin.lastLogin = new Date();
        await admin.save();
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: admin._id, 
                username: admin.username, 
                role: admin.role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        res.json({
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
        res.status(500).json({ message: error.message });
    }
});

// Create new admin (super admin only)
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, name, role } = req.body;
        
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
            $or: [{ username }, { email }]
        });
        
        if (existingAdmin) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        
        const admin = new Admin({
            username,
            email,
            password,
            name,
            role: role || 'admin'
        });
        
        const savedAdmin = await admin.save();
        
        res.status(201).json({
            message: 'Admin created successfully',
            admin: {
                id: savedAdmin._id,
                username: savedAdmin.username,
                name: savedAdmin.name,
                email: savedAdmin.email,
                role: savedAdmin.role
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get admin profile
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const admin = await Admin.findById(decoded.id).select('-password');
        
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        
        res.json(admin);
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Update admin profile
router.put('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const admin = await Admin.findById(decoded.id);
        
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        
        // Update allowed fields
        const { name, email } = req.body;
        if (name) admin.name = name;
        if (email) admin.email = email;
        
        const updatedAdmin = await admin.save();
        
        res.json({
            message: 'Profile updated successfully',
            admin: {
                id: updatedAdmin._id,
                username: updatedAdmin.username,
                name: updatedAdmin.name,
                email: updatedAdmin.email,
                role: updatedAdmin.role
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Change password
router.put('/change-password', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const admin = await Admin.findById(decoded.id);
        
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        
        const { currentPassword, newPassword } = req.body;
        
        // Verify current password
        const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        // Update password
        admin.password = newPassword;
        await admin.save();
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 