
import { NextRequest, NextResponse } from "next/server";
import { onboardingGraph } from "@/lib/agents/onboarding-agent";
import { db } from "@/lib/db";
import { userTable, userProfileTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message, history, currentStep, userProfile, email } = body;

        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Reconstruct messages for LangChain
        // History comes as [{ role: 'user', content: '...' }, ...]
        const graphMessages = history.map((m: any) =>
            m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
        );

        // Add the new user message ONLY if it has content
        if (message && message.trim() !== "") {
            graphMessages.push(new HumanMessage(message));
        }

        // Initial State
        const initialState = {
            messages: graphMessages,
            userProfile: userProfile || {},
            currentStep: currentStep || "start",
        };

        // Run the Graph
        // We use .invoke() for a single run
        const result = await onboardingGraph.invoke(initialState);

        // Check if complete
        const finalStep = result.currentStep;
        const finalProfile = result.userProfile;

        // Save to DB if complete
        if (finalStep === "complete") {
            // 1. Get User ID
            const users = await db.select().from(userTable).where(eq(userTable.email, email));
            if (users.length > 0) {
                const userId = users[0].id;

                // 2. Insert/Update Profile
                // Check if exists
                const existingProfile = await db.select().from(userProfileTable).where(eq(userProfileTable.userId, userId));

                if (existingProfile.length > 0) {
                    await db.update(userProfileTable).set({
                        age: isNaN(Number(finalProfile.age)) ? null : Number(finalProfile.age),
                        weight: finalProfile.weight,
                        height: finalProfile.height,
                        gender: finalProfile.gender,
                        fitnessGoal: finalProfile.fitnessGoal,
                        activityLevel: finalProfile.activityLevel,
                        experienceLevel: finalProfile.experienceLevel,
                        injuries: finalProfile.injuries,
                        availableDays: finalProfile.availableDays,
                        equipment: finalProfile.equipment,
                        updatedAt: new Date(),
                    }).where(eq(userProfileTable.userId, userId));
                } else {
                    await db.insert(userProfileTable).values({
                        userId,
                        age: isNaN(Number(finalProfile.age)) ? null : Number(finalProfile.age),
                        weight: finalProfile.weight,
                        height: finalProfile.height,
                        gender: finalProfile.gender,
                        fitnessGoal: finalProfile.fitnessGoal,
                        activityLevel: finalProfile.activityLevel,
                        experienceLevel: finalProfile.experienceLevel,
                        injuries: finalProfile.injuries,
                        availableDays: finalProfile.availableDays,
                        equipment: finalProfile.equipment,
                    });
                }
            }
        }

        // Convert back to simple JSON for frontend
        const newMessages = result.messages.map((m: any) => ({
            role: m instanceof HumanMessage ? "user" : "assistant",
            content: m.content
        }));

        return NextResponse.json({
            messages: newMessages,
            currentStep: finalStep,
            userProfile: finalProfile,
        });

    } catch (error: any) {
        console.error("Onboarding Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
