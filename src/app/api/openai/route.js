import runPrompt from "@/ai/openai";
import { NextResponse } from "next/server";

const aiHandler = async (req) => {

    if (req.method === "POST") {
        try {
            const data = await req.json();

            if (!data.content?.trim()) {
                return NextResponse.json({ message: "Please enter a message." }, { status: 400 });
            }

            const completion = await runPrompt(data.content);

            return NextResponse.json({ completion });
        } catch (error) {
            return NextResponse.json(
                { message: "Assistant is unavailable right now. Please try again later." },
                { status: 503 }
            );
        }
    }
}

export {aiHandler as POST};
