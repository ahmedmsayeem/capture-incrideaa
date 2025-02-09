/**
 * Decline Email Service
 * Handles sending decline notification emails for removal requests
 */

import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

/**
 * Email transport configuration
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * API handler for sending decline emails
 * @param req - Contains recipient email
 * @param res - API response
 */
const sendEmail = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email } = req.body;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Capture Removal Request – Capture Incridea',
    html: `
      <html>
      <head>
          <style>
          /* Default styles for light mode */
          body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              padding: 20px;
          }

          .container {
              background-color: #ffffff;
              padding: 30px 40px;
              border-radius: 10px;
              max-width: 600px;
              margin: 0 auto;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }

          h2 {
              text-align: center;
              color: #333333;
              font-size: 24px;
              font-weight: 600;
          }

          p {
              color: #333;
              font-size: 16px;
              line-height: 1.6;
          }

          .footer {
              margin-top: 40px;
              text-align: center;
              border-top: 1px solid #ccc;
              padding-top: 20px;
          }

          /* Dark mode styles */
          @media (prefers-color-scheme: dark) {
              body {
              background-color: #1c1c1c;
              color: #ddd;
              }

              .container {
              background-color: #121212;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
              }

              h2 {
              color: #ffffff;
              }

              p {
              color: #ddd;
              }

              .footer p {
              color: #888;
              }
          }
          </style>
      </head>
      <body>
          <div class="container">
              <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 20px;">
                  <img src="https://utfs.io/f/0yks13NtToBirbmdl9IUcBmoP98lMs3ZrOe2aL4VD1dpYAwj" alt="Incridea Logo" style="width: 120px; height: auto; display: block; margin: 0 auto;" />
              </div>
              <h2> Capture Removal Request - Capture Incridea</h2>
              <p>Hello,</p>
              <p>We have reviewed your request to remove the capture from our website. After careful consideration, we regret to inform you that your request could not be approved at this time.</p>
              <p>We understand that this might be disappointing, but after reviewing your request identiy and reason provided in the description, we are unable to fulfill this request.</p>
              <p>We truly value your feedback and respect your privacy. If you have any additional questions or concerns, please feel free to reach out to us. We are happy to assist you further.</p>
              <p>Thank you for your understanding and cooperation.</p>
              <div class="footer">
                  <p>Thank you,</p>
                  <p>Team Capture Incridea</p>
              </div>
          </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error sending email:', error.message);
      return res.status(500).json({ error: error.message || 'Failed to send OTP' });
    } else {
      console.error('Unknown error:', error);
      return res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

export default sendEmail;
