-- AlterTable
ALTER TABLE "User"
ADD COLUMN "mentorshipFee" DOUBLE PRECISION NOT NULL DEFAULT 0;
-- AlterTable
ALTER TABLE "Course"
ADD COLUMN "isFree" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "thumbnailUrl" TEXT,
    ADD COLUMN "promoVideoUrl" TEXT,
    ADD COLUMN "brochureUrl" TEXT,
    ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'INR';
-- AlterTable
ALTER TABLE "LiveClassSettings"
ADD COLUMN "recordings" JSONB,
    ADD COLUMN "notes" JSONB,
    ADD COLUMN "moderatorEmails" JSONB;
-- CreateTable
CREATE TABLE "MentorshipSlot" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MentorshipSlot_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "MentorshipBooking" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "meetingLink" TEXT,
    "context" TEXT,
    "questions" TEXT,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MentorshipBooking_pkey" PRIMARY KEY ("id")
);
-- AlterTable
ALTER TABLE "Test"
ADD COLUMN "instructions" TEXT,
    ADD COLUMN "totalMarks" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "passMarks" INTEGER,
    ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "availableAt" TIMESTAMP(3);
-- AlterTable
ALTER TABLE "Question"
ADD COLUMN "negativeMarks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;
-- AlterTable
ALTER TABLE "Attempt"
ADD COLUMN "responses" JSONB,
    ADD COLUMN "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
-- AddForeignKey
ALTER TABLE "MentorshipSlot"
ADD CONSTRAINT "MentorshipSlot_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "MentorshipBooking"
ADD CONSTRAINT "MentorshipBooking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "MentorshipBooking"
ADD CONSTRAINT "MentorshipBooking_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;