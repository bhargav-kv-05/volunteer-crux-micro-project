import mongoose, { Schema, model, models } from "mongoose";

const MessageSchema = new Schema(
    {
        eventId: { 
            type: String, 
            required: true,
            index: true // Indexed for extremely fast lookups when a user joins a room
        },
        userId: { type: String },
        user: { type: String, required: true },
        avatar: { type: String },
        message: { type: String, required: true },
        timestamp: { type: String, required: true },
        channel: { 
            type: String, 
            required: true, 
            default: "group" 
        }
    },
    { timestamps: true }
);

const Message = models.Message || model("Message", MessageSchema);

export default Message;
