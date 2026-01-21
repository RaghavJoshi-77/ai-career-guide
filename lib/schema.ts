import { serial, text, timestamp, pgTable, integer, pgEnum } from "drizzle-orm/pg-core";

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