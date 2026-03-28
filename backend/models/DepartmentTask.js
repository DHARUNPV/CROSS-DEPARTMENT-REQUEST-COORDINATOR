const mongoose = require('mongoose');

const departmentTaskSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },

  department: { type: String, required: true, trim: true },

  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Pre-fed officer directory support
  assignedOfficerId: {
    type: String,
    default: '',
    trim: true // e.g. "OFF101"
  },

  assignedOfficerName: {
    type: String,
    default: '',
    trim: true
  },

  stage: {
    type: String,
    default: 'Pending',
    trim: true
  },

  status: {
    type: String,
    enum: ['pending', 'in_progress', 'approved', 'rejected'],
    default: 'pending'
  },

  remarks: {
    type: String,
    default: '',
    trim: true
  },

  inspectionNotes: {
    type: String,
    default: '',
    trim: true
  },

  verificationResult: {
    type: String,
    default: '',
    trim: true
  },

  completedByOfficerId: {
    type: String,
    default: '',
    trim: true
  },

  completedAt: {
    type: Date,
    default: null
  },

  // Checklist-based stage tracking
  stageChecklist: [
    {
      fieldKey: {
        type: String,
        default: '',
        trim: true
      },
      fieldLabel: {
        type: String,
        default: '',
        trim: true
      },
      fieldValue: {
        type: mongoose.Schema.Types.Mixed,
        default: ''
      },
      checked: {
        type: Boolean,
        default: false
      },
      checkedAt: {
        type: Date,
        default: null
      }
    }
  ],

  currentStageIndex: {
    type: Number,
    default: 0
  },

  allowedStages: {
    type: [String],
    default: []
  },

  lastChecklistCompletedStage: {
    type: String,
    default: '',
    trim: true
  },

  isStageChecklistCompleted: {
    type: Boolean,
    default: false
  },

  // Soft delete / archive support
  archivedForOfficer: {
    type: Boolean,
    default: false
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

module.exports = mongoose.model('DepartmentTask', departmentTaskSchema);