
import { StateGraph, Annotation } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from "@langchain/core/messages";

// --- State Definition ---
export const OnboardingState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
    }),
    userProfile: Annotation<Record<string, any>>({
        reducer: (x, y) => ({ ...x, ...y }),
        default: () => ({}),
    }),
    currentStep: Annotation<string>({
        reducer: (x, y) => y,
        default: () => "start",
    }),
});

// --- Model Setup ---
const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile", // Changed from modelName to model
    temperature: 0,
});

// --- Steps ---
const STEPS = [
    "start",
    "age",
    "weight",
    "height",
    "gender",
    "fitnessGoal",
    "activityLevel",
    "experienceLevel",
    "injuries",
    "availableDays",
    "equipment",
    "review",
    "complete",
] as const;

type Step = typeof STEPS[number];

const STEP_PROMPTS: Record<Step, string> = {
    age: "Ask the user for their age.",
    weight: "Ask the user for their current weight (in kg or lbs).",
    height: "Ask the user for their height.",
    gender: "Ask the user for their biological sex.",
    fitnessGoal: "Ask the user for their main fitness goal.",
    activityLevel: "Ask the user about their daily activity level.",
    experienceLevel: "Ask the user about their training experience.",
    injuries: "Ask if the user has any injuries. If none, say 'none'.",
    availableDays: "Ask how many days per week they can train.",
    equipment: "Ask what equipment they have access to.",
    review: "Show summary and ask to confirm.",
    complete: "Done.",
    start: "",
};

// --- Nodes ---

async function processingNode(state: typeof OnboardingState.State) {
    const messages = state.messages;
    // If no messages, it's the start
    if (messages.length === 0) {
        return { currentStep: "age" };
    }

    const lastMessage = messages[messages.length - 1];

    // If last message is AI, we stop (waiting for user)
    // BUT in this flow, the user message comes in -> processingNode -> responseNode
    // So lastMessage should be HumanMessage.
    if (lastMessage instanceof AIMessage) {
        return {};
    }

    const currentStep = state.currentStep as Step;

    if (currentStep === "start") {
        return { currentStep: "age" };
    }

    // Skip extraction for special steps
    if (currentStep === "complete") return {};
    if (currentStep === "review") {
        return { currentStep: "complete" }; // Auto-confirm for MVP
    }

    // Extraction Logic
    const extractionPrompt = `
      You are extracting a fitness profile field.
      Field to extract: "${currentStep}"
      User Input: "${lastMessage.content}"
      
      Return ONLY the extracted value. Normalize it.
      If invalid/unclear, return "INVALID".
    `;

    // We assume 'model' works. If 400 error persists, check message format.
    const extraction = await model.invoke([new SystemMessage(extractionPrompt)]);
    const value = extraction.content.toString().trim();

    if (value === "INVALID") {
        return {
            messages: [new AIMessage(`I couldn't understand that ${currentStep}. Please try again.`)]
        };
    }

    // Valid: Advance Step
    const currentIndex = STEPS.indexOf(currentStep);
    const nextStep = STEPS[currentIndex + 1] || "complete";

    return {
        userProfile: { [currentStep]: value },
        currentStep: nextStep
    };
}

async function responseNode(state: typeof OnboardingState.State) {
    const currentStep = state.currentStep as Step;
    const lastMessage = state.messages[state.messages.length - 1];

    // If error message was just added, stop here
    if (lastMessage instanceof AIMessage && lastMessage.content.toString().includes("couldn't understand")) {
        return {};
    }

    if (currentStep === "complete") {
        return {
            messages: [new AIMessage("Thanks! Your profile is set up. You can now generate your workout plan.")]
        };
    }

    // Review Step
    if (currentStep === "review") {
        const profile = state.userProfile;
        const summary = Object.entries(profile).map(([k, v]) => `- ${k}: ${v}`).join("\n");
        return {
            messages: [new AIMessage(`Here is what I have:\n${summary}\n\nDoes this look correct? (Yes/No)`)]
        };
    }

    // Verify currentStep is valid
    if (!STEPS.includes(currentStep)) return {};

    // Generate Question
    // Filter messages to avoid sending too much history or duplicates if needed
    // But passing full history is fine for context.
    const qMsg = await model.invoke([
        new SystemMessage(`You are a friendly fitness coach. Ask the user for their ${currentStep}. Keep it short and specific.`),
        ...state.messages // Pass history so it knows what was just said
    ]);

    return { messages: [qMsg] };
}

// --- Graph ---
export const onboardingGraph = new StateGraph(OnboardingState)
    .addNode("processor", processingNode)
    .addNode("responder", responseNode)
    .addEdge("__start__", "processor")
    .addEdge("processor", "responder")
    .addEdge("responder", "__end__")
    .compile();
