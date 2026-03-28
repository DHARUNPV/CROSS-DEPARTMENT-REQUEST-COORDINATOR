const Certificate = require('../models/Certificate');
const Request = require('../models/Request');
const path = require('path');
const fs = require('fs');

async function canAccessRequest(req, request) {
  if (!req.user || !request) return false;
  if (req.user.role === 'admin') return true;
  if (req.user.role === 'citizen') return request.userId.toString() === req.user._id.toString();
  if (req.user.role === 'officer') return (request.assignedDepartments || []).includes(req.user.department);
  return false;
}

exports.getByRequestId = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ requestId: req.params.requestId });
    if (!cert) return res.status(404).json({ message: 'Certificate not found.' });
    const request = await Request.findById(cert.requestId);
    if (!(await canAccessRequest(req, request))) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    res.json(cert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.download = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ requestId: req.params.requestId });
    if (!cert) return res.status(404).json({ message: 'Certificate not found.' });
    const request = await Request.findById(cert.requestId);
    if (!(await canAccessRequest(req, request))) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const filepath = path.join(__dirname, '..', cert.pdfPath);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: 'Certificate file is missing on server. Please regenerate the certificate.' });
    }
    res.download(filepath, path.basename(cert.pdfPath));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
