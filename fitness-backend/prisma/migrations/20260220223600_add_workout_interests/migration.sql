-- Add workout interests as a persisted onboarding/profile field.
ALTER TABLE "users"
ADD COLUMN "workoutInterests" VARCHAR(50)[] NOT NULL DEFAULT ARRAY[]::VARCHAR(50)[];
