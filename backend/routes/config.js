const express = require('express');
const router = express.Router();
const { COMPLAINT_DEPARTMENTS, DOCUMENT_DEPARTMENTS } = require('../utils/departmentRouting');
const Request = require('../models/Request');

const complaintTypes = Object.keys(COMPLAINT_DEPARTMENTS);
const documentTypes = Object.keys(DOCUMENT_DEPARTMENTS);
const complaintStages = Request.complaintStages;
const documentStages = Request.documentStages;

router.get('/', (req, res) => {
  res.json({
    complaintTypes,
    documentTypes,
    complaintStages,
    documentStages,
    priorities: ['low', 'medium', 'high', 'urgent']
  });
});

module.exports = router;
