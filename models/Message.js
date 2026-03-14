import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['announcement', 'reminder', 'prayer', 'event', 'general'],
    default: 'general'
  },
  targetGroup: { type: String, default: 'All Members' },
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  recipientCount: { type: Number, default: 0 },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'sent', 'scheduled'], default: 'sent' },
  scheduledAt: { type: Date },
  deliveredCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
