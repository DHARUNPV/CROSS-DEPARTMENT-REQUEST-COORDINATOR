const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DepartmentTask = require('../models/DepartmentTask');
const { findOfficer, listOfficersByDepartment } = require('../data/officers');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_EXPIRY = '7d';

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already registered.' });

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: 'citizen',
      department: null
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: 'citizen' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.status(201).json({
      message: 'Registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Registration failed.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { role, officerId, email, password } = req.body;

    if (role === 'officer') {
      if (!officerId || !email || !password) {
        return res.status(400).json({ message: 'Officer ID, email and password are required.' });
      }

      const officer = findOfficer({ officerId, email, password });
      if (!officer) {
        return res.status(401).json({ message: 'Invalid officer credentials.' });
      }

      const token = jwt.sign(
        { role: 'officer', officerId: officer.officerId, department: officer.department },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      return res.json({
        message: 'Login successful.',
        token,
        user: {
          id: officer.officerId,
          officerId: officer.officerId,
          name: officer.name,
          email: officer.email,
          role: 'officer',
          department: officer.department,
          contact: officer.contact,
          area: officer.area,
        },
        departmentMembers: listOfficersByDepartment(officer.department).map(({ password: _pw, ...o }) => o),
      });
    }

    // Default: citizen login
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Login failed.' });
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};

// Officer: list members in my department (pre-fed directory)
exports.myDepartmentMembers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'officer') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const members = listOfficersByDepartment(req.user.department);

    const tasks = await DepartmentTask.find({
      department: req.user.department,
      assignedOfficerId: { $ne: '' },
      archivedForOfficer: { $ne: true }
    }).populate('requestId');

    const loadByOfficerId = {};

    tasks.forEach((task) => {
      const request = task.requestId;
      if (!request) return;

      const complaintCompleted =
        request.requestCategory === 'complaint' &&
        (
          request.currentStage === 'Closed' ||
          request.status === 'Closed'
        );

      const documentCompleted =
        request.requestCategory === 'document' &&
        (
          request.currentStage === 'Available for Download' ||
          request.status === 'Available for Download' ||
          request.currentStage === 'Certificate Generated' ||
          request.status === 'Certificate Generated'
        );

      const isCompleted = complaintCompleted || documentCompleted;

      if (isCompleted) return;

      loadByOfficerId[task.assignedOfficerId] =
        (loadByOfficerId[task.assignedOfficerId] || 0) + 1;
    });

    const safeMembers = members.map(({ password: _pw, ...officer }) => ({
      ...officer,
      assignedTaskCount: loadByOfficerId[officer.officerId] || 0
    }));

    res.json({ me: req.user, members: safeMembers });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load department members.' });
  }
};
