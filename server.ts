
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Message from "./models/Message";

dotenv.config({ path: ".env" });

if (!mongoose.connection.readyState) {
    mongoose.connect(process.env.MONGODB_URI as string)
        .then(() => console.log("✅ Socket Server Connected to MongoDB"))
        .catch(console.error);
}

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0"; // Bind to all interfaces to avoid localhost/127.0.0.1 mismatches
const port = parseInt(process.env.PORT || "3000", 10);
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url!, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
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
        const socketServer = createServer();
        ioServer = new Server(socketServer, {
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
    } else {
        // Production (Single Port)
        ioServer = new Server(httpServer, {
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

        socket.on("join_room", async (payload) => {
            // Backwards compatibility: if a string is passed, it's just eventId. If Object, extract parameters
            const eventId = typeof payload === "string" ? payload : payload.eventId;
            const squadId = payload.squadId;

            const room = squadId ? `squad_${squadId}` : `event_${eventId}`;
            socket.join(room);
            console.log(`User ${socket.id} joined room: ${room}`);
            
            try {
                // Securely isolate chat history. If in a squad room, strictly fetch messages tied to that squad.
                const query = squadId ? { eventId, squadId } : { eventId, squadId: { $exists: false } };
                const history = await Message.find(query).sort({ createdAt: 1 }).limit(200);
                socket.emit("chat_history", history);
            } catch (err) {
                console.error("Error fetching chat history:", err);
            }
        });

        socket.on("send_message", async (data) => {
            const room = data.squadId && data.channel === "squad" ? `squad_${data.squadId}` : `event_${data.eventId}`;
            
            try {
                // Permanently save the message to MongoDB isolated correctly
                await Message.create({
                    eventId: data.eventId,
                    squadId: data.channel === "squad" ? data.squadId : undefined,
                    user: data.user,
                    avatar: data.avatar,
                    message: data.message,
                    channel: data.channel || "group",
                    timestamp: data.timestamp
                });
            } catch (err) {
                console.error("Error saving message:", err);
            }

            // Instantly broadcast to everyone connected in the correctly isolated room
            ioServer.to(room).emit("receive_message", data);
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
