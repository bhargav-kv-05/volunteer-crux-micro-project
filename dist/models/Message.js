"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MessageSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
const Message = mongoose_1.models.Message || (0, mongoose_1.model)("Message", MessageSchema);
exports.default = Message;
