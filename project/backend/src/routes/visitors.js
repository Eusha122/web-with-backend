const express = require('express');
const { body, validationResult } = require('express-validator');
const Visitor = require('../models/Visitor');
const emailService = require('../services/EmailService');

const router = express.Router();

// Add visitor
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('relation')
    .isIn(['friend', 'family', 'colleague', 'student', 'teacher', 'recruiter', 'stranger'])
    .withMessage('Invalid relation type'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, relation, email } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';

    // Check if visitor already exists from this IP in the last 24 hours
    const existingVisitor = await Visitor.findOne({
      ipAddress,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (existingVisitor) {
      return res.status(400).json({ 
        message: 'You have already signed the visitor book today!' 
      });
    }

    // Create new visitor
    const visitor = new Visitor({
      name,
      relation,
      email,
      ipAddress,
      userAgent
    });

    await visitor.save();

    // Send thank you email if email provided
    if (email) {
      try {
        await emailService.sendThankYouEmail(email, name);
        visitor.emailSent = true;
        await visitor.save();
      } catch (emailError) {
        console.error('Failed to send thank you email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(201).json({
      message: 'Thank you for visiting! You have been added to the visitor book.',
      visitor: {
        name: visitor.name,
        relation: visitor.relation,
        createdAt: visitor.createdAt
      }
    });

  } catch (error) {
    console.error('Add visitor error:', error);
    res.status(500).json({ message: 'Server error while adding visitor' });
  }
});

// Get all visitors (public endpoint)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const visitors = await Visitor.find()
      .select('name relation createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Visitor.countDocuments();

    res.json({
      visitors,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get visitors error:', error);
    res.status(500).json({ message: 'Server error while fetching visitors' });
  }
});

// Get visitor statistics
router.get('/stats', async (req, res) => {
  try {
    const total = await Visitor.countDocuments();
    const today = await Visitor.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    const thisWeek = await Visitor.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Get relation breakdown
    const relationStats = await Visitor.aggregate([
      {
        $group: {
          _id: '$relation',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      total,
      today,
      thisWeek,
      relationBreakdown: relationStats
    });

  } catch (error) {
    console.error('Get visitor stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

module.exports = router;