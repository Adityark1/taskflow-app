const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
// FIXED: Pointing exactly to your folder structure
const db = require('../db/database'); 

// 1. UPDATE PROFILE INFORMATION (Username & Email)
router.put('/update-info', (req, res) => {
  const { userId, username, email } = req.body;

  if (!userId || !username || !email) {
    return res.status(400).json({ message: 'Missing required profile parameters.' });
  }

  try {
    const emailCheck = db.prepare('SELECT id FROM users WHERE email = ? AND id <> ?').get(email, userId);
    
    if (emailCheck) {
      return res.status(400).json({ message: 'This email is already linked to another account.' });
    }

    const infoUpdate = db.prepare('UPDATE users SET username = ?, email = ? WHERE id = ?').run(username, email, userId);

    if (infoUpdate.changes === 0) {
      console.log(`⚠️ UPDATE FAILED: No user found with ID ${userId}`);
      return res.status(404).json({ message: 'User not found in database.' });
    }

    console.log(`👉 DATABASE UPDATE SUCCESS: ID ${userId} updated to ${username}`);
    res.json({ message: 'Profile information synchronized successfully.' });

  } catch (err) {
    console.error('Database Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 2. UPDATE PASSWORD
router.put('/update-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'All security fields must be populated.' });
  }

  try {
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Authentication failed: Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const encryptedNewPassword = await bcrypt.hash(newPassword, salt);

    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(encryptedNewPassword, userId);

    console.log(`🔒 PASSWORD UPDATE SUCCESS: Security keys re-encrypted for user ID ${userId}`);
    res.json({ message: 'Security keys re-encrypted and saved successfully.' });

  } catch (err) {
    console.error('Database Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;