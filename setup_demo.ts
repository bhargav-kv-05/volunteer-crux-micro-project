import 'dotenv/config'; // Load .env file
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Event from "@/models/Event";
import mongoose from "mongoose";

const TEST_EMAIL = "24r21a05dw@mlrit.ac.in"; // Your email (or the one you logged in with)

async function setupDemo() {
    try {
        await connectToDatabase();
        console.log("🔌 Connected to DB");

        // 1. Find or Create the Main User
        let user = await User.findOne({ email: TEST_EMAIL });
        if (!user) {
            console.log(`User ${TEST_EMAIL} not found. Please register/login first.`);
            process.exit(1);
        }

        // 2. Promote to NGO
        user.role = "ngo";
        await user.save();
        console.log(`✅ Promoted ${user.name} to NGO Role.`);

        // 3. Create a Dummy Volunteer
        const dummyVolEmail = "volunteer.demo@example.com";
        let dummyVol = await User.findOne({ email: dummyVolEmail });
        if (!dummyVol) {
            dummyVol = await User.create({
                name: "Demo Volunteer",
                email: dummyVolEmail,
                password: "hashed_dummy_password",
                role: "volunteer"
            });
            console.log("✅ Created Demo Volunteer account.");
        }

        // 4. Create an Active Event (Organized by YOU)
        const activeEvent = await Event.create({
            title: "Live Demo Cleanup Drive",
            date: "Feb 10, 2026",
            location: "KBR Park, Hyderabad",
            image: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&q=80&w=600",
            skills: ["Environmental"],
            spots: 20,
            filled: 1,
            organizer: user._id,
            volunteers: [dummyVol._id], // Demo Volunteer has joined
            attendees: [] // Not yet verified
        });
        console.log(`✅ Created Event: '${activeEvent.title}' (You are the organizer).`);
        console.log(`   -> 'Demo Volunteer' has joined this event. Go verify them!`);

        // 5. Create a Past Event (Where YOU were a volunteer & attended)
        // This is so you can see what the certificate page looks like for YOURSELF.
        const pastEvent = await Event.create({
            title: "Historic Tree Planting",
            date: "Jan 01, 2026",
            location: "Botanical Gardens",
            image: "https://images.unsplash.com/photo-1542601906990-b4d3fb7d5fa5?auto=format&fit=crop&q=80&w=600",
            skills: ["Nature"],
            spots: 50,
            filled: 50,
            organizer: new mongoose.Types.ObjectId(), // Random organizer
            volunteers: [user._id],
            attendees: [user._id] // YOU are marked as attended
        });
        console.log(`✅ Created Past Event: '${pastEvent.title}'.`);
        console.log(`   -> You are marked as 'Attended'. Check '/dashboard/certificates'!`);

        console.log("\n🎉 Demo Setup Complete!");
        console.log("1. Go to /dashboard/management -> See 'Live Demo Cleanup' -> Manage Attendance -> Verify 'Demo Volunteer'");
        console.log("2. Go to /dashboard/certificates -> Download your 'Historic Tree Planting' cert.");

        process.exit(0);

    } catch (error) {
        console.error("Setup Failed:", error);
        process.exit(1);
    }
}

setupDemo();
