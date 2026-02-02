import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User {
        role?: string;
        points?: number;
        avatar?: string;
    }
    interface Session {
        user: {
            id: string;
            role?: string;
            points?: number;
            avatar?: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: string;
        points?: number;
        avatar?: string;
    }
}