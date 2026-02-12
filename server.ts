
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

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

    // --- Socket.IO Integration (Single Port) ---
    const io = new Server(httpServer, {
        path: "/socket.io", // Default path, but good to be explicit
        addTrailingSlash: false,
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("join_room", (eventId) => {
            socket.join(eventId);
            console.log(`User ${socket.id} joined room: ${eventId}`);
        });

        socket.on("send_message", (data) => {
            io.to(data.eventId).emit("receive_message", data);
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
