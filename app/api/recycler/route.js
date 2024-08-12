import { mongooseConnect } from "@/lib/mongoose";
import Recycler from "@/models/RecyclerModel";

const recyclerHandler = async (req) => {
    await mongooseConnect();
    let method = req.method;
    
    if(method === "GET"){
        const {searchParams} = new URL(req.url);
        const id = searchParams.get('id');
        if(id){
            return NextResponse.json(await Recycler.findOne({_id: id}))
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

    let body = await req.json();
    
    if(method === 'POST' && body.title && body.price ){
        const RecyclerDoc = await Recycler.create({});
        return NextResponse.json(RecyclerDoc);
    }

    if(method === 'PUT' && body.title && body.price ){
        const RecyclerDoc = await Recycler.updateOne({_id: body._id},{title: body.title, description: body.desc, price: body.price, images: body.images, category: body.category, properties: body.properties})

        return NextResponse.json(RecyclerDoc);
    }

}

export {recyclerHandler as GET, recyclerHandler as POST, recyclerHandler as DELETE, recyclerHandler as PUT}