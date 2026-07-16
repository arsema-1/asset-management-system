import nodemailer from 'nodemailer';
import { config } from '../src/config';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  auth: { user: config.smtp.user, pass: config.smtp.pass },
});

async function main() {
  console.log('Testing SMTP connection...');
  console.log(`Host: ${config.smtp.host}:${config.smtp.port}`);
  console.log(`User: ${config.smtp.user ? '***SET***' : 'EMPTY'}`);
  console.log(`Pass: ${config.smtp.pass ? '***SET***' : 'EMPTY'}`);

  try {
    const info = await transporter.sendMail({
      from: `"${config.smtp.fromName}" <${config.smtp.fromAddress}>`,
      to: 'arsemaarse51@gmail.com',
      subject: 'AssetFlow - SMTP Test',
      text: 'This is a test email to verify SMTP is working correctly.',
    });
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ SMTP send failed:', (err as Error).message);
  }
}

main().then(() => process.exit(0));
