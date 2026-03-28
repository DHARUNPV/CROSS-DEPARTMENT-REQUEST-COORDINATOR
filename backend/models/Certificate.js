const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  certificateId: { type: String, required: true, unique: true },
  documentType: { type: String, required: true },
  pdfPath: { type: String, required: true },
  issuedAt: { type: Date, default: Date.now },
  issuedBy: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);