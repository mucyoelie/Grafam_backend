import express from 'express';
import { body, validationResult } from 'express-validator';
import Member from '../models/Member.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all members
router.get('/', protect, async (req, res) => {
  try {
    const { group, status, search } = req.query;
    const query = {};
    if (group && group !== 'All Members') query.group = group;
    if (status) query.status = status;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
    const members = await Member.find(query).sort({ name: 1 });
    res.json({ success: true, count: members.length, members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single member
router.get('/:id', protect, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create member
router.post('/', protect, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const existing = await Member.findOne({ phone: req.body.phone });
    if (existing) return res.status(400).json({ success: false, message: 'Phone number already registered' });

    const member = await Member.create(req.body);
    res.status(201).json({ success: true, member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update member
router.put('/:id', protect, async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete member
router.delete('/:id', protect, async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bulk import members
router.post('/bulk-import', protect, async (req, res) => {
  try {
    const { members } = req.body;
    const results = { inserted: 0, skipped: 0, errors: [] };
    for (const m of members) {
      try {
        const exists = await Member.findOne({ phone: String(m.phone) });
        if (exists) { results.skipped++; continue; }
        await Member.create({ name: m.name, phone: String(m.phone) });
        results.inserted++;
      } catch (e) {
        results.errors.push({ member: m.name, error: e.message });
      }
    }
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get stats
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const total = await Member.countDocuments();
    const active = await Member.countDocuments({ status: 'active' });
    const byGroup = await Member.aggregate([
      { $group: { _id: '$group', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, stats: { total, active, inactive: total - active, byGroup } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
