import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    debug: true, // Enable debug logs to diagnose OAuth issues
    session: {
        strategy: "jwt",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true, // Critical: Allows Google Login to work if email already exists
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await connectToDatabase();

                const user = await User.findOne({ email: credentials?.email }).select("+password");

                if (!user) throw new Error("No user found with this email");

                // If user has no password (e.g. Google user attempting credentials log in)
                if (!user.password) throw new Error("Please sign in with Google");

                const isPasswordMatched = await bcrypt.compare(
                    credentials?.password || "",
                    user.password
                );

                if (!isPasswordMatched) throw new Error("Invalid password");

                if (!user.isVerified) {
                    throw new Error("Please verify your email before logging in.");
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    points: user.points,
                    avatar: user.avatar,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    await connectToDatabase();
                    const existingUser = await User.findOne({ email: user.email });

                    if (!existingUser) {
                        // Create new user for Google login
                        await User.create({
                            name: user.name,
                            email: user.email,
                            role: "volunteer", // Default role
                            points: 0,
                            avatar: user.image || "", // Use Google profile picture
                            isVerified: true, // Google users are verified by default
                        });
                    }
                    return true;
                } catch (error) {
                    console.error("Error creating user from Google:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            // Initial sign in
            if (user) {
                // If user object is from Google, it might have Google ID.
                // We must lookup the MongoDB ID to ensure consistency.
                await connectToDatabase();
                const dbUser = await User.findOne({ email: user.email });

                if (dbUser) {
                    token.id = dbUser._id.toString();
                    token.role = dbUser.role;
                    token.points = dbUser.points;
                    token.avatar = dbUser.avatar;
                    token.name = dbUser.name;
                } else {
                    // Fallback (Should not happen given signIn callback creates user)
                    token.id = user.id;
                    token.role = user.role;
                }
            }
            // Support updating session on the client
            if (trigger === "update" && session) {
                token.points = session.user.points;
                token.avatar = session.user.avatar;
                token.name = session.user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id as string;
                session.user.name = token.name;
                session.user.points = token.points;
                session.user.avatar = token.avatar;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };