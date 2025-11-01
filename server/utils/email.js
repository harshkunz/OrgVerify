// const nodemailer = require('nodemailer');
// const dotenv = require('dotenv');
// dotenv.config();

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'madishamadiso00@gmail.com',
//     pass: 'dpvd xwgr sxlw gptp',
//   }
// });

// exports.sendVerificationEmail = async (email, code) => {
//   try {
//     const mailOptions = {
//       from: `"Your App Name" <madishamadiso00@gmail.com}>`,
//       to: email,
//       subject: 'Email Verification',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #2563eb;">Verify Your Email</h2>
//           <p>Please use the following verification code to complete your registration:</p>
//           <div style="background: #f3f4f6; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 2px; margin: 20px 0;">
//             ${code}
//           </div>
//           <p>This code will expire in 24 hours.</p>
//         </div>
//       `
//     };

//     await transporter.sendMail(mailOptions);
//   } catch (error) {
//     console.error('Error sending verification email:', error);
//     throw new Error('Failed to send verification email');
//   }
// };


const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'madishamadiso00@gmail.com',
    pass: 'dpvd xwgr sxlw gptp',
  }
});


exports.sendVerificationEmail = async (email, code) => {
  const appName = process.env.APP_NAME || 'Bonga University GCVS';
  const supportEmail = process.env.SUPPORT_EMAIL || 'madishamadiso00@gmail.com';
  const expiryHours = process.env.CODE_EXPIRY_HOURS || 24;

  try {
    const mailOptions = {
      from: `"${appName}" <${process.env.EMAIL_USER || 'madishamadiso00@gmail.com'}>`,
      to: email,
      subject: '🔐 Email Verification',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { color: #2563eb; font-size: 24px; font-weight: 600; margin-bottom: 20px; }
            .code-container { background: #f8fafc; padding: 15px; text-align: center; font-size: 28px; letter-spacing: 3px; margin: 25px 0; border-radius: 8px; border: 1px dashed #cbd5e1; }
            .footer { margin-top: 30px; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="header">Verify Your Email Address</div>
          <p>Thank you for registering with ${appName}! To complete your registration, please use the following verification code:</p>
          
          <div class="code-container">${code}</div>
          
          <p>This code will expire in ${expiryHours} hours. If you didn't request this, please ignore this email or contact support.</p>
          
          <div class="footer">
            <p>Best regards,<br>The ${appName} Team</p>
            <p>Need help? Contact us at <a href="mailto:${supportEmail}">${supportEmail}</a></p>
          </div>
        </body>
        </html>
      `,
      text: `Verify your email with ${appName}. Your verification code is: ${code}. This code expires in ${expiryHours} hours.`
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    
    console.log(`📧 Verification email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email. Please try again later.');
  }
};


// reset password - send reset code.
exports.sendPasswordResetEmail = async (email, code) => {
  const appName = process.env.APP_NAME || 'Bonga University GCVS';
  const supportEmail = process.env.SUPPORT_EMAIL || 'madishamadiso00@gmail.com';
  const expiryHours = process.env.CODE_EXPIRY_HOURS || 24;
  const resetLink = process.env.RESET_PAGE_URL 
    ? `${process.env.RESET_PAGE_URL}?token=${code}` 
    : null;

  try {
    const mailOptions = {
      from: `"${appName} Support" <${process.env.EMAIL_USER || 'madishamadiso00@gmail.com'}>`,
      to: email,
      subject: '🔒 Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { 
              font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              color: #dc3545; 
              font-size: 24px; 
              font-weight: 600; 
              margin-bottom: 20px;
            }
            .code-container { 
              background: #f8f9fa; 
              padding: 15px; 
              text-align: center; 
              font-size: 28px; 
              letter-spacing: 3px; 
              margin: 25px 0; 
              border-radius: 8px; 
              border: 1px dashed #dee2e6;
              font-family: monospace;
            }
            .footer { 
              margin-top: 30px; 
              font-size: 14px; 
              color: #6c757d; 
              border-top: 1px solid #e9ecef; 
              padding-top: 15px; 
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #dc3545;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 15px 0;
            }
            .instructions {
              background: #f1f8fe;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">Password Reset Request</div>
          
          <p>We received a request to reset your password for your ${appName} account.</p>
          
          <div class="instructions">
            <strong>To reset your password:</strong>
            <ol>
              <li>Enter the verification code below on the password reset page</li>
              ${resetLink ? `<li>Or <a href="${resetLink}" class="button">Click here to reset password</a></li>` : ''}
              <li>Create a new secure password</li>
            </ol>
          </div>
          
          <div class="code-container">${code}</div>
          
          <p><strong>Important:</strong> This code will expire in ${expiryHours} hours.</p>
          <p>If you didn't request this password reset, please secure your account by changing your password immediately or contact our support team.</p>
          
          <div class="footer">
            <p>For your security, never share this code with anyone.</p>
            <p>Best regards,<br>The ${appName} Security Team</p>
            <p>Need help? Contact us at <a href="mailto:${supportEmail}">${supportEmail}</a></p>
          </div>
        </body>
        </html>
      `,
      text: `Password Reset Request for ${appName}\n\n` +
            `We received a request to reset your password. Use this verification code:\n\n` +
            `${code}\n\n` +
            `${resetLink ? `Or visit this link to reset: ${resetLink}\n\n` : ''}` +
            `This code expires in ${expiryHours} hours.\n\n` +
            `If you didn't request this, please secure your account.\n\n` +
            `The ${appName} Team\n` +
            `Support: ${supportEmail}`
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Password reset email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Failed to send password reset email. Please try again later.');
  }
};