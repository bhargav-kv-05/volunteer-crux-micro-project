import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide a name"],
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true, // No duplicate emails allowed
        },
        password: {
            type: String,
            select: false, // Don't return password by default when fetching user
        },
        role: {
            type: String,
            enum: ["volunteer", "ngo", "admin"], // Only these 3 roles are allowed
            default: "volunteer",
        },
        skills: [{ type: String }], // Array of skills like ["Environmental", "Teamwork"]

        // Gamification
        points: { type: Number, default: 0 },
        avatar: { type: String, default: "" },

        // Authentication & Security
        isVerified: {
            type: Boolean,
            default: false,
        },
        verifyToken: String,
        verifyTokenExpiry: Date,
        resetPasswordToken: String,
        resetPasswordExpires: Date,
    },
    { timestamps: true } // Automatically adds 'createdAt' and 'updatedAt'
);

// This check is important! Next.js reloads heavily in dev mode.
// We check if the model exists to prevent "OverwriteModelError".
const User = models.User || model("User", UserSchema);

export default User;