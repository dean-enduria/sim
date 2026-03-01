ALTER TABLE "referral_attribution" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sso_provider" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "waitlist" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "workspace_invitation" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "referral_attribution" CASCADE;--> statement-breakpoint
DROP TABLE "sso_provider" CASCADE;--> statement-breakpoint
DROP TABLE "waitlist" CASCADE;--> statement-breakpoint
DROP TABLE "workspace_invitation" CASCADE;--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_active_organization_id_organization_id_fk";
--> statement-breakpoint
DROP INDEX "verification_identifier_idx";--> statement-breakpoint
DROP INDEX "verification_expires_at_idx";--> statement-breakpoint
DROP TYPE "public"."workspace_invitation_status";