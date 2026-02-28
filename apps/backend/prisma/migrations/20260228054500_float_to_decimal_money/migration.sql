-- Float to Decimal: Prevent floating-point rounding errors in financial calculations
-- Must drop defaults before type cast, then re-set them
-- InstructorProfile.mentorshipFee
ALTER TABLE "InstructorProfile"
ALTER COLUMN "mentorshipFee" DROP DEFAULT;
ALTER TABLE "InstructorProfile"
ALTER COLUMN "mentorshipFee" TYPE DECIMAL(10, 2) USING "mentorshipFee"::DECIMAL(10, 2);
ALTER TABLE "InstructorProfile"
ALTER COLUMN "mentorshipFee"
SET DEFAULT 0;
-- Wallet.balance, Wallet.totalEarnings
ALTER TABLE "Wallet"
ALTER COLUMN "balance" DROP DEFAULT;
ALTER TABLE "Wallet"
ALTER COLUMN "totalEarnings" DROP DEFAULT;
ALTER TABLE "Wallet"
ALTER COLUMN "balance" TYPE DECIMAL(10, 2) USING "balance"::DECIMAL(10, 2),
    ALTER COLUMN "totalEarnings" TYPE DECIMAL(10, 2) USING "totalEarnings"::DECIMAL(10, 2);
ALTER TABLE "Wallet"
ALTER COLUMN "balance"
SET DEFAULT 0;
ALTER TABLE "Wallet"
ALTER COLUMN "totalEarnings"
SET DEFAULT 0;
-- Payout.amount (no default)
ALTER TABLE "Payout"
ALTER COLUMN "amount" TYPE DECIMAL(10, 2) USING "amount"::DECIMAL(10, 2);
-- EarningsLedger.amount (no default)
ALTER TABLE "EarningsLedger"
ALTER COLUMN "amount" TYPE DECIMAL(10, 2) USING "amount"::DECIMAL(10, 2);
-- Course.price (has default), pricePerClass, discountedPrice (nullable, no default)
ALTER TABLE "Course"
ALTER COLUMN "price" DROP DEFAULT;
ALTER TABLE "Course"
ALTER COLUMN "price" TYPE DECIMAL(10, 2) USING "price"::DECIMAL(10, 2),
    ALTER COLUMN "pricePerClass" TYPE DECIMAL(10, 2) USING "pricePerClass"::DECIMAL(10, 2),
    ALTER COLUMN "discountedPrice" TYPE DECIMAL(10, 2) USING "discountedPrice"::DECIMAL(10, 2);
ALTER TABLE "Course"
ALTER COLUMN "price"
SET DEFAULT 0;
-- Payment.amount (no default)
ALTER TABLE "Payment"
ALTER COLUMN "amount" TYPE DECIMAL(10, 2) USING "amount"::DECIMAL(10, 2);
-- MentorshipBooking.amountPaid (has default)
ALTER TABLE "MentorshipBooking"
ALTER COLUMN "amountPaid" DROP DEFAULT;
ALTER TABLE "MentorshipBooking"
ALTER COLUMN "amountPaid" TYPE DECIMAL(10, 2) USING "amountPaid"::DECIMAL(10, 2);
ALTER TABLE "MentorshipBooking"
ALTER COLUMN "amountPaid"
SET DEFAULT 0;