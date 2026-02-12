import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ message: "Token and password are required" }, { status: 400 });
        }

        await connectToDatabase();

        // Find user with valid token and expiry
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, // Expiry must be in the future
        });

        if (!user) {
            return NextResponse.json({ message: "Password reset token is invalid or has expired." }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return NextResponse.json({ message: "Password has been reset successfully." }, { status: 200 });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
