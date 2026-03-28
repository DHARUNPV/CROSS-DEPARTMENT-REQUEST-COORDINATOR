
const Department = require('../models/Department');

exports.getAll = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Department name is required.' });
    const codeVal = code || name.replace(/\s+/g, '').slice(0, 6).toUpperCase();
    const department = new Department({ name, code: codeVal, description: description || '' });
    await department.save();
    res.status(201).json(department);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
