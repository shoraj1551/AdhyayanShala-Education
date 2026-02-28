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
ALTER TABLE "Payout"
ALTER COLUMN "status"
SET DEFAULT 'REQUESTED',
    ALTER COLUMN "status" TYPE "PayoutStatus" USING "status"::"PayoutStatus";
-- AlterTable: Payment.status String -> PaymentStatus enum
ALTER TABLE "Payment"
ALTER COLUMN "status" TYPE "PaymentStatus" USING "status"::"PaymentStatus";
-- AlterTable: Payment.provider String -> PaymentProvider enum
ALTER TABLE "Payment"
ALTER COLUMN "provider"
SET DEFAULT 'RAZORPAY',
    ALTER COLUMN "provider" TYPE "PaymentProvider" USING "provider"::"PaymentProvider";
-- AlterTable: Attempt.status String -> AttemptStatus enum
ALTER TABLE "Attempt"
ALTER COLUMN "status"
SET DEFAULT 'IN_PROGRESS',
    ALTER COLUMN "status" TYPE "AttemptStatus" USING "status"::"AttemptStatus";
-- AlterTable: Course.type String -> CourseType enum
ALTER TABLE "Course"
ALTER COLUMN "type"
SET DEFAULT 'VIDEO',
    ALTER COLUMN "type" TYPE "CourseType" USING "type"::"CourseType";
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