/**
 * Email Service using Nodemailer
 * 
 * Sends transactional emails for user registration, password resets, etc.
 */

import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Create email transporter using SMTP credentials from environment
 */
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpFrom = process.env.SMTP_FROM || 'contact@uzair.is-a.dev'

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    console.warn('SMTP credentials not configured. Emails will not be sent.')
    return null
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transporter = createTransporter()

  if (!transporter) {
    console.error('Email transporter not configured')
    return false
  }

  try {
    const smtpFrom = process.env.SMTP_FROM || 'SitePlod <contact@uzair.is-a.dev>'

    await transporter.sendMail({
      from: smtpFrom,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    console.log(`Email sent successfully to ${options.to}`)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

/**
 * Send welcome email to newly registered user
 */
export async function sendWelcomeEmail(email: string, username: string): Promise<boolean> {
  const subject = 'Welcome to SitePlod! 🚀'

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SitePlod</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #F2F0E4;
      background-color: #0A0A0A;
      margin: 0;
      padding: 0;
    }
    .email-wrapper {
      background-color: #0A0A0A;
      padding: 40px 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0A0A0A;
    }
    .header {
      background: linear-gradient(135deg, #141414 0%, #1A1A1A 100%);
      border: 2px solid rgba(212, 175, 55, 0.3);
      padding: 40px 20px;
      text-align: center;
      position: relative;
    }
    .header::before {
      content: '';
      position: absolute;
      top: 8px;
      right: 8px;
      width: 20px;
      height: 20px;
      border-top: 2px solid #D4AF37;
      border-right: 2px solid #D4AF37;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: 8px;
      left: 8px;
      width: 20px;
      height: 20px;
      border-bottom: 2px solid #D4AF37;
      border-left: 2px solid #D4AF37;
    }
    .logo {
      font-family: 'Georgia', serif;
      font-size: 36px;
      color: #D4AF37;
      text-transform: uppercase;
      letter-spacing: 4px;
      margin: 0;
      text-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
    }
    .tagline {
      color: #888888;
      font-size: 14px;
      margin-top: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .content {
      background-color: #141414;
      border: 1px solid rgba(212, 175, 55, 0.2);
      padding: 40px 30px;
      margin-top: 20px;
    }
    h1 {
      color: #D4AF37;
      font-size: 28px;
      margin-top: 0;
      letter-spacing: 2px;
    }
    p {
      color: #F2F0E4;
      margin: 15px 0;
    }
    .highlight {
      color: #D4AF37;
      font-weight: bold;
    }
    .features {
      background-color: #0A0A0A;
      border: 1px solid rgba(212, 175, 55, 0.2);
      padding: 20px;
      margin: 20px 0;
    }
    .feature-item {
      padding: 10px 0;
      color: #FFFFFF;
      border-bottom: 1px solid rgba(212, 175, 55, 0.1);
    }
    .feature-item:last-child {
      border-bottom: none;
    }
    .feature-icon {
      color: #D4AF37;
      font-size: 20px;
      margin-right: 10px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #D4AF37 0%, #B8960C 100%);
      color: #0A0A0A !important;
      text-decoration: none;
      padding: 18px 50px;
      margin: 30px 0;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: bold;
      font-size: 16px;
      border: 2px solid #D4AF37;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      padding: 30px 20px;
      color: #888888;
      font-size: 12px;
      border-top: 1px solid rgba(212, 175, 55, 0.2);
      margin-top: 30px;
      background-color: #0A0A0A;
    }
    .footer a {
      color: #D4AF37;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5) 50%, transparent);
      margin: 30px 0;
    }
  </style>
</head>
<body style="background-color: #0A0A0A; margin: 0; padding: 0;">
  <div class="email-wrapper">
    <div class="container">
    <div class="header">
      <h1 class="logo">SitePlod</h1>
      <p class="tagline">Deploy Static Sites Instantly</p>
    </div>
    
    <div class="content">
      <h1>Welcome, ${username}! 🎉</h1>
      
      <p>Thank you for joining <span class="highlight">SitePlod</span> – the fastest way to deploy your static websites!</p>
      
      <p>Your account has been successfully created, and you're now ready to start deploying your sites to the web in seconds.</p>
      
      <div class="divider"></div>
      
      <div class="features">
        <h2 style="color: #D4AF37; font-size: 20px; margin-top: 0;">What You Can Do:</h2>
        
        <div class="feature-item">
          <span class="feature-icon">🚀</span>
          <strong style="color: #D4AF37;">Instant Deployment</strong> – Upload HTML, CSS, JS files or ZIP archives
        </div>
        
        <div class="feature-item">
          <span class="feature-icon">✏️</span>
          <strong style="color: #D4AF37;">Live Editor</strong> – Edit your site's code directly in the browser
        </div>
        
        <div class="feature-item">
          <span class="feature-icon">📊</span>
          <strong style="color: #D4AF37;">Analytics</strong> – Track views and engagement for your sites
        </div>
        
        <div class="feature-item">
          <span class="feature-icon">🖼️</span>
          <strong style="color: #D4AF37;">Image Hosting</strong> – Automatic image upload and hosting
        </div>
        
        <div class="feature-item">
          <span class="feature-icon">🔗</span>
          <strong style="color: #D4AF37;">Custom URLs</strong> – Get clean, memorable URLs for your sites
        </div>
      </div>
      
      <div class="divider"></div>
      
      <p style="text-align: center;">
        <a href="https://siteplod.vercel.app" class="cta-button" style="color: #0A0A0A;">Start Deploying Now</a>
      </p>
      
      <p style="font-size: 14px; color: #888888;">
        Need help getting started? Check out our documentation or reach out to us at 
        <a href="mailto:contact@uzair.is-a.dev" style="color: #D4AF37;">contact@uzair.is-a.dev</a>
      </p>
    </div>
    
    <div class="footer">
      <p>
        <strong style="color: #D4AF37;">SitePlod</strong><br>
        Deploy Static Sites Instantly
      </p>
      <p>
        Created by <a href="https://uzair.is-a.dev">Uzair Mughal</a> (@uzairdeveloper223)<br>
        <a href="https://uzair.is-a.dev">uzair.is-a.dev</a> | <a href="mailto:contact@uzair.is-a.dev">contact@uzair.is-a.dev</a>
      </p>
      <p style="margin-top: 20px;">
        <a href="https://siteplod.vercel.app/privacy">Privacy Policy</a> | 
        <a href="https://siteplod.vercel.app/terms">Terms of Service</a>
      </p>
    </div>
  </div>
  </div>
</body>
</html>
  `

  const text = `
Welcome to SitePlod, ${username}!

Thank you for joining SitePlod – the fastest way to deploy your static websites!

Your account has been successfully created, and you're now ready to start deploying your sites to the web in seconds.

What You Can Do:
- 🚀 Instant Deployment – Upload HTML, CSS, JS files or ZIP archives
- ✏️ Live Editor – Edit your site's code directly in the browser
- 📊 Analytics – Track views and engagement for your sites
- 🖼️ Image Hosting – Automatic image upload and hosting
- 🔗 Custom URLs – Get clean, memorable URLs for your sites

Get started now: https://uzair.is-a.dev

Need help? Contact us at contact@uzair.is-a.dev

---
SitePlod - Deploy Static Sites Instantly
Created by Uzair Mughal (@uzairdeveloper223)
uzair.is-a.dev | contact@uzair.is-a.dev
  `

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  })
}
