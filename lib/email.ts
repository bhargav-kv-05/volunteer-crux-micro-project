export async function sendVerificationEmail(to: string, token: string): Promise<{ success: boolean; error?: string }> {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
    const brevoApiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.EMAIL_USER || "bhargavkv05@gmail.com";

    if (!brevoApiKey) {
        console.error("❌ BREVO_API_KEY is not set.");
        return { success: false, error: "Email configuration missing." };
    }

    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": brevoApiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sender: { name: "Volunteer Crux", email: senderEmail },
                to: [{ email: to }],
                subject: "Verify Your Email - Volunteer Crux",
                htmlContent: `
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
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }

        console.log(`✅ Verification email sent to ${to} via Brevo`);
        return { success: true };
    } catch (error: any) {
        console.error("❌ Error sending verification email (Brevo):", error);
        return { success: false, error: error.message || "Unknown error" };
    }
}

export async function sendPasswordResetEmail(to: string, token: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    const brevoApiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.EMAIL_USER || "bhargavkv05@gmail.com";

    if (!brevoApiKey) {
        console.error("❌ BREVO_API_KEY is not set.");
        return false;
    }

    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": brevoApiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sender: { name: "Volunteer Crux Support", email: senderEmail },
                to: [{ email: to }],
                subject: "Reset Your Password - Volunteer Crux",
                htmlContent: `
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
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }

        console.log(`✅ Password reset email sent to ${to} via Brevo`);
        return true;
    } catch (error) {
        console.error("❌ Error sending password reset email (Brevo):", error);
        return false;
    }
}
