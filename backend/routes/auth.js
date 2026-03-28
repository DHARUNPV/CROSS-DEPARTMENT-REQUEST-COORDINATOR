const express = require('express');
const router = express.Router();
const { register, login, me, myDepartmentMembers } = require('../controllers/authController');
const { auth, requireRole } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, me);
router.get('/officer/department-members', auth, requireRole('officer'), myDepartmentMembers);

module.exports = router;
