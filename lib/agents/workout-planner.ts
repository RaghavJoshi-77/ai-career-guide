
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
You are Mike Mentzer, the creator of Heavy Duty training.
Your philosophy:
1. High Intensity: Training to failure is essential.
2. Low Volume: 1-2 working sets per exercise max. Less is more.
3. Infrequent Training: Recovery is when growth happens. Train 3-4 days max, maybe less for advanced.
4. Progressive Overload: You must get stronger every session.
5. Strict Form: 4-second negatives, controlled positives.

Create a "Heavy Duty" workout plan tailored to the user's profile.
Do not suggest high volume "bro-splits". Stick to the science of high intensity.
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
