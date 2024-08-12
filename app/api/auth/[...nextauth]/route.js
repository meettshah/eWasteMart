import { mongooseConnect } from "@/lib/mongoose";
import Login from "@/models/LoginModel";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from 'bcrypt';

const login = async (credentials) => {
    try{
        await mongooseConnect();

        console.log("Finding user with email : ", credentials.email);
        const user = await Login.findOne({email: credentials.email});
        if(!user) throw new Error("Wrong Credentials.");
        console.log("User found : ", user);

        const isCorrect = await bcrypt.compare(credentials.password, user.password);
        if(!isCorrect) throw new Error("Wrong Credentials.");
        console.log("Password is correct.");

        return user;
    } catch (error){
        console.log("Error while logging in.", error);
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