import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        await connectToDatabase();
        const user = await User.findOne({ email });

        if (!user) {
            // Rate limiting/Security: Don't reveal if user exists or not, but for UX maybe just say "If an account exists..."
            // For now, let's just return success message to prevent enumeration
            return NextResponse.json({ message: "If an account exists for that email, we have sent password reset instructions." }, { status: 200 });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        // Token expires in 1 hour
        const passwordResetExpires = Date.now() + 3600000;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = passwordResetExpires;
        await user.save();

        // Send email (Simulated for MVP)
        // In production, use nodemailer or similar service
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

        console.log(`
        ============================================
        PASSWORD RESET LINK (DEV MODE):
        ${resetUrl}
        ============================================
        `);

        return NextResponse.json({ message: "Password reset link sent to your email." }, { status: 200 });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
