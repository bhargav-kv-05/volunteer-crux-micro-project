import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Error fetching profile" }, { status: 500 });
    }
}

// ... (imports remain)
import bcrypt from "bcryptjs";

// ... (GET remains same)

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, skills, avatar, password } = body;

        await connectToDatabase();

        // Build update object dynamically
        const updateData: any = {};
        if (name) updateData.name = name;
        if (skills) updateData.skills = skills;
        if (avatar !== undefined) updateData.avatar = avatar;

        // Handle Password Update
        if (password) {
            // Hash the new password
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        // Update user
        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        revalidatePath("/dashboard/profile");
        return NextResponse.json({ message: "Profile updated successfully", user: updatedUser }, { status: 200 });

    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ message: "Error updating profile" }, { status: 500 });
    }
}
