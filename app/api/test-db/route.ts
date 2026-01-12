import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
    try {
        await connectToDatabase();
        return NextResponse.json({ message: "✅ Success! Connected to MongoDB." });
    } catch (error) {
        return NextResponse.json(
            { message: "❌ Connection Failed", error: (error as Error).message },
            { status: 500 }
        );
    }
}