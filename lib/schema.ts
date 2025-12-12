import {serial , text , timestamp , pgTable } from "drizzle-orm/pg-core"

export const userTable = pgTable("users_table", {
  id: serial("id").primaryKey().notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})
