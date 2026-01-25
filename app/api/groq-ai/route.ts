import Groq from "groq-sdk";
import { db } from "@/lib/db";
import { userTable, messageTable } from "@/lib/schema";
import { eq, desc , asc} from "drizzle-orm";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MENTZER_SYSTEM_PROMPT = `
You are a helpful fitness coach heavily inspired by Mike Mentzer.
Your Principles:
1. Frequency: Work out once every 4-7 days.
2. Volume: One working set per exercise to failure.
3. Intensity: Absolute momentary muscular failure.
4. Nutrition: High carb (60%), Moderate Protein (25%), Low Fat (15%). 300-500 calorie surplus.

Tone: Blunt, intellectual, articulate, and slightly dismissive of "bro-science" and high-volume training.
Quotes to embody:
- "The facts of reality are not open to opinion."
- "Anything less than failure is merely social hour."
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, chatId } = body;

    // 1. Validation
    if (!prompt || !chatId) {
      return new Response("Missing info", { status: 400 });
    }

    // 2. Database Lookup & AUTO-REGISTRATION
    let userId: number;

    const existingUsers = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, chatId))
      .limit(1);

    if (existingUsers.length > 0) {
      // User exists, grab their ID
      userId = existingUsers[0].id;
    } else {
      // === THE FIX: CREATE USER IF NOT FOUND ===
      console.log(`User ${chatId} not found. Creating new user...`);
      
      const newUsers = await db.insert(userTable).values({
        email: chatId,
        // Since this is OAuth/AI chat, we set a dummy password to satisfy the "notNull" schema
        password: "oauth-generated-placeholder", 
      }).returning({ id: userTable.id });

      userId = newUsers[0].id;
      console.log(`✅ Created new user with ID: ${userId}`);
    }

    // 3. Fetch History (Standard logic)
    const previousMessages = await db
      .select()
      .from(messageTable)
      .where(eq(messageTable.chatId, chatId))
      .orderBy(desc(messageTable.createdAt))
      .limit(6);

    const history = previousMessages.reverse().map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    const messagesPayload = [
      { role: "system", content: MENTZER_SYSTEM_PROMPT },
      ...history,
      { role: "user", content: prompt },
    ];

    // 4. API Call
    const chatCompletion = await groq.chat.completions.create({
      messages: messagesPayload as any,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    const aiResponse = chatCompletion.choices?.[0]?.message?.content || "";

    // 5. Save & Respond
    await Promise.all([
      db.insert(messageTable).values({
        userId,
        chatId,
        role: "user",
        content: prompt,
        createdAt: new Date(),
      }),
      db.insert(messageTable).values({
        userId,
        chatId,
        role: "assistant",
        content: aiResponse,
        createdAt: new Date(),
      }),
    ]);

    return new Response(JSON.stringify({ ok: true, content: aiResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 500 }
    );
  }
}

// ... (Your existing imports and POST function remain unchanged) ...

// === ADD THIS NEW GET FUNCTION ===
export async function GET(request: Request) {
  try {
    // 1. Get chatId from the URL (e.g., /api/groq-ai?chatId=test@gmail.com)
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return new Response(JSON.stringify({ error: "Missing chatId" }), { status: 400 });
    }

    // 2. Fetch all messages for this user, ordered by time
    const history = await db
      .select({
        role: messageTable.role,
        content: messageTable.content
      })
      .from(messageTable)
      .where(eq(messageTable.chatId, chatId))
      .orderBy(asc(messageTable.createdAt)); // Oldest first

    // 3. Return the clean list
    return new Response(JSON.stringify({ history }), {
      status: 200, 
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("GET Error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch history" }), { status: 500 });
  }
}



// ... (imports and POST/GET functions remain unchanged) ...

// === ADD THIS DELETE FUNCTION ===
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return new Response("Missing chatId", { status: 400 });
    }

    // Delete all messages matching the chatId
    await db
      .delete(messageTable)
      .where(eq(messageTable.chatId, chatId));

    return new Response(JSON.stringify({ ok: true }), { status: 200 });

  } catch (err) {
    console.error("DELETE Error:", err);
    return new Response("Failed to delete history", { status: 500 });
  }
}