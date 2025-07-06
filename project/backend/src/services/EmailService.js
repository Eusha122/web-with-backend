const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendThankYouEmail(email, name) {
    const mailOptions = {
      from: `"Eusha Ibna Akbor" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for visiting my portfolio! 🚀',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank You!</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #0ea5e9, #d946ef); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
            .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #0ea5e9, #d946ef); color: white; text-decoration: none; border-radius: 25px; margin: 10px 0; }
            .social-links { margin: 20px 0; }
            .social-links a { margin: 0 10px; color: #0ea5e9; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You, ${name}! 🎉</h1>
              <p>I'm thrilled you visited my portfolio</p>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              
              <p>Thank you so much for taking the time to visit my portfolio website and signing the visitor book! It means a lot to me that you're interested in my work and journey as a tech enthusiast.</p>
              
              <p>As a high school student from Bangladesh passionate about technology and coding, I'm always excited to connect with people who share similar interests or are curious about what I'm building.</p>
              
              <h3>What's Next?</h3>
              <ul>
                <li>🎮 <strong>Play Chess:</strong> Challenge me to a game on my website!</li>
                <li>💻 <strong>Explore Projects:</strong> Check out my latest coding projects</li>
                <li>📝 <strong>Read My Blog:</strong> Follow my learning journey and thoughts on tech</li>
                <li>🤝 <strong>Connect:</strong> Feel free to reach out if you want to collaborate or chat</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}" class="btn">Visit My Portfolio</a>
              </div>
              
              <p>If you have any questions, project ideas, or just want to say hello, don't hesitate to reply to this email. I love hearing from visitors!</p>
              
              <p>Keep exploring, keep learning! 🚀</p>
              
              <p>Best regards,<br>
              <strong>Eusha Ibna Akbor</strong><br>
              <em>Tech Explorer • Future Engineer • Dreamer</em></p>
              
              <div class="social-links">
                <a href="https://github.com/Eusha122">GitHub</a> |
                <a href="https://www.facebook.com/eusha.ibna.akbor">Facebook</a> |
                <a href="https://www.instagram.com/eusha_hehe/">Instagram</a>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent because you signed my visitor book at <a href="${process.env.FRONTEND_URL}">who-is-eusha.netlify.app</a></p>
              <p>Rajshahi, Bangladesh 🇧🇩</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendContactEmail(name, email, message) {
    // Send email to Eusha
    const mailToEusha = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <p><em>Sent from portfolio contact form</em></p>
      `
    };

    // Send auto-reply to sender
    const autoReply = {
      from: `"Eusha Ibna Akbor" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thanks for reaching out! 🚀',
      html: `
        <h2>Hi ${name}!</h2>
        <p>Thank you for your message! I've received your email and will get back to you as soon as possible.</p>
        <p>In the meantime, feel free to explore my portfolio and maybe challenge me to a game of chess! 😊</p>
        <p>Best regards,<br>Eusha Ibna Akbor</p>
        <hr>
        <p><em>Your message:</em></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
      `
    };

    await Promise.all([
      this.transporter.sendMail(mailToEusha),
      this.transporter.sendMail(autoReply)
    ]);
  }
}

module.exports = new EmailService();