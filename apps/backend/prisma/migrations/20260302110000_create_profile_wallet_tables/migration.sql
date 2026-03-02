-- Create InstructorProfile, StudentProfile, Wallet tables
-- (Schema defines them but no previous migration created them)
-- InstructorProfile
CREATE TABLE IF NOT EXISTS "InstructorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "expertise" TEXT,
    "experience" TEXT,
    "linkedin" TEXT,
    "mentorshipFee" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    CONSTRAINT "InstructorProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "InstructorProfile_userId_key" ON "InstructorProfile"("userId");
ALTER TABLE "InstructorProfile" DROP CONSTRAINT IF EXISTS "InstructorProfile_userId_fkey";
ALTER TABLE "InstructorProfile"
ADD CONSTRAINT "InstructorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- StudentProfile
CREATE TABLE IF NOT EXISTS "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentStatus" TEXT,
    "studentSubStatus" TEXT,
    "interests" TEXT,
    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "StudentProfile_userId_key" ON "StudentProfile"("userId");
ALTER TABLE "StudentProfile" DROP CONSTRAINT IF EXISTS "StudentProfile_userId_fkey";
ALTER TABLE "StudentProfile"
ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Wallet
CREATE TABLE IF NOT EXISTS "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "totalEarnings" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "bankDetails" TEXT,
    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Wallet_userId_key" ON "Wallet"("userId");
ALTER TABLE "Wallet" DROP CONSTRAINT IF EXISTS "Wallet_userId_fkey";
ALTER TABLE "Wallet"
ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Migrate existing instructor data from flat User table into InstructorProfile
INSERT INTO "InstructorProfile" (
        "id",
        "userId",
        "bio",
        "expertise",
        "experience",
        "linkedin",
        "mentorshipFee"
    )
SELECT gen_random_uuid()::text,
    "id",
    "bio",
    "expertise",
    "experience",
    "linkedin",
    COALESCE("mentorshipFee", 0)
FROM "User"
WHERE "role" = 'INSTRUCTOR'
    AND "id" NOT IN (
        SELECT "userId"
        FROM "InstructorProfile"
    ) ON CONFLICT ("userId") DO NOTHING;
-- Migrate existing student data into StudentProfile
INSERT INTO "StudentProfile" ("id", "userId", "studentStatus", "interests")
SELECT gen_random_uuid()::text,
    "id",
    "studentStatus",
    "interests"
FROM "User"
WHERE "role" = 'STUDENT'
    AND "id" NOT IN (
        SELECT "userId"
        FROM "StudentProfile"
    ) ON CONFLICT ("userId") DO NOTHING;
-- Migrate wallet data from User.walletBalance/totalEarnings into Wallet
INSERT INTO "Wallet" (
        "id",
        "userId",
        "balance",
        "totalEarnings",
        "bankDetails"
    )
SELECT gen_random_uuid()::text,
    "id",
    COALESCE("walletBalance", 0),
    COALESCE("totalEarnings", 0),
    "bankDetails"
FROM "User"
WHERE "id" NOT IN (
        SELECT "userId"
        FROM "Wallet"
    ) ON CONFLICT ("userId") DO NOTHING;