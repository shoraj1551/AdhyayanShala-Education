-- Float to Decimal: Prevent floating-point rounding errors in financial calculations
-- InstructorProfile
ALTER TABLE "InstructorProfile"
ALTER COLUMN "mentorshipFee" TYPE DECIMAL(10, 2) USING "mentorshipFee"::DECIMAL(10, 2);
-- Wallet
ALTER TABLE "Wallet"
ALTER COLUMN "balance" TYPE DECIMAL(10, 2) USING "balance"::DECIMAL(10, 2),
    ALTER COLUMN "totalEarnings" TYPE DECIMAL(10, 2) USING "totalEarnings"::DECIMAL(10, 2);
-- Payout
ALTER TABLE "Payout"
ALTER COLUMN "amount" TYPE DECIMAL(10, 2) USING "amount"::DECIMAL(10, 2);
-- EarningsLedger
ALTER TABLE "EarningsLedger"
ALTER COLUMN "amount" TYPE DECIMAL(10, 2) USING "amount"::DECIMAL(10, 2);
-- Course
ALTER TABLE "Course"
ALTER COLUMN "price" TYPE DECIMAL(10, 2) USING "price"::DECIMAL(10, 2),
    ALTER COLUMN "pricePerClass" TYPE DECIMAL(10, 2) USING "pricePerClass"::DECIMAL(10, 2),
    ALTER COLUMN "discountedPrice" TYPE DECIMAL(10, 2) USING "discountedPrice"::DECIMAL(10, 2);
-- Payment
ALTER TABLE "Payment"
ALTER COLUMN "amount" TYPE DECIMAL(10, 2) USING "amount"::DECIMAL(10, 2);
-- MentorshipBooking
ALTER TABLE "MentorshipBooking"
ALTER COLUMN "amountPaid" TYPE DECIMAL(10, 2) USING "amountPaid"::DECIMAL(10, 2);