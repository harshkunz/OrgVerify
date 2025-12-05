const express = require('express'); 
const { googleOAuthCallback, register, verifyEmail, login, verifyLogin, forgotPassword, verifyResetCode, resetPassword,  getMe, logoutUser} =  require('../controllers/authController.js');
const { authenticateUser } = require('../middleware/authMiddleware');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('../utils/passport.js');


// Step 1
router.post('/register', register);
router.post('/verify-email', verifyEmail);

router.get("/logout", logoutUser);


// Login routes
router.post("/login", login);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  googleOAuthCallback
);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);


// Get Current (User / Admin)
router.get('/me', authenticateUser, getMe);


// In your password update endpoint
router.put('/settings/password', authenticateUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // 1. Validate input
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Both current and new passwords are required.'
    });
  }

  // 2. Check new password strength
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'Password must include uppercase, lowercase, numbers, and be at least 8 characters long.'
    });
  }

  try {
    const user = req.user; // ✅ Fix here

    // 3. Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    // 4. Prevent password reuse
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as the current password.'
      });
    }

    // 5. Update password (hash it before saving)
    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordChangedAt = Date.now();

    // 6. (Optional) Invalidate all sessions/tokens
    user.tokens = [];

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.'
    });

  } catch (error) {
    console.error('Password update error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});



module.exports = router;