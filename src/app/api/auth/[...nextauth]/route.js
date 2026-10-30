import { prisma } from "@/lib/prisma";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from 'bcryptjs';

const login = async (credentials) => {
    try {
        const email = credentials.email?.toLowerCase().trim();
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) throw new Error("Wrong Credentials.");

        const isCorrect = await bcrypt.compare(credentials.password, user.password || "");
        if (!isCorrect) throw new Error("Wrong Credentials.");

        if (!user.isEmailVerified) {
            throw new Error("Please verify your email before logging in.");
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    } catch (error) {
        console.error("Login Error: ", error);
        throw new Error(error.message || "Something went wrong.");
    }
}

export const authOptions = {
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {},
            async authorize(credentials) {
                try {
                    const user = await login(credentials);
                    return user;
                }
                catch (error) {
                    throw new Error(error.message || "Failed to login.")
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "dummy",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                try {
                    const normalizedEmail = user.email?.toLowerCase().trim();
                    let dbUser = await prisma.user.findUnique({
                        where: { email: normalizedEmail }
                    });
                    
                    if (!dbUser) {
                        dbUser = await prisma.user.create({
                            data: {
                                name: user.name || "Google User",
                                email: normalizedEmail,
                                isEmailVerified: true,
                                role: "pending"
                            }
                        });
                    }
                    
                    user.id = dbUser.id;
                    user.role = dbUser.role;
                    return true;
                } catch (error) {
                    console.error("Google SignIn Error", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.name = user.name;
                token.email = user.email;
                token.role = user.role;
                token.id = user.id;
            }

            // Handle session update triggered from OnboardingForm
            if (trigger === "update" && session?.role) {
                token.role = session.role;
            }

            // Always fetch latest role from PostgreSQL just in case, especially for pending roles
            if (token.email) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: token.email.toLowerCase().trim() }
                    });
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.id = dbUser.id;
                    }
                } catch (e) {
                    console.error("JWT sync error:", e);
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.role = token.role;
                session.user.id = token.id;
            }

            return session;
        }
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
}

const authHandler = NextAuth(authOptions);

export { authHandler as GET, authHandler as POST }
