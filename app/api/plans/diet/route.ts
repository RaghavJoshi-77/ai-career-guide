
import { NextRequest, NextResponse } from "next/server";
import { generateDietPlan } from "@/lib/agents/diet-planner";
import { db } from "@/lib/db";
import { userTable, userProfileTable, dietPlanTable } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const users = await db.select().from(userTable).where(eq(userTable.email, email));
        if (users.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });
        const userId = users[0].id;

        const profiles = await db.select().from(userProfileTable).where(eq(userProfileTable.userId, userId));
        if (profiles.length === 0) return NextResponse.json({ error: "Profile not found" }, { status: 400 });

        const userProfile = profiles[0];

        // Generate
        const plan = await generateDietPlan(userProfile);

        // Save with rounding to ensure integers
        await db.insert(dietPlanTable).values({
            userId,
            calories: Math.round(plan.dailyCalories),
            protein: Math.round(plan.dailyProtein),
            carbs: Math.round(plan.dailyCarbs),
            fats: Math.round(plan.dailyFats),
            meals: plan.meals,
        });

        return NextResponse.json({ success: true, plan });

    } catch (error: any) {
        console.error("Diet API Error:", error);
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
        .from(dietPlanTable)
        .where(eq(dietPlanTable.userId, userId))
        .orderBy(desc(dietPlanTable.createdAt))
        .limit(1);

    return NextResponse.json({ plan: plans[0] || null });
}
