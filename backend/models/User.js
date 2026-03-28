const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['citizen', 'officer', 'admin'], required: true },
  department: { type: String, default: null }, // for officers: e.g. "Water Supply", "Municipality"

  // officer-specific optional fields
  officerId: { type: String, default: '' },
  contact: { type: String, default: '' },
  area: { type: String, default: '' },

  // used for least-loaded assignment with round-robin tie breaker
  lastAssignedAt: { type: Date, default: null },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);