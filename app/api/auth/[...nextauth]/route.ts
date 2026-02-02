import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await connectToDatabase();

                const user = await User.findOne({ email: credentials?.email }).select("+password");

                if (!user) throw new Error("Invalid email or password");

                const isPasswordMatched = await bcrypt.compare(
                    credentials?.password || "",
                    user.password
                );

                if (!isPasswordMatched) throw new Error("Invalid email or password");

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
        async jwt({ token, user, trigger, session }) {
            // Initial sign in
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.name = user.name;
                token.points = user.points;
                token.avatar = user.avatar;
            }
            // Support updating session on the client
            if (trigger === "update" && session) {
                token.points = session.user.points;
                token.avatar = session.user.avatar;
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