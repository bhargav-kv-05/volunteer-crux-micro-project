"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const url_1 = require("url");
const next_1 = __importDefault(require("next"));
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
const Message_1 = __importDefault(require("./models/Message"));
dotenv.config({ path: ".env" });
if (!mongoose_1.default.connection.readyState) {
    mongoose_1.default.connect(process.env.MONGODB_URI)
        .then(() => console.log("✅ Socket Server Connected to MongoDB"))
        .catch(console.error);
}
const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0"; // Bind to all interfaces to avoid localhost/127.0.0.1 mismatches
const port = parseInt(process.env.PORT || "3000", 10);
// when using middleware `hostname` and `port` must be provided below
const app = (0, next_1.default)({ dev, hostname, port });
const handle = app.getRequestHandler();
app.prepare().then(() => {
    const httpServer = (0, http_1.createServer)(async (req, res) => {
        try {
            const parsedUrl = (0, url_1.parse)(req.url, true);
            await handle(req, res, parsedUrl);
        }
        catch (err) {
            console.error("Error occurred handling", req.url, err);
            res.statusCode = 500;
            res.end("internal server error");
        }
    });
    // --- Configurable Socket.IO Setup ---
    let ioServer;
    // In Development: Use a separate port (3001) to avoid Next.js conflicts (Restores previous working state)
    // In Production: Must use the SAME port (Render only gives one port)
    if (dev) {
        const socketPort = 3001;
        const socketServer = (0, http_1.createServer)();
        ioServer = new socket_io_1.Server(socketServer, {
            path: "/socket.io",
            addTrailingSlash: false,
            cors: {
                origin: "*", // Safe for local dev on separate port
                methods: ["GET", "POST"]
            }
        });
        socketServer.listen(socketPort, () => {
            console.log(`> 🛠️  Local Socket.IO Server running on port ${socketPort}`);
        });
    }
    else {
        // Production (Single Port)
        ioServer = new socket_io_1.Server(httpServer, {
            path: "/socket.io",
            addTrailingSlash: false,
            cors: {
                origin: process.env.NEXTAUTH_URL || "", // Strict in production
                methods: ["GET", "POST"],
                credentials: true
            }
        });
    }
    ioServer.on("connection", (socket) => {
        console.log("✅ Client connected to Socket.IO:", socket.id);
        socket.on("join_room", async (eventId) => {
            socket.join(eventId);
            console.log(`User ${socket.id} joined room: ${eventId}`);
            try {
                // Fetch the latest 200 messages for this room, oldest first
                const history = await Message_1.default.find({ eventId }).sort({ createdAt: 1 }).limit(200);
                socket.emit("chat_history", history);
            }
            catch (err) {
                console.error("Error fetching chat history:", err);
            }
        });
        socket.on("send_message", async (data) => {
            try {
                // Permanently save the message to MongoDB
                await Message_1.default.create({
                    eventId: data.eventId,
                    user: data.user,
                    avatar: data.avatar,
                    message: data.message,
                    channel: data.channel || "group",
                    timestamp: data.timestamp
                });
            }
            catch (err) {
                console.error("Error saving message:", err);
            }
            // Instantly broadcast to everyone connected in the room
            ioServer.to(data.eventId).emit("receive_message", data);
        });
        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });
    httpServer
        .once("error", (err) => {
        console.error(err);
        process.exit(1);
    })
        .listen(port, () => {
        console.log(`> App Ready on http://${hostname}:${port}`);
    });
});
