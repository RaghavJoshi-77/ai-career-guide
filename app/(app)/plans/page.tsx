
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Header, HeaderSpacer } from "@/components/Header";
import axios from "axios";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function PlansPage() {
    const { data: session } = useSession();
    const [workoutPlan, setWorkoutPlan] = useState<any>(null);
    const [dietPlan, setDietPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generatingCta, setGeneratingCta] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user?.email) {
            fetchPlans();
        }
    }, [session]);

    const fetchPlans = async () => {
        try {
            const [wRes, dRes] = await Promise.all([
                axios.get(`/api/plans/workout?email=${session?.user?.email}`),
                axios.get(`/api/plans/diet?email=${session?.user?.email}`)
            ]);
            setWorkoutPlan(wRes.data.plan);
            setDietPlan(dRes.data.plan);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const generatePlan = async (type: "workout" | "diet") => {
        if (!session?.user?.email) return;
        setGeneratingCta(type);

        try {
            await axios.post(`/api/plans/${type}`, { email: session.user.email });
            await fetchPlans();
        } catch (err) {
            console.error(err);
            alert("Failed to generate plan. Did you complete onboarding?");
        } finally {
            setGeneratingCta(null);
        }
    };

    if (loading) return <div className="h-screen bg-black text-white flex items-center justify-center">Loading Protocol...</div>;

    return (
        <>
            <Header />
            <HeaderSpacer />
            <div className="min-h-screen bg-black text-white p-6 md:p-12">
                <div className="max-w-6xl mx-auto space-y-12">

                    {/* Header */}
                    <div>
                        <h1 className="text-4xl font-black text-red-600 tracking-tighter uppercase mb-2">My Protocol</h1>
                        <p className="text-gray-400">Your personalized High Intensity Training & Nutrition blueprint.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">

                        {/* Workout Section */}
                        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 font-black text-6xl text-gray-700 select-none">HIT</div>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span>🏋️</span> TRAINING
                            </h2>

                            {!workoutPlan ? (
                                <div className="text-center py-10 space-y-4">
                                    <p className="text-gray-500">No active training plan found.</p>
                                    <button
                                        onClick={() => generatePlan("workout")}
                                        disabled={!!generatingCta}
                                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                                    >
                                        {generatingCta === "workout" ? "Designing Strategy..." : "Generate HIT Plan"}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">{workoutPlan.planName}</h3>
                                        <p className="text-sm text-red-500 font-mono uppercase tracking-widest">
                                            {workoutPlan.frequency} • {workoutPlan.split} • {workoutPlan.durationWeeks} Weeks
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {workoutPlan.exercises.slice(0, 3).map((day: any, i: number) => (
                                            <div key={i} className="bg-black/40 rounded-xl p-4 border border-gray-800">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="font-bold text-gray-200">{day.dayName}</h4>
                                                    <span className="text-xs bg-gray-800 px-2 py-1 rounded text-red-400 border border-red-900/30">{day.focus}</span>
                                                </div>
                                                <ul className="space-y-2 text-sm text-gray-400">
                                                    {day.exercises.map((ex: any, j: number) => (
                                                        <li key={j} className="flex justify-between border-b border-gray-800/50 pb-1 last:border-0">
                                                            <span>{ex.name}</span>
                                                            <span className="text-gray-500">
                                                                {ex.sets} x {ex.reps}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Video Feature Placeholder */}
                                    <div className="mt-4 pt-4 border-t border-gray-800">
                                        <p className="text-xs text-gray-500 mb-2 font-mono uppercase">Reference Library</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="bg-gray-800/50 aspect-video rounded-lg flex items-center justify-center text-xs text-gray-600">Video 1</div>
                                            <div className="bg-gray-800/50 aspect-video rounded-lg flex items-center justify-center text-xs text-gray-600">Video 2</div>
                                            <div className="bg-gray-800/50 aspect-video rounded-lg flex items-center justify-center text-xs text-gray-600">Video 3</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Diet Section */}
                        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10 font-black text-6xl text-gray-700 select-none">FUEL</div>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span>🥗</span> NUTRITION
                            </h2>

                            {!dietPlan ? (
                                <div className="text-center py-10 space-y-4">
                                    <p className="text-gray-500">No active diet plan found.</p>
                                    <button
                                        onClick={() => generatePlan("diet")}
                                        disabled={!!generatingCta}
                                        className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                                    >
                                        {generatingCta === "diet" ? "Calculating Macros..." : "Generate Diet Plan"}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Macro Ring/Highlights */}
                                    <div className="grid grid-cols-4 gap-2 text-center bg-black/40 p-4 rounded-xl border border-gray-800">
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Cals</div>
                                            <div className="font-black text-xl text-white">{dietPlan.calories}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Prot</div>
                                            <div className="font-bold text-lg text-red-500">{dietPlan.protein}g</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Carb</div>
                                            <div className="font-bold text-lg text-blue-500">{dietPlan.carbs}g</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Fat</div>
                                            <div className="font-bold text-lg text-yellow-500">{dietPlan.fats}g</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wide">Daily Sample</h3>
                                        {dietPlan.meals.map((meal: any, i: number) => (
                                            <div key={i} className="flex gap-4 items-start border-b border-gray-800 pb-3 last:border-0 text-sm">
                                                <div className="w-16 pt-1 text-xs text-gray-500 bg-gray-800/20 px-2 py-1 rounded text-center">
                                                    {meal.time || `Meal ${i + 1}`}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-gray-200">{meal.name}</div>
                                                    <div className="text-gray-400 text-xs mt-1">
                                                        {meal.items.map((it: any) => it.name).join(", ")}
                                                    </div>
                                                </div>
                                                <div className="text-xs font-mono text-gray-500 pt-1">
                                                    {meal.totalCalories} kcal
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
