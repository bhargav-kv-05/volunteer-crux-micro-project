import 'dotenv/config';
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Event from "@/models/Event";

// -------------------------------------------------------------
// 1. Modify this to exactly match your friend's event title once they create it!
const TARGET_EVENT_TITLE = "Animal Welfare Focus"; 
// -------------------------------------------------------------

const FIRST_NAMES = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Riya", "Aanya", "Diya", "Ishita", "Sneha", "Priya", "Rahul", "Karan", "Rohan", "Amit", "Vikram", "Neha", "Pooja", "Anjali"];
const LAST_NAMES = ["Sharma", "Patel", "Reddy", "Rao", "Iyer", "Nair", "Singh", "Das", "Kumar", "Gupta", "Desai", "Joshi", "Bansal", "Mehta", "Chawla"];
const SKILLS = ["First Aid", "Leadership", "Teaching", "Coding", "Logistics", "Photography", "Public Speaking", "Cooking", "Driving", "Community Service", "Teamwork"];

function getRandomSubset(arr: string[], maxElements: number) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * maxElements) + 1);
}

async function runSeed() {
    try {
        await connectToDatabase();
        console.log("🔌 Connected to MongoDB");

        // 🔥 Step 1: Violently destroy the old auto-generated completely fake test event so it stops cluttering your UI
        const destroyOp = await Event.deleteMany({ title: "Global Algorithmic Squad Parsing Test" });
        console.log(`🗑️ Deleted ${destroyOp.deletedCount} old Mock Events from the database!`);

        // 🔥 Step 2: Safety Check Wait Condition
        if (TARGET_EVENT_TITLE === "ENTER_FRIENDS_EVENT_TITLE_HERE") {
             console.log("🛑 Waiting for you to provide the exact Event Title your friend creates before injecting volunteers.");
             process.exit(0);
        }

        const targetEvent = await Event.findOne({ title: TARGET_EVENT_TITLE });
        if (!targetEvent) {
             console.log(`❌ Target Event "${TARGET_EVENT_TITLE}" not found. Did your friend successfully create it yet?`);
             process.exit(1);
        }

        console.log("🧹 Clearing old dummy users...");
        await User.deleteMany({ email: { $regex: "@dummy.crux" } });

        const dummyUsersToCreate = [];
        for (let i = 0; i < 40; i++) {
            const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
            const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
            
            dummyUsersToCreate.push({
                name: `${firstName} ${lastName}`,
                email: `volunteer${i}@dummy.crux`,
                password: "hashed_dummy_password_secure",
                role: "volunteer",
                // Assign a completely random subset of 1 to 4 skills to trigger the greedy sorting matrix!
                skills: getRandomSubset(SKILLS, 4),
                points: Math.floor(Math.random() * 50) * 10,
                // Assign a random avatar profile for beautiful UI renders
                image: `https://i.pravatar.cc/150?u=${i}dummy`
            });
        }

        console.log(`🚀 Forging 40 distinct Volunteer Accounts with randomized skills...`);
        const insertedUsers = await User.insertMany(dummyUsersToCreate);
        const dummyIds = insertedUsers.map(u => u._id);

        console.log(`🏗️ Injecting exactly ${dummyIds.length} Mock Volunteers directly into your Friend's Event: "${targetEvent.title}"...`);
        
        // Push the 40 fake ID tokens natively into your friend's event database matrix
        targetEvent.volunteers = [...targetEvent.volunteers, ...dummyIds];
        
        // Hard reset any existing matchmaker variables just in case
        targetEvent.attendees = [];
        targetEvent.draftedTeam = [];
        targetEvent.squads = [];
        targetEvent.matchmakingRun = false;
        
        await targetEvent.save();

        console.log(`✅ INJECTION COMPLETE! Everything is mounted.`);
        console.log(`Tell your friend to refresh their Management Dashboard page and hit "Execute Matchmaking"!`);

        process.exit(0);
    } catch (err) {
        console.error("Seed Failed:", err);
        process.exit(1);
    }
}

runSeed();
