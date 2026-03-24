import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { resolve } from "path";
import User from "../models/User";
import Event from "../models/Event";

// Load environment variables securely
dotenv.config({ path: resolve(__dirname, "../.env") });

const AVAILABLE_SKILLS = [
    "Environmental", "Teaching", "Community Service", "Medical",
    "Logistics", "Communication", "Tech", "Teamwork",
    "Leadership", "Event Planning"
];

function getRandomSkills() {
    // Simulates an applicant picking 2 to 4 diverse skills
    const numSkills = Math.floor(Math.random() * 3) + 2;
    const shuffled = [...AVAILABLE_SKILLS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numSkills);
}

async function runSeed() {
    const eventId = process.argv[2];
    
    if (!eventId) {
        console.error("❌ Please provide an Event ID as the first argument.");
        console.error("Example: npx tsx scripts/seed-applicants.ts <EVENT_ID>");
        process.exit(1);
    }

    if (!process.env.MONGODB_URI) {
        console.error("❌ MONGODB_URI not found in .env");
        process.exit(1);
    }

    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);

        const event = await Event.findById(eventId);
        if (!event) {
            console.error("❌ Event not found in Database.");
            process.exit(1);
        }

        console.log(`Found Event: ${event.title}`);
        console.log("Generating 15 algorithmic test applicants...");

        const newApplicantIds = [];

        // Geuninely create 15 dummy users in the Database so the Algorithm has complete user objects to crunch
        for (let i = 1; i <= 15; i++) {
            const tempStr = Math.random().toString(36).substring(7);
            const dummyUser = await User.create({
                name: `Tester ${tempStr.toUpperCase()}`,
                email: `test_algo_${tempStr}@volunteercrux.com`,
                role: "volunteer",
                skills: getRandomSkills(),
                isVerified: true, // Bypass verification for testers
            });
            
            newApplicantIds.push(dummyUser._id);
            console.log(`+ Generated ${dummyUser.name} [${dummyUser.skills.join(", ")}]`);
        }

        console.log("\n✅ 15 Simulated Users generated in Database.");

        // Push their unique IDs directly into the Event Pool
        event.volunteers.push(...newApplicantIds);
        event.filled += 15;
        await event.save();

        console.log(`✅ Fully injected 15 applicants into Event: "${event.title}"`);
        console.log("🧠 You can now freely execute the Matchmaking Engine from the Organizer Management Dashboard!");

        process.exit(0);
    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
}

runSeed();
