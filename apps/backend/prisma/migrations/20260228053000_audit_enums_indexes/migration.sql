-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('REQUESTED', 'PROCESSED', 'REJECTED');
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('RAZORPAY', 'MOCK', 'MANUAL');
-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED');
-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('VIDEO', 'LIVE');
-- AlterTable: Payout.status String -> PayoutStatus enum
-- Must drop default before type cast, then re-set it
ALTER TABLE "Payout"
ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Payout"
ALTER COLUMN "status" TYPE "PayoutStatus" USING "status"::"PayoutStatus";
ALTER TABLE "Payout"
ALTER COLUMN "status"
SET DEFAULT 'REQUESTED'::"PayoutStatus";
-- AlterTable: Payment.status String -> PaymentStatus enum
ALTER TABLE "Payment"
ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Payment"
ALTER COLUMN "status" TYPE "PaymentStatus" USING "status"::"PaymentStatus";
-- AlterTable: Payment.provider String -> PaymentProvider enum
ALTER TABLE "Payment"
ALTER COLUMN "provider" DROP DEFAULT;
ALTER TABLE "Payment"
ALTER COLUMN "provider" TYPE "PaymentProvider" USING "provider"::"PaymentProvider";
ALTER TABLE "Payment"
ALTER COLUMN "provider"
SET DEFAULT 'RAZORPAY'::"PaymentProvider";
-- AlterTable: Attempt.status String -> AttemptStatus enum
ALTER TABLE "Attempt"
ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Attempt"
ALTER COLUMN "status" TYPE "AttemptStatus" USING "status"::"AttemptStatus";
ALTER TABLE "Attempt"
ALTER COLUMN "status"
SET DEFAULT 'IN_PROGRESS'::"AttemptStatus";
-- AlterTable: Course.type String -> CourseType enum
ALTER TABLE "Course"
ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Course"
ALTER COLUMN "type" TYPE "CourseType" USING "type"::"CourseType";
ALTER TABLE "Course"
ALTER COLUMN "type"
SET DEFAULT 'VIDEO'::"CourseType";
-- CreateIndex
CREATE INDEX "Enrollment_userId_idx" ON "Enrollment"("userId");
-- CreateIndex
CREATE INDEX "Enrollment_courseId_idx" ON "Enrollment"("courseId");
-- CreateIndex
CREATE INDEX "Attempt_userId_idx" ON "Attempt"("userId");
-- CreateIndex
CREATE INDEX "Attempt_testId_idx" ON "Attempt"("testId");
-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");
-- CreateIndex
CREATE INDEX "Payment_courseId_idx" ON "Payment"("courseId");