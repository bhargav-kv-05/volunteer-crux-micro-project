import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ message: "Token is required." }, { status: 400 });
        }

        await connectToDatabase();

        // Find user with matching token and check if it's not expired
        const user = await User.findOne({
            verifyToken: token,
            verifyTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Invalid or expired verification token." },
                { status: 400 }
            );
        }

        // Verify user and clear token
        user.isVerified = true;
        user.verifyToken = undefined;
        user.verifyTokenExpiry = undefined;
        await user.save();

        return NextResponse.json({ message: "Email verified successfully!" }, { status: 200 });
    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json(
            { message: "An error occurred during verification." },
            { status: 500 }
        );
    }
}
