import { mongooseConnect } from "@/lib/mongoose";
import Recycler from "@/models/RecyclerModel";
import { NextResponse } from "next/server";

const recyclerHandler = async (req) => {
    await mongooseConnect();
    let method = req.method;
    
    if(method === "GET"){
        const {searchParams} = new URL(req.url);
        const email = searchParams.get('email');
        if(email){
            console.log("Email Found ", email);
            return NextResponse.json(await Recycler.findOne({email: email}));
        }
        return NextResponse.json(await Recycler.find());
    }
    
    if(method === "DELETE"){
        const {searchParams} = new URL(req.url)
        const id = searchParams.get('id')
        if(id){
            await Recycler.deleteOne({_id: id})
            return NextResponse.json({message: "Recycler Successfully Deleted"})
        }
    }

    let {_id, name, email, typeWaste, address, images, properties} = await req.json();
    
    if(method === 'POST' && name && email ){
        const RecyclerDoc = await Recycler.create({name, email, typeWaste, address, images, properties});
        return NextResponse.json({message: "Recycler Successfully Created", RecyclerDoc});
    }


    if(method === 'PUT' && name && email ){
        const RecyclerDoc = await Recycler.updateOne({_id}, {name, email, typeWaste, address, images, properties});
        return NextResponse.json({message: "Recycler Successfully Updated", RecyclerDoc});
    }

}

export {recyclerHandler as GET, recyclerHandler as POST, recyclerHandler as DELETE, recyclerHandler as PUT}