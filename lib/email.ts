
import nodemailer from "nodemailer";

export async function sendVerificationEmail(to: string, token: string) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // App Password, NOT regular password
        },
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
