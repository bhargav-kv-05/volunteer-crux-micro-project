import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json();

        // 1. Validate data
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "All fields are required." },
                { status: 400 }
            );
        }

        // 2. Connect to DB
        await connectToDatabase();

        // 3. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists." },
                { status: 400 }
            );
        }

        // 4. Hash the password (Security!)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Create Verification Token
        const crypto = require("crypto");
        const verifyToken = crypto.randomBytes(32).toString("hex");
        const verifyTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // 6. Create the User (Unverified)
        await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "volunteer",
            isVerified: false,
            verifyToken,
            verifyTokenExpiry,
        });

        // 7. Send Real Verification Email
        const emailSent = await sendVerificationEmail(email, verifyToken);

        if (!emailSent) {
            return NextResponse.json(
                { message: "Registration successful, but failed to send verification email." },
                { status: 201 } // Still created user, just email failed
            );
        }

        return NextResponse.json(
            { message: "Registration successful! Please check your email to verify your account." },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "An error occurred while registering the user." },
            { status: 500 }
        );
    }
}