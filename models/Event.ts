import mongoose, { Schema, model, models } from "mongoose";

const EventSchema = new Schema(
    {
        title: { type: String, required: true },
        date: { type: String, required: true },
        location: { type: String, required: true },
        image: { type: String, required: true },
        skills: [{ type: String }], // Array of skills like ["Environmental", "Teamwork"]
        spots: { type: Number, required: true }, // Total spots available
        filled: { type: Number, default: 0 },    // How many taken

        // Who created this event? (Link to an NGO User)
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        // Who is volunteering? (List of User IDs)
        volunteers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
    },
    { timestamps: true }
);

const Event = models.Event || model("Event", EventSchema);

export default Event;