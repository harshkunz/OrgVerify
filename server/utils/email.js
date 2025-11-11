const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();


const cleanEmailPass = process.env.EMAIL_PASS.replace(/\s/g, '');


// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'orgverify@gmail.com',
    pass: 'ivqi nyso mycy pcoa',
  },
});


// Send verification email
exports.sendVerificationEmail = async (email, code) => {
  const appName = process.env.APP_NAME || 'Your App';
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;
  const expiryHours = process.env.CODE_EXPIRY_HOURS || 24;

  try {
    const mailOptions = {
      from: `"${appName}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Verify Your Email</h2>
          <p>Thank you for registering with ${appName}! To complete your registration, please use the following verification code:</p>
          <div style="background: #f8fafc; padding: 15px; text-align: center; font-size: 28px; letter-spacing: 3px; margin: 25px 0; border-radius: 8px; border: 1px dashed #cbd5e1;">
            ${code}
          </div>
          <p>This code will expire in ${expiryHours} hours. If you didn't request this, please ignore this email or contact support.</p>
          <p>Best regards,<br>The ${appName} Team</p>
          <p>Need help? Contact us at <a href="mailto:${supportEmail}">${supportEmail}</a></p>
        </div>
      `,
      text: `Verify your email with ${appName}. Your verification code is: ${code}. This code expires in ${expiryHours} hours.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email. Please try again later.');
  }
};


// Send password reset email
exports.sendPasswordResetEmail = async (email, code) => {
  const appName = process.env.APP_NAME || 'Your App';
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;
  const expiryHours = process.env.CODE_EXPIRY_HOURS || 24;
  const resetLink = process.env.RESET_PAGE_URL ? `${process.env.RESET_PAGE_URL}?token=${code}` : null;

  try {
    const mailOptions = {
      from: `"${appName} Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔒 Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Password Reset Request</h2>
          <p>We received a request to reset your password for your ${appName} account.</p>
          <p><strong>To reset your password:</strong></p>
          <ol>
            <li>Enter the verification code below on the password reset page</li>
            ${resetLink ? `<li>Or <a href="${resetLink}">Click here to reset password</a></li>` : ''}
            <li>Create a new secure password</li>
          </ol>
          <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 28px; letter-spacing: 3px; margin: 25px 0; border-radius: 8px; border: 1px dashed #dee2e6; font-family: monospace;">
            ${code}
          </div>
          <p><strong>Important:</strong> This code will expire in ${expiryHours} hours.</p>
          <p>If you didn't request this password reset, please secure your account by changing your password immediately or contact our support team.</p>
          <p>For your security, never share this code with anyone.</p>
          <p>Best regards,<br>The ${appName} Security Team</p>
          <p>Need help? Contact us at <a href="mailto:${supportEmail}">${supportEmail}</a></p>
        </div>
      `,
      text: `Password Reset Request for ${appName}\n\nUse this verification code to reset your password:\n\n${code}\n\n${resetLink ? `Or visit this link: ${resetLink}\n\n` : ''}This code expires in ${expiryHours} hours.\n\nIf you didn't request this, please secure your account.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email. Please try again later.');
  }
};
