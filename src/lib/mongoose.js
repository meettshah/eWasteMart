import mongoose from "mongoose";

export function mongooseConnect(){
    if(mongoose.connection.readyState === 1){
        return mongoose.connection.asPromise();
    }else{
        let uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
        }

        // Dynamically translate the +srv string to bypass Windows/ISP DNS SRV blocks
        // This solves "querySrv ECONNREFUSED" without requiring the user to change their .env file!
        const srvMatch = uri.match(/^mongodb\+srv:\/\/(.*?):(.*?)@cluster0\.8kb74qk\.mongodb\.net\/?([^\?]*)/);
        if (srvMatch) {
            const user = srvMatch[1];
            const pass = srvMatch[2];
            const db = srvMatch[3];
            uri = `mongodb://${user}:${pass}@ac-edhhzna-shard-00-00.8kb74qk.mongodb.net:27017,ac-edhhzna-shard-00-01.8kb74qk.mongodb.net:27017,ac-edhhzna-shard-00-02.8kb74qk.mongodb.net:27017/${db}?ssl=true&replicaSet=atlas-tv677z-shard-0&authSource=admin&retryWrites=true&w=majority`;
        }

        return mongoose.connect(uri, { family: 4 });
    }
}
