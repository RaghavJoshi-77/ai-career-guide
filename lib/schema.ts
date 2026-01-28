import { serial, text, timestamp, pgTable, integer, pgEnum, json } from "drizzle-orm/pg-core";

// 1. Define the User Table
export const userTable = pgTable("users_table", {
  id: serial("id").primaryKey().notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// 2. Define the Message Table (UPDATED)
export const messageTable = pgTable("messageTable", {
  id: serial("id").primaryKey().notNull(),

  // MUST be integer to match userTable.id
  userId: integer("user_id")
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),

  // NEW COLUMN: This was missing in your error
  chatId: text("chat_id").notNull(),

  // NEW COLUMN: 'user' or 'assistant'
  role: text("role").notNull(),

  // RENAMED: from 'message' to 'content'
  content: text("content").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Define the User Profile Table
export const userProfileTable = pgTable("user_profile_table", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  age: integer("age"),
  height: text("height"),
  weight: text("weight"),
  gender: text("gender"),
  fitnessGoal: text("fitness_goal"),
  activityLevel: text("activity_level"), // Sendary, Active, etc.
  experienceLevel: text("experience_level"), // Beginner, Intermediate, Advanced
  injuries: text("injuries"), // Comma separated
  availableDays: text("available_days"), // Comma separated days
  equipment: text("equipment"), // Comma separated
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// 4. Workout Plan Table
export const workoutPlanTable = pgTable("workout_plan_table", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  planName: text("plan_name").notNull(),
  duration: integer("duration_weeks"), // e.g. 4, 8, 12 loops
  frequency: text("frequency"), // e.g. "4 days/week"
  split: text("split"), // e.g. "Upper/Lower", "PPL"
  exercises: json("exercises").$type<any[]>().notNull(), // Array of exercise objects
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Diet Plan Table
export const dietPlanTable = pgTable("diet_plan_table", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs").notNull(),
  fats: integer("fats").notNull(),
  meals: json("meals").$type<any[]>().notNull(), // Array of meal objects
  createdAt: timestamp("created_at").defaultNow().notNull(),
});