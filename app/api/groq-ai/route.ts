import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userPrompt = body.prompt || "Hello";

    const chatCompletion = await getGroqChatCompletion(userPrompt);
    const content = chatCompletion.choices?.[0]?.message?.content || "";
    console.log("Response:", content);

    return new Response(
      JSON.stringify({
        ok: true,
        content,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ ok: false, error: (err as Error).message || String(err) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function getGroqChatCompletion(prompt: string) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `only take ${prompt} if it is related to career guidance and advice. otherwise respond with "I can only help with career related questions."`,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
}
