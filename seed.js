import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Member from './models/Member.js';

dotenv.config();

const CHURCH_MEMBERS = [
  { name: 'Elder Serge', phone: '679931488', group: 'Elders' },
  { name: 'Sis Abigail', phone: '671112872', group: 'Sisters' },
  { name: 'Ma Hannah', phone: '652650207', group: 'All Members' },
  { name: 'Sis Nerisa', phone: '650471261', group: 'Sisters' },
  { name: 'Ma Grace', phone: '677171512', group: 'All Members' },
  { name: 'Ma Marbel', phone: '678693303', group: 'All Members' },
  { name: 'Ma Pamela', phone: '651713152', group: 'All Members' },
  { name: 'Sis Junabelle', phone: '670335435', group: 'Sisters' },
  { name: 'Br Ashu', phone: '673753450', group: 'Brothers' },
  { name: 'Dec. Felicity', phone: '676344500', group: 'Deacons' },
  { name: 'Sis Dimobel', phone: '673886641', group: 'Sisters' },
  { name: 'Sis Rita', phone: '653713000', group: 'Sisters' },
  { name: 'Br Miracle', phone: '683165760', group: 'Brothers' },
  { name: 'Br Ronaldo', phone: '653677617', group: 'Brothers' },
  { name: 'Sis Rose', phone: '680054696', group: 'Sisters' },
  { name: 'Sis Emerencia', phone: '679793707', group: 'Sisters' },
  { name: 'Sis Vanessa', phone: '672476782', group: 'Sisters' },
  { name: 'Br Teriel', phone: '673356549', group: 'Brothers' },
  { name: 'Br Ramson', phone: '653417366', group: 'Brothers' },
  { name: 'Br Brandy', phone: '682396514', group: 'Brothers' },
  { name: 'Sis Franka', phone: '650359501', group: 'Sisters' },
  { name: 'Br Shama', phone: '682108398', group: 'Brothers' },
  { name: 'Ma Vivian', phone: '681023135', group: 'All Members' },
  { name: 'Ma Doris', phone: '674225248', group: 'All Members' },
  { name: 'Br Caleb', phone: '676741870', group: 'Youth' },
  { name: 'Yvette', phone: '678952652', group: 'Youth' },
  { name: 'Sis Mary', phone: '650415624', group: 'Sisters' },
  { name: 'Br Inocent', phone: '653013579', group: 'Brothers' },
  { name: 'Sis Elizabeth', phone: '671659072', group: 'Sisters' },
  { name: 'Mummy Syvian', phone: '650935046', group: 'All Members' },
  { name: 'Pastor Derick', phone: '672723842', group: 'All Members' },
  { name: 'Sis Favour W', phone: '679559084', group: 'Sisters' },
  { name: 'Sis Confidence', phone: '652156589', group: 'Sisters' },
  { name: 'Sis Esther', phone: '670933143', group: 'Sisters' },
  { name: 'Sis Faith', phone: '671606715', group: 'Sisters' },
  { name: 'Br Abenego', phone: '679769999', group: 'Brothers' },
  { name: 'Sis Hilda', phone: '688559753', group: 'Sisters' },
  { name: 'Sis Minet', phone: '679983224', group: 'Sisters' },
  { name: 'Sis Shanis', phone: '675034033', group: 'Choir' },
  { name: 'Sis Linda', phone: '651059252', group: 'Sisters' },
  { name: 'Sis Paoula', phone: '650136288', group: 'Sisters' },
  { name: 'Br Bless', phone: '671063339', group: 'Brothers' },
  { name: 'Br Christian', phone: '652070823', group: 'Brothers' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create admin user
    const existingAdmin = await User.findOne({ email: 'admin@grafam.org' });
    if (!existingAdmin) {
      await User.create({ name: 'GRAFAM Admin', email: 'admin@grafam.org', password: 'grafam2024', role: 'admin' });
      console.log('✅ Admin user created: admin@grafam.org / grafam2024');
    }

    // Create Pastor
    const existingPastor = await User.findOne({ email: 'pastor@grafam.org' });
    if (!existingPastor) {
      await User.create({ name: 'Pastor Derick', email: 'pastor@grafam.org', password: 'pastor2024', role: 'pastor' });
      console.log('✅ Pastor user created: pastor@grafam.org / pastor2024');
    }

    // Import members
    let inserted = 0, skipped = 0;
    for (const m of CHURCH_MEMBERS) {
      const exists = await Member.findOne({ phone: m.phone });
      if (!exists) { await Member.create({ ...m, status: 'active' }); inserted++; }
      else skipped++;
    }
    console.log(`✅ Members: ${inserted} inserted, ${skipped} already existed`);
    console.log('🎉 GRAFAM database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
