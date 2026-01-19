import { config } from "dotenv";
config();

import mongoose from "mongoose";

async function checkUser() {
    // Dynamically import to ensure env vars are loaded first
    const { connectToDatabase } = await import("@/lib/mongodb");
    const User = (await import("@/models/User")).default;

    await connectToDatabase();
    const email = "24r21a05dw@mlrit.ac.in"; // From screenshot
    const user = await User.findOne({ email });
    console.log("User:", user?.name);
    console.log("Skills:", user?.skills);
    await mongoose.disconnect();
}

checkUser();
