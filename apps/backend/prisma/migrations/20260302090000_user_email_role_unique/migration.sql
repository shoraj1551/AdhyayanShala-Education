-- Change User unique constraint from email-only to email+role composite
-- This allows the same person to register with different roles
-- Drop old unique index on email alone
DROP INDEX IF EXISTS "User_email_key";
-- Create new composite unique index on email + role
CREATE UNIQUE INDEX "User_email_role_key" ON "User"("email", "role");