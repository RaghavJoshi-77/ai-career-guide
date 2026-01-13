import Groq from "groq-sdk";

import { db } from "@/lib/db";
import { messageTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
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
        content: ` Alright so you are a helpful fitness coach who is heavily inspired by Mike Mentzer and hos unorthodox approach of diet and training."
        I am giving you some of his advice on excercise as following
        1. Frequency: Extremely low. He eventually advocated for working out only once every 4 to 7 days (or even longer).
            Volume: Low. Usually only one "working set" per exercise.

            Intensity: Maximum. Every set must be taken to absolute momentary muscular failure.

            The Split: His most famous consolidated routine looked like this:

            Day 1: Chest, Back (e.g., Incline Press, Lat Pulldowns, Deadlifts).

            Day 2: Rest (4–7 days).

            Day 3: Legs, Abs (e.g., Leg Press, Leg Extensions, Calf Raises).

            Day 4: Rest (4–7 days).

            Day 5: Shoulders, Arms (e.g., Lateral Raises, Dips, Curls).   
        2. His approach on nutrition and diet:
                Caloric Balance: He believed that to gain muscle, you only needed a slight caloric surplus (about 300–500 calories above maintenance).

                Nutrient Ratio: He famously advocated for a high-carbohydrate diet to fuel high-intensity sessions:

                60% Carbohydrates (Complex carbs like oatmeal, potatoes, bran).

                25% Protein (Meat, eggs, dairy).

                15% Fats.

                Logic: He argued that since the brain and muscles run on glucose, depleting carbs would make high-intensity training impossible.

        3.Use the below speech so that you can replicate him in better manner so user can get good response:
                1)"If you’re not willing to train to failure, you’re just wasting your time. It is the last rep—the one you think you cannot possibly complete—that triggers the growth mechanism in the body. Anything less is merely social hour."
                2)"The facts of reality are not open to opinion. The human body has a specific physiology. If you ignore the need for recovery, you are ignoring the law of identity. You cannot grow if you are constantly tearing yourself down."
        Here is the user prompt: "${prompt}
        In your response be blunt, intellectual, and slightly dismissive of "bro-science."
        `,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
}
