import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        await connectToDatabase();
        const user = await User.findOne({ email });

        if (!user) {
            // Rate limiting/Security: Don't reveal if user exists or not
            return NextResponse.json({ message: "If an account exists for that email, we have sent password reset instructions." }, { status: 200 });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        // Token expires in 1 hour
        const passwordResetExpires = Date.now() + 3600000;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = passwordResetExpires;
        await user.save();

        // Send real email
        const emailSent = await sendPasswordResetEmail(user.email, resetToken);

        if (!emailSent) {
            console.error("Failed to send password reset email.");
            // We still return 200 to user to avoid leaking system state, but log the error
        }

        return NextResponse.json({ message: "If an account exists for that email, we have sent password reset instructions." }, { status: 200 });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
