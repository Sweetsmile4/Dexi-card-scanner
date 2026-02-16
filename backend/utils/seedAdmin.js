require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dexi.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
      console.log(`   Role: ${existingAdmin.role}`);
      
      // Update role to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated user role to admin');
      }
    } else {
      // Create admin user
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isActive: true
      });

      console.log('✅ Admin user created successfully!');
      console.log('');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      console.log('');
      console.log('⚠️  IMPORTANT: Please change the password after first login!');
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
