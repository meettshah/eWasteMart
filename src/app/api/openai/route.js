import runPrompt from "@/ai/openai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const requestBuckets = new Map();

function getRequestKey(req, session) {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim();
    return session?.user?.email || ip || "anonymous";
}

function isRateLimited(key) {
    const now = Date.now();
    const existing = requestBuckets.get(key);

    if (!existing || now > existing.resetAt) {
        requestBuckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return false;
    }

    if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
        return true;
    }

    existing.count += 1;
    requestBuckets.set(key, existing);
    return false;
}

const aiHandler = async (req) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ message: "Please login first." }, { status: 401 });
    }

    if (req.method === "POST") {
        try {
            const data = await req.json();
            const key = getRequestKey(req, session);

            if (isRateLimited(key)) {
                return NextResponse.json({ message: "Too many requests. Please try again shortly." }, { status: 429 });
            }

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
