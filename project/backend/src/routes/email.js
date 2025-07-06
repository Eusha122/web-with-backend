const express = require('express');
const { body, validationResult } = require('express-validator');
const emailService = require('../services/EmailService');

const router = express.Router();

// Send contact email
router.post('/contact', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    await emailService.sendContactEmail(name, email, message);

    res.json({ message: 'Email sent successfully!' });

  } catch (error) {
    console.error('Send contact email error:', error);
    res.status(500).json({ message: 'Failed to send email. Please try again later.' });
  }
});

module.exports = router;