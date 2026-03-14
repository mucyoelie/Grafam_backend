import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  email: { type: String, default: '', lowercase: true, trim: true },
  group: {
    type: String,
    enum: ['All Members', 'Elders', 'Deacons', 'Sisters', 'Brothers', 'Youth', 'Choir'],
    default: 'All Members'
  },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  joinDate: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Member', memberSchema);
