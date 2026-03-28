const mongoose = require('mongoose');

const complaintStages = [
  'Submitted',
  'Under Review',
  'Inspection Scheduled',
  'Work In Progress',
  'Resolved',
  'Closed'
];

const documentStages = [
  'Application Submitted',
  'Document Verification',
  'Department Approval',
  'Certificate Generated',
  'Available for Download'
];

const requestSchema = new mongoose.Schema({
  requestId: { type: String, unique: true, trim: true }, // e.g. REQ-2025-001234
  requestType: { type: String, required: true, trim: true }, // complaint type or document type
  requestCategory: { type: String, enum: ['complaint', 'document'], required: true },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  status: { type: String, default: 'Submitted', trim: true },
  currentStage: { type: String, default: 'Submitted', trim: true },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  location: { type: String, default: '', trim: true },
  area: { type: String, default: '', trim: true },
  exactAddress: { type: String, default: '', trim: true },
  landmark: { type: String, default: '', trim: true },
  contactNumber: { type: String, default: '', trim: true },
  preferredInspectionTime: { type: String, default: '', trim: true },
  description: { type: String, default: '', trim: true },
  imageUrl: { type: String, default: '', trim: true },

  // Document-specific fields (stored as flexible object)
  documentData: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Complaints: type; Documents: form fields per type
  assignedDepartments: [{ type: String, trim: true }],

  timeline: [{
    stage: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '', trim: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  }],

  officerComments: [{
    text: { type: String, default: '', trim: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    authorName: { type: String, default: '', trim: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

requestSchema.pre('save', function (next) {
  if (this.isNew && !this.requestId) {
    const num = Math.floor(100000 + Math.random() * 900000);
    this.requestId = `REQ-${new Date().getFullYear()}-${num}`;
  }

  if (typeof this.status === 'string') {
    this.status = this.status.trim();
  }

  if (typeof this.currentStage === 'string') {
    this.currentStage = this.currentStage.trim();
  }

  if (typeof this.requestType === 'string') {
    this.requestType = this.requestType.trim();
  }

  next();
});

module.exports = mongoose.model('Request', requestSchema);
module.exports.complaintStages = complaintStages;
module.exports.documentStages = documentStages;