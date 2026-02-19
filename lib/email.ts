
import nodemailer from "nodemailer";

export async function sendVerificationEmail(to: string, token: string) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS?.replace(/\s+/g, ""),
        },
        tls: {
            rejectUnauthorized: false // Helps with some cloud server SSL issues
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

    const mailOptions = {
        from: `"Volunteer Crux Support" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Verify Your Email - Volunteer Crux",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Welcome to Volunteer Crux!</h2>
                <p>Hello,</p>
                <p>Thank you for registering. Please verify your email address to activate your account.</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
                </p>
                <p>If the button doesn't work, copy and paste this link:</p>
                <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                <p>This link expires in 24 hours.</p>
                <br>
                <p>Best regards,<br>The Volunteer Crux Team</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent for to ${to}`);
        return true;
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return false;
    }
}

export async function sendPasswordResetEmail(to: string, token: string) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS?.replace(/\s+/g, ""),
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    const mailOptions = {
        from: `"Volunteer Crux Support" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Reset Your Password - Volunteer Crux",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </p>
                <p>Or copy and paste this link:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>This link expires in 1 hour.</p>
                <br>
                <p>Best regards,<br>The Volunteer Crux Team</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${to}`);
        return true;
    } catch (error) {
        console.error("❌ Error sending password reset email:", error);
        return false;
    }
}
