import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('GMAIL'),
        pass: this.configService.get<string>('APP_PASS'),
      },
    });
  }

  async sendConfirmationEmail(email: string, confirmationLink: string) {
    const mailOptions = {
      from: `"Hotel Booking" <${this.configService.get<string>('GMAIL_USER')}>`,
      to: email,
      subject: 'Confirm Your Booking',
      html: `
        <h2>Hotel Booking Confirmation</h2>
        <p>Click the button below to confirm your booking:</p>
        <a href="${confirmationLink}" style="background-color: blue; color: white; padding: 10px 20px; margin: 5px 15px; text-decoration: none;">Confirm Booking</a>
        <p>If you did not request this booking, please ignore this email.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return 'Confirmation email sent successfully';
    } catch (error) {
      console.error('Error sending email:', error);
      throw new BadRequestException('Failed to send confirmation email');
    }
  }
}
