const express = require('express');
const router = express.Router();
const Vacancy = require('../models/Vacancy');

// Get all active vacancies (public)
router.get('/', async (req, res) => {
    try {
        const { search, location, type, page = 1, limit = 10 } = req.query;
        
        let query = { isActive: true, expiryDate: { $gte: new Date() } };
        
        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }
        
        // Filter by location
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        
        // Filter by job type
        if (type) {
            query.type = type;
        }
        
        const skip = (page - 1) * limit;
        
        const vacancies = await Vacancy.find(query)
            .sort({ postedDate: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('postedBy', 'name');
            
        const total = await Vacancy.countDocuments(query);
        
        res.json({
            vacancies,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single vacancy by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const vacancy = await Vacancy.findById(req.params.id)
            .populate('postedBy', 'name');
            
        if (!vacancy) {
            return res.status(404).json({ message: 'Vacancy not found' });
        }
        
        // Increment views
        vacancy.views += 1;
        await vacancy.save();
        
        res.json(vacancy);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new vacancy (admin only)
router.post('/', async (req, res) => {
    try {
        const vacancy = new Vacancy(req.body);
        const savedVacancy = await vacancy.save();
        res.status(201).json(savedVacancy);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update vacancy (admin only)
router.put('/:id', async (req, res) => {
    try {
        const vacancy = await Vacancy.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!vacancy) {
            return res.status(404).json({ message: 'Vacancy not found' });
        }
        
        res.json(vacancy);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete vacancy (admin only)
router.delete('/:id', async (req, res) => {
    try {
        const vacancy = await Vacancy.findByIdAndDelete(req.params.id);
        
        if (!vacancy) {
            return res.status(404).json({ message: 'Vacancy not found' });
        }
        
        res.json({ message: 'Vacancy deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get vacancy statistics (admin only)
router.get('/stats/overview', async (req, res) => {
    try {
        const totalVacancies = await Vacancy.countDocuments();
        const activeVacancies = await Vacancy.countDocuments({ 
            isActive: true, 
            expiryDate: { $gte: new Date() } 
        });
        const expiredVacancies = await Vacancy.countDocuments({ 
            expiryDate: { $lt: new Date() } 
        });
        
        const totalViews = await Vacancy.aggregate([
            { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ]);
        
        res.json({
            totalVacancies,
            activeVacancies,
            expiredVacancies,
            totalViews: totalViews[0]?.totalViews || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 