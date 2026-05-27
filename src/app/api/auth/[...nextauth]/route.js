import { mongooseConnect } from "@/lib/mongoose";
import Login from "@/models/LoginModel";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from 'bcrypt';

const login = async (credentials) => {
    try{
        await mongooseConnect();

        const user = await Login.findOne({email: credentials.email?.toLowerCase().trim()});
        if(!user) throw new Error("Wrong Credentials.");

        const isCorrect = await bcrypt.compare(credentials.password, user.password);
        if(!isCorrect) throw new Error("Wrong Credentials.");

        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        };
    } catch (error){
        throw new Error("Something went wrong.");
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
            async authorize(credentials){
                try{
                    const user = await login(credentials);
                    return user;
                }
                catch(error){
                    throw new Error("Failed to login.")
                }
            }
        })
    ],
    callbacks : {
        async jwt({token, user}){
            if(user){
                token.name = user.name;
                token.email = user.email;
                token.role = user.role;
                token.id = user.id;
            }

            return token;
        },

        async session({session, token}){
            if(token){
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

export {authHandler as GET, authHandler as POST}
