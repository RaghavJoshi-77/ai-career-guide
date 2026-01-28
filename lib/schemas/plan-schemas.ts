
import { z } from "zod";

export const WorkoutExerciseSchema = z.object({
    name: z.string().describe("Name of the exercise (e.g., Incline Bench Press)"),
    sets: z.number().int().describe("Number of working sets"),
    reps: z.string().describe("Rep range (e.g., '6-10' or 'To Failure')"),
    rest: z.number().describe("Rest time in seconds between sets"),
    notes: z.string().describe("Specific execution notes (e.g., '4 second negative')"),
    muscleGroup: z.string().describe("Target muscle group"),
});

export const WorkoutDaySchema = z.object({
    dayName: z.string().describe("Name of the workout day (e.g., 'Chest & Back')"),
    focus: z.string().describe("Main focus of the session"),
    exercises: z.array(WorkoutExerciseSchema),
});

export const WorkoutPlanSchema = z.object({
    planName: z.string().describe("Title of the workout plan"),
    durationWeeks: z.number().int().describe("Duration of the plan in weeks"),
    frequency: z.string().describe("Days per week (e.g., '4 days/week')"),
    split: z.string().describe("Type of split (e.g., 'Upper/Lower', 'Full Body')"),
    description: z.string().describe("Brief description of the strategy"),
    schedule: z.array(WorkoutDaySchema).describe("List of workout sessions"),
});

export const MealItemSchema = z.object({
    name: z.string().describe("Name of the food item"),
    amount: z.string().describe("Quantity (e.g. '200g' or '1 cup')"),
    protein: z.number().describe("Protein in grams"),
    carbs: z.number().describe("Carbs in grams"),
    fats: z.number().describe("Fats in grams"),
    calories: z.number().describe("Calories"),
});

export const MealSchema = z.object({
    name: z.string().describe("Meal name (e.g. 'Breakfast')"),
    time: z.string().describe("Suggested time (e.g. '8:00 AM')"),
    items: z.array(MealItemSchema),
    totalCalories: z.number(),
});

export const DietPlanSchema = z.object({
    dailyCalories: z.number().describe("Target daily calorie intake"),
    dailyProtein: z.number().describe("Target protein in grams"),
    dailyCarbs: z.number().describe("Target carbs in grams"),
    dailyFats: z.number().describe("Target fats in grams"),
    meals: z.array(MealSchema).describe("Daily meal plan example"),
    notes: z.string().describe("Dietary guidelines and tips"),
});

export type WorkoutPlan = z.infer<typeof WorkoutPlanSchema>;
export type DietPlan = z.infer<typeof DietPlanSchema>;
