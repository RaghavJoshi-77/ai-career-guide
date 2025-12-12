ALTER TABLE "users_table" ADD COLUMN "google_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "github_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users_table" ADD CONSTRAINT "users_table_google_id_unique" UNIQUE("google_id");--> statement-breakpoint
ALTER TABLE "users_table" ADD CONSTRAINT "users_table_github_id_unique" UNIQUE("github_id");