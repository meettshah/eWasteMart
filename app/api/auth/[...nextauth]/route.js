import { mongooseConnect } from "@/lib/mongoose";
import User from "@/models/User";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from 'bcrypt';

const login = async (credentials) => {
    try{
        await mongooseConnect();

        const user = await User.findOne({email: credentials.email});
        if(!user) throw new Error("Wrong Credentials.");

        const isCorrect = await bcrypt.compare(credentials.password, user.password);
        if(!isCorrect) throw new Error("Wrong Credentials.");

        return user;
    } catch (error){
        console.log("Error while logging in.");
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
                    console.log({credentials});
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
                token.id = user.id;
            }
            console.log("Token : ", token);

            return token;
        },

        async session({session, token}){
            if(token){
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.id = token.id;
            }

            console.log('Session : ', session);
            return session;
        }
    }
}

const authHandler = NextAuth(authOptions);

export {authHandler as GET, authHandler as POST}