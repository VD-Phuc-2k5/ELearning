import { Injectable, Logger } from '@nestjs/common';
import { IEmailService } from '../../application/interfaces/i-email.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NodemailerEmailService implements IEmailService {
  private readonly logger = new Logger(NodemailerEmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
      });
      this.logger.log(`SMTP Transporter initialized for host: ${host}`);
    } else {
      this.logger.warn(
        'SMTP configuration is missing from environment. Emails will only be logged to console.',
      );
    }
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const from =
      process.env.SMTP_FROM || '"ELearning" <no-reply@elearning.com>';
    const subject = 'Đặt lại mật khẩu - ELearning';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Đặt lại mật khẩu của bạn</h2>
        <p>Xin chào,</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản ELearning của mình.</p>
        <p>Vui lòng click vào nút bên dưới để tiến hành đặt lại mật khẩu. Link này chỉ có hiệu lực trong vòng <strong>10 phút</strong> và chỉ sử dụng được <strong>1 lần duy nhất</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Đặt lại mật khẩu</a>
        </div>
        <p>Nếu không click được nút trên, bạn có thể copy link sau dán vào trình duyệt:</p>
        <p style="word-break: break-all; color: #64748b;">${resetLink}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này an toàn.</p>
      </div>
    `;

    // Developer console log (always printed to facilitate testing)
    console.log('\n=================== MOCK EMAIL SENT ===================');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log('=======================================================\n');

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html,
        });
        this.logger.log(`Password reset email sent successfully to ${to}`);
      } catch (error) {
        this.logger.error(
          `Failed to send password reset email to ${to}:`,
          error,
        );
      }
    }
  }
}
