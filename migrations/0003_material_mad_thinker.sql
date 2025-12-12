ALTER TABLE "users_table" RENAME COLUMN "name" TO "email";--> statement-breakpoint
ALTER TABLE "users_table" DROP CONSTRAINT "users_table_name_unique";--> statement-breakpoint
ALTER TABLE "users_table" DROP CONSTRAINT "users_table_google_id_unique";--> statement-breakpoint
ALTER TABLE "users_table" DROP CONSTRAINT "users_table_github_id_unique";--> statement-breakpoint
ALTER TABLE "users_table" DROP COLUMN "google_id";--> statement-breakpoint
ALTER TABLE "users_table" DROP COLUMN "github_id";--> statement-breakpoint
ALTER TABLE "users_table" ADD CONSTRAINT "users_table_email_unique" UNIQUE("email");