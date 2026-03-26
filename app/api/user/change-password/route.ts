import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!newPassword) {
            return NextResponse.json({ message: "New password is required." }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ message: "New password must be at least 6 characters." }, { status: 400 });
        }

        await connectToDatabase();
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        // Verify current password ONLY if the user already has one (e.g. they didn't sign up exclusively with OAuth)
        if (user.password) {
            if (!currentPassword) {
                return NextResponse.json({ message: "Current password is required to change it." }, { status: 400 });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return NextResponse.json({ message: "Incorrect current password." }, { status: 400 });
            }
        }
        // If !user.password, the user is natively "Setting" their password for the very first time! Bypass legacy checks.

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        // Clear reset tokens if any, just in case
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return NextResponse.json({ message: "Password updated successfully." }, { status: 200 });

    } catch (error) {
        console.error("Change Password Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
