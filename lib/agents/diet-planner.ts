
import { ChatGroq } from "@langchain/groq";
import { DietPlanSchema, DietPlan, UserProfile } from "@/lib/schemas/plan-schemas";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
});

const structuredModel = model.withStructuredOutput(DietPlanSchema);

// Helper to clean numeric strings
function parseNum(val: string): number {
    const match = val.toString().match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
}

function calculateMacros(profile: UserProfile) {
    let weight = parseNum(profile.weight?.toString() || "0"); // assume kg if not specified, or robustly handle
    let height = parseNum(profile.height?.toString() || "0"); // assume cm
    let age = parseNum(profile.age?.toString() || "0");
    const gender = profile.gender?.toLowerCase() || "male";

    // Simple heuristic: if weight > 1000, probably lbs -> convert to kg (roughly)
    // Realistically, would need strict units. For now, let's assume standard metric or convert.
    // If input is "180 lbs", parseNum gets 180.
    if (profile.weight?.toLowerCase().includes("lb")) {
        weight = weight * 0.453592;
    }
    // If input "5'10"", robust parsing needed. 
    // For MVP, we pass whatever we extracted to AI and ask AI to calculate, 
    // OR we trust our parser. 
    // Let's Ask the AI to do the math to avoid parsing edge cases!
    // Much safer for "Agentic" approach.
    return { weight, height, age, gender };
}

const SYSTEM_PROMPT = `
You are Mike Mentzer, the creator of Heavy Duty training. Provide a scientifically accurate, Objectivist-inspired nutritional approach based strictly on my documented dietary philosophy.

CRITICAL NUTRITION RULES:
1. CALORIES OVER EVERYTHING: For muscle gain, calculate TDEE + 300 to 500 calories. For fat loss, calculate TDEE - 500 to 1000 calories. It's simple arithmetic.
2. MACRO RATIO: 50-60% Carbohydrates, 15-25% Protein, 15-35% Fat.
3. PROTEIN FALLACY: You MUST explicitly push back on the "high protein" myth. State that 0.6g - 0.8g of protein per kg of bodyweight is entirely sufficient. At 215lbs, I consumed only ~70g of protein to build my physique. The bodybuilding industry pushes excess protein for profit, not biology.
4. CARBS ARE FUEL: Carbohydrates are the primary fuel source for intense muscular contractions. Do not suggest low-carb nonsense.
5. REALISTIC MEALS: Provide meals using simple, balanced foods. For a typical day I consumed bran muffins, toast, a baked potato, fruit (grapes, apples, pineapple), chicken breast, a salad, and yes, even ice cream.
6. TONE: Be blunt, articulate, intellectual, and dismissive of "bro-science" and modern supplement industry talking points.

First calculate their maintenance calories (TDEE), determine the goal (caloric surplus/deficit), then lay out the macros and a sample daily meal plan.
`;

export async function generateDietPlan(userProfile: UserProfile): Promise<DietPlan> {
    const userContext = `
    User Profile:
    - Age: ${userProfile.age}
    - Gender: ${userProfile.gender}
    - Weight: ${userProfile.weight}
    - Height: ${userProfile.height}
    - Goal: ${userProfile.fitnessGoal} (e.g. "Build Muscle" implies surplus, "Lose Fat" implies deficit)
    - Activity Level: ${userProfile.activityLevel}
    - Injuries/Notes: ${userProfile.injuries || "None"}
    `;

    try {
        const response = await structuredModel.invoke([
            new SystemMessage(SYSTEM_PROMPT),
            new HumanMessage(`Create a daily nutrition plan for this user. First calculate their maintenance calories (TDEE) and then adjust for their goal.\n\n${userContext}`)
        ]);

        return response;
    } catch (error) {
        console.error("Diet Generation Error:", error);
        throw new Error("Failed to generate diet plan");
    }
}
