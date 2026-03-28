const express = require('express');
const router = express.Router();
const { getAllUsers, createOfficer, getProfile } = require('../controllers/userController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, requireRole('admin'), getAllUsers);
router.post('/officers', auth, requireRole('admin'), createOfficer);
router.get('/profile', auth, getProfile);

module.exports = router;
