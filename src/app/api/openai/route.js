import runPrompt from "@/ai/openai";
import { NextResponse } from "next/server";

const aiHandler = async (req) => {

    if (req.method === "POST") {
        const data = await req.json();

        const completion = await runPrompt(data.content);

        return NextResponse.json({ completion });
    }
}

export {aiHandler as POST};