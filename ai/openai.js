import OpenAI from "openai";

const openai = new OpenAI();

const runPrompt = async (content) => {
    console.log(content);
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant."
            },
            {
                role: "user",
                content: content,
            }
        ],
        temperature: 1,
        max_tokens: 50,
    });
    console.log(completion);
    return completion;
}

export default runPrompt;