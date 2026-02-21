import { getAdminClient } from '../src/lib/supabase'
import { sendEmail } from '../src/lib/email'

async function main() {
    console.log('Starting CLI Announcement notification script...')

    const supabase = getAdminClient() as any

    console.log('Fetching subscribed users...')
    const { data: users, error } = await supabase
        .from('users')
        .select('username, email, notification')
        .contains('notification', ['CLI_ANNOUNCEMENT'])

    if (error) {
        console.error('Error fetching users:', error)
        process.exit(1)
    }

    if (!users || users.length === 0) {
        console.log('No users are currently subscribed to CLI announcements.')
        return
    }

    console.log(`Found ${users.length} subscribed users. Preparing to send announcements...`)

    const subject = 'SitePlod CLI is Now Available! 🚀'

    let successCount = 0
    let failCount = 0

    for (const user of users) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SitePlod CLI Release</title>
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
      <h1>Hello, ${user.username}! 🎉</h1>
      
      <p>The wait is over. The <span class="highlight">SitePlod CLI</span> is officially here!</p>
      
      <p>You can now deploy directly from your terminal and integrate SitePlod easily into your CI/CD pipelines!</p>
      
      <div class="divider"></div>
      
      <div class="features">
        <h2 style="color: #D4AF37; font-size: 20px; margin-top: 0;">How to use it:</h2>
        
        <div class="feature-item">
          <span class="feature-icon">✨</span>
          <strong style="color: #D4AF37;">Run the deploy command</strong>
          <p style="margin-left: 30px; margin-bottom: 0px; font-family: monospace; color: #888;">$ npx siteplod deploy ./dist</p>
        </div>
        
        <div class="feature-item">
          <span class="feature-icon">⚙️</span>
          <strong style="color: #D4AF37;">CI/CD Integration</strong> – Automate deployments seamlessly using GitHub Actions and GitLab CI.
        </div>
        
      </div>
      
      <div class="divider"></div>
      
      <p style="text-align: center;">
        <a href="https://siteplod.vercel.app" class="cta-button" style="color: #0A0A0A;">View Documentation</a>
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
Hello ${user.username}!

The wait is over. The SitePlod CLI is officially here!

You can now deploy directly from your terminal and integrate SitePlod easily into your CI/CD pipelines!

Run the deploy command:
$ npx siteplod deploy ./dist

Enjoy automated deployments seamlessly using GitHub Actions and GitLab CI.

Check out the documentation at: https://siteplod.vercel.app

---
SitePlod - Deploy Static Sites Instantly
Created by Uzair Mughal (@uzairdeveloper223)
uzair.is-a.dev | contact@uzair.is-a.dev
    `

        // Send email
        const result = await sendEmail({
            to: user.email,
            subject,
            html,
            text,
        })

        if (result) {
            console.log(`✅ Sent CLI announcement to ${user.email}`)
            successCount++

            // Remove the CLI_ANNOUNCEMENT flag
            const currentNotifications = user.notification || []
            const updatedNotifications = currentNotifications.filter((n: string) => n !== 'CLI_ANNOUNCEMENT')

            const { error: updateError } = await supabase
                .from('users')
                .update({
                    notification: updatedNotifications,
                    cli_announced: true
                })
                .eq('email', user.email)

            if (updateError) {
                console.error(`⚠️ Failed to remove CLI_ANNOUNCEMENT flag for ${user.email}:`, updateError)
            } else {
                console.log(`🧹 Removed CLI_ANNOUNCEMENT flag for ${user.email}`)
            }
        } else {
            console.error(`❌ Failed to send to ${user.email}`)
            failCount++
        }
    }

    console.log('---')
    console.log('Notification Summary:')
    console.log(`Total Delivered: ${successCount}`)
    console.log(`Failed to Deliver: ${failCount}`)
    console.log('Done.')
}

main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
})
