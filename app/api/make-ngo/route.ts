import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
    // SECURITY: This route should ONLY be used locally by the developer
    // and deleted before deploying to production!
    
    try {
        await connectToDatabase();
        
        // Find the specific test user and forcefully upgrade their role and verify them
        const user = await User.findOneAndUpdate(
            { email: "crushilsk@gmail.com" },
            { 
                $set: { 
                    role: "ngo", 
                    isVerified: true,
                    // Optionally clear out any pending verification tokens just in case
                    verifyToken: undefined,
                    verifyTokenExpiry: undefined 
                } 
            },
            { new: true }
        );

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User crushilsk@gmail.com not found! Did you sign up yet?" },
                { status: 404 }
            );
        }

        return NextResponse.json({ 
            success: true, 
            message: "Successfully upgraded crushilsk@gmail.com to NGO!", 
            user: { 
                email: user.email, 
                role: user.role,
                isVerified: user.isVerified
            } 
        });
        
    } catch (e) {
        return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
    }
}
