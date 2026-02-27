
import { ChatGroq } from "@langchain/groq";
import { WorkoutPlanSchema, WorkoutPlan } from "@/lib/schemas/plan-schemas";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
});

// Bind schema for structured output
const structuredModel = model.withStructuredOutput(WorkoutPlanSchema);

const SYSTEM_PROMPT = `
You are Mike Mentzer, the creator of Heavy Duty training. Your task is to output a highly specific workout plan based strictly on my documented philosophy.

CRITICAL RULES:
1. SPLIT: You must use the EXACT 3-day split: Day 1: Chest & Back | Day 2: Legs & Abs | Day 3: Shoulders & Arms.
2. FREQUENCY: There must be a MINIMUM of 48 hours of complete rest between each workout session. Do not suggest training consecutive days. For advanced trainees, suggest 4-7 days of rest between sessions.
3. VOLUME: Exactly ONE working set per exercise, taken to absolute momentary muscular failure (after 1-2 warm-up sets). 
4. TEMPO: Exercises must be performed with a slow, controlled tempo: 4-second negative, 2-second positive.
5. EXERCISE SELECTION (Choose ONLY from these or very similar): 
   - Chest: Pec Deck, Cable Crossovers (pre-exhaust), Incline Smith Machine Press.
   - Back: Machine Pullover (pre-exhaust), Close-grip Underhand Pulldown, Deadlift.
   - Legs: Leg Extension (pre-exhaust), Vertical Leg Press, Leg Curl, Standing Calf Raise.
   - Shoulders: Dumbbell Lateral Raise, Overhead Press, Reverse Pec Deck (Rear Delt).
   - Arms: Barbell Curl (with supination), Cable Tricep Pressdown, Weighted Dips.
6. VOLUME RESTRICTIONS: Beginners/Intermediates do 2-4 exercises per session.

Do not deviate from these rules. Present the plan intellectually, stating the biological necessity of rest and the inverse relationship between volume and intensity.
`;

export async function generateWorkoutPlan(userProfile: Record<string, any>): Promise<WorkoutPlan> {
    const userContext = `
    User Profile:
    - Age: ${userProfile.age}
    - Gender: ${userProfile.gender}
    - Weight: ${userProfile.weight}
    - Height: ${userProfile.height}
    - Goal: ${userProfile.fitnessGoal}
    - Experience: ${userProfile.experienceLevel}
    - Injuries: ${userProfile.injuries || "None"}
    - Available Days: ${userProfile.availableDays}
    - Equipment: ${userProfile.equipment}
    `;

    try {
        const response = await structuredModel.invoke([
            new SystemMessage(SYSTEM_PROMPT),
            new HumanMessage(`Generate a complete Heavy Duty workout plan for this user based on their profile and available equipment.\n\n${userContext}`)
        ]);

        return response;
    } catch (error) {
        console.error("Workout Generation Error:", error);
        throw new Error("Failed to generate workout plan");
    }
}
