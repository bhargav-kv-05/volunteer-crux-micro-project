import nodemailer from "nodemailer";

// Helper to safely format the base URL and avoid double trailing slashes (//verify-email)
function getBaseUrl() {
    return process.env.NEXTAUTH_URL?.replace(/\/$/, '') || "http://localhost:3000";
}

export async function sendVerificationEmail(to: string, token: string): Promise<{ success: boolean; error?: string }> {
    const baseUrl = getBaseUrl();
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
    const userEmail = process.env.EMAIL_USER || "bhargavkv05@gmail.com";
    
    // Safely parse the password. Google App passwords often copy with spaces (e.g. "pxct ujcc wgjw cnir"). 
    // We strip all spaces here to guarantee Nodemailer's SMTP authentication doesn't fail.
    const appPassword = process.env.EMAIL_PASS?.replace(/\s+/g, '');

    if (!appPassword) {
        console.error("❌ EMAIL_PASS is not set.");
        return { success: false, error: "Email configuration missing." };
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: userEmail,
            pass: appPassword,
        },
    });

    try {
        await transporter.sendMail({
            from: `"Volunteer Crux" <${userEmail}>`,
            to: to,
            subject: "Verify Your Email - Volunteer Crux",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #4CAF50;">Welcome to Volunteer Crux!</h2>
                  <p>Hello,</p>
                  <p>Thank you for registering. Please verify your email address to get started.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
                  </div>
                  <p>Or click this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
                  <p>This link will expire in 24 hours.</p>
                </div>
            `
        });

        console.log(`✅ Verification email sent to ${to} via Gmail`);
        return { success: true };
    } catch (error: any) {
        console.error("❌ Error sending verification email (Gmail):", error);
        return { success: false, error: error.message || "Unknown error" };
    }
}

export async function sendPasswordResetEmail(to: string, token: string) {
    const baseUrl = getBaseUrl();
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    const userEmail = process.env.EMAIL_USER || "bhargavkv05@gmail.com";
    const appPassword = process.env.EMAIL_PASS?.replace(/\s+/g, '');

    if (!appPassword) {
        console.error("❌ EMAIL_PASS is not set.");
        return false;
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: userEmail,
            pass: appPassword,
        },
    });

    try {
        await transporter.sendMail({
            from: `"Volunteer Crux Support" <${userEmail}>`,
            to: to,
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
            `
        });

        console.log(`✅ Password reset email sent to ${to} via Gmail`);
        return true;
    } catch (error) {
        console.error("❌ Error sending password reset email (Gmail):", error);
        return false;
    }
}
