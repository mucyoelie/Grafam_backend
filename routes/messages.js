import express from 'express';
import { body, validationResult } from 'express-validator';
import Message from '../models/Message.js';
import Member from '../models/Member.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all messages
router.get('/', protect, async (req, res) => {
  try {
    const { type, status, limit = 20, page = 1 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const messages = await Message.find(query)
      .populate('sentBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Message.countDocuments(query);
    res.json({ success: true, count: messages.length, total, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Send/Create message
router.post('/send', protect, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Message content is required'),
  body('type').isIn(['announcement', 'reminder', 'prayer', 'event', 'general']),
  body('targetGroup').notEmpty().withMessage('Target group is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { title, content, type, targetGroup } = req.body;

    // Get recipients
    const memberQuery = { status: 'active' };
    if (targetGroup !== 'All Members') memberQuery.group = targetGroup;
    const members = await Member.find(memberQuery);

    const message = await Message.create({
      title,
      content,
      type,
      targetGroup,
      recipients: members.map(m => m._id),
      recipientCount: members.length,
      sentBy: req.user._id,
      status: 'sent',
      deliveredCount: members.length,
    });

    const populated = await Message.findById(message._id).populate('sentBy', 'name email');
    res.status(201).json({ success: true, message: populated, recipientCount: members.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single message
router.get('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id).populate('sentBy', 'name email').populate('recipients', 'name phone');
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete message
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Message stats
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const total = await Message.countDocuments();
    const byType = await Message.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const recentMessages = await Message.find().sort({ createdAt: -1 }).limit(5).populate('sentBy', 'name');
    res.json({ success: true, stats: { total, byType, recentMessages } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
