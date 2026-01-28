
import { ChatGroq } from "@langchain/groq";
import { DietPlanSchema, DietPlan } from "@/lib/schemas/plan-schemas";
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

function calculateMacros(profile: Record<string, any>) {
    let weight = parseNum(profile.weight); // assume kg if not specified, or robustly handle
    let height = parseNum(profile.height); // assume cm
    let age = parseNum(profile.age);
    const gender = profile.gender?.toLowerCase() || "male";

    // Simple heuristic: if weight > 1000, probably lbs -> convert to kg (roughly)
    // Realistically, would need strict units. For now, let's assume standard metric or convert.
    // If input is "180 lbs", parseNum gets 180.
    if (profile.weight.toLowerCase().includes("lb")) {
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
You are an expert nutritionist following Mike Mentzer's High Intensity principles.
Dietary Philosophy:
- High Carbohydrate (60%): Fuel for intense workouts.
- Moderate Protein (25%): Sufficient for repair.
- Low Fat (15%): Keep it minimal.
- Surplus for Muscle: +300-500 kcal above maintenance.
- Deficit for Fat Loss: -300-500 kcal below maintenance.

Calculate the user's needs based on their stats and goal, then generate a full daily meal plan.
`;

export async function generateDietPlan(userProfile: Record<string, any>): Promise<DietPlan> {
    const userContext = `
    User Profile:
    - Age: ${userProfile.age}
    - Gender: ${userProfile.gender}
    - Weight: ${userProfile.weight}
    - Height: ${userProfile.height}
    - Goal: ${userProfile.fitnessGoal} (e.g. "Build Muscle" implies surplus, "Lose Fat" implies deficit)
    - Activity Level: ${userProfile.activityLevel}
    - Dietary Restrictions: None (unless specified in injuries/notes: ${userProfile.injuries || "None"})
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
