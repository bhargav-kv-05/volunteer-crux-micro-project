"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO } from "socket.io-client";

type SocketContextType = {
    socket: any | null;
    isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<any | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // use undefined to force auto-discovery of host if env var is not set
        // this allows it to work on localhost, 127.0.0.1, or strict IPs automatically

        // Defined in .env as http://localhost:3001 (For Dev)
        let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

        // Smart Fallback:
        // 1. If no env var, and we are on localhost, assume local dev (port 3000 now, since we merged servers!) 
        //    WAIT. If we merged servers in server.ts, they are on 3000.
        //    So we don't need port 3001 anymore!
        //    So simply: undefined url = auto-connect to current host.
        //    But for "dev" script, we use "ts-node server.ts" which runs on 3000.
        //    So we can just use `undefined` (which means window.location) for ALL cases if we are single port.

        // However, if the user runs "npm run dev" (Next.js default), they get no socket server.
        // They MUST run "npm run dev-custom" (or update dev script).

        console.log("Initializing socket connection...", { url: socketUrl || "auto-origin" });

        const socketInstance = ClientIO(socketUrl, {
            path: "/socket.io", // Matches server.ts
            addTrailingSlash: false,
            transports: ["websocket"], // Keep this for stability
            reconnectionAttempts: 5,
        });

        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message);
            setIsConnected(false);
        });

        socketInstance.on("disconnect", () => {
            console.log("Socket disconnected");
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
