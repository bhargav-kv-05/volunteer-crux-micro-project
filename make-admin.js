const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function executeAdminOverride() {
    try {
        console.log("Reaching into remote cluster boundary...");
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Use a schema-less structure just to force the structural modification manually
        const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }));
        
        const targetEmail = "bhargavkv05@gmail.com";
        console.log(`Injecting structural privileges for: ${targetEmail}`);

        // Update logic: Overwrites whatever role was generated when you signed up and forces "admin"
        const res = await User.findOneAndUpdate(
            { email: targetEmail },
            { $set: { role: "admin", isVerified: true } },
            { new: true }
        );
        
        if (res) {
            console.log("\n[SUCCESS] OVERRIDE COMPLETE!");
            console.log("Authentication Profile:", res.email);
            console.log("Current System Role:", res.role);
            console.log("Verified Status:", res.isVerified);
            console.log("\nYou may now log in to inspect the global platform!");
        } else {
            console.log("\n[FAILED] Target user email not found in database.");
        }
    } catch (e) {
        console.error("Execution error:", e);
    } finally {
        process.exit(0);
    }
}

executeAdminOverride();
