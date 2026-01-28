CREATE TABLE "user_profile_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"age" integer,
	"height" text,
	"weight" text,
	"gender" text,
	"fitness_goal" text,
	"activity_level" text,
	"experience_level" text,
	"injuries" text,
	"available_days" text,
	"equipment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messageTable" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "messageTable" ADD COLUMN "chat_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "messageTable" ADD COLUMN "role" text NOT NULL;--> statement-breakpoint
ALTER TABLE "messageTable" ADD COLUMN "content" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profile_table" ADD CONSTRAINT "user_profile_table_user_id_users_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messageTable" DROP COLUMN "message";