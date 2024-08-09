import { NextResponse } from "next/server";
import runPrompt from "@/ai/openai";

const aiHandler = async (req) => {

    if (req.method === "POST") {
        const data = await req.json();
        const completion = await runPrompt(data.content);
        return new Response(JSON.stringify(completion), {
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}

export {aiHandler as POST};