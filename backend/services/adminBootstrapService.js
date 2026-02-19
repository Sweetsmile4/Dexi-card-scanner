const User = require('../models/User');

async function ensureAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@dexi.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminName = process.env.ADMIN_NAME || 'Admin User';
  const resetPassword = String(process.env.ADMIN_RESET_PASSWORD_ON_STARTUP || 'false').toLowerCase() === 'true';

  const existingAdmin = await User.findOne({ email: adminEmail }).select('+password');

  if (!existingAdmin) {
    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isActive: true
    });
    console.log(`✅ Admin user created: ${adminEmail}`);
    return;
  }

  let changed = false;

  if (existingAdmin.role !== 'admin') {
    existingAdmin.role = 'admin';
    changed = true;
  }

  if (!existingAdmin.isActive) {
    existingAdmin.isActive = true;
    changed = true;
  }

  if (resetPassword) {
    existingAdmin.password = adminPassword;
    changed = true;
  }

  if (changed) {
    await existingAdmin.save();
    console.log(`✅ Admin user updated: ${adminEmail}`);
  } else {
    console.log(`ℹ️ Admin user verified: ${adminEmail}`);
  }
}

module.exports = {
  ensureAdminUser
};
