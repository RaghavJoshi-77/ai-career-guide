
import { NextRequest, NextResponse } from "next/server";
import { generateWorkoutPlan } from "@/lib/agents/workout-planner";
import { db } from "@/lib/db";
import { userTable, userProfileTable, workoutPlanTable } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Get User
        const users = await db.select().from(userTable).where(eq(userTable.email, email));
        if (users.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });
        const userId = users[0].id;

        // 2. Get Profile
        const profiles = await db.select().from(userProfileTable).where(eq(userProfileTable.userId, userId));
        if (profiles.length === 0) return NextResponse.json({ error: "Profile not found. Complete onboarding first." }, { status: 400 });

        const userProfile = profiles[0];

        // 3. Generate Plan
        const plan = await generateWorkoutPlan(userProfile);

        // 4. Save to DB
        await db.insert(workoutPlanTable).values({
            userId,
            planName: plan.planName,
            duration: plan.durationWeeks,
            frequency: plan.frequency,
            split: plan.split,
            exercises: plan.schedule, // storing the whole schedule array in JSON column
        });

        return NextResponse.json({ success: true, plan });

    } catch (error: any) {
        console.error("Workout API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await db.select().from(userTable).where(eq(userTable.email, email));
    if (users.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const userId = users[0].id;

    const plans = await db.select()
        .from(workoutPlanTable)
        .where(eq(workoutPlanTable.userId, userId))
        .orderBy(desc(workoutPlanTable.createdAt))
        .limit(1);

    return NextResponse.json({ plan: plans[0] || null });
}
