import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

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

        // 5. Create the User
        await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "volunteer", // Default to volunteer if no role sent
        });

        return NextResponse.json(
            { message: "User registered successfully." },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "An error occurred while registering the user." },
            { status: 500 }
        );
    }
}