const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { getAll, create } = require('../controllers/departmentController');
const { auth, requireRole } = require('../middleware/auth');

const DEFAULT_DEPARTMENTS = [
  'Municipality',
  'Water Supply Department',
  'Public Works Department',
  'Electricity Department',
  'Sanitation Department',
  'Health Department',
  'Revenue Department',
  'Survey Department',
  'Fire Department'
];

router.get('/list', async (req, res) => {
  try {
    const list = await Department.find().select('name').sort({ name: 1 });
    if (list.length > 0) return res.json(list);
    res.json(DEFAULT_DEPARTMENTS.map((name) => ({ _id: name, name })));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
router.get('/', auth, getAll);
router.post('/', auth, requireRole('admin'), create);

module.exports = router;
