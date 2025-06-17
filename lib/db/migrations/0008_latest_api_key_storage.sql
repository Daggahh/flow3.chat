DO $$ BEGIN
    CREATE TYPE "api_key_provider" AS ENUM ('openai', 'anthropic', 'google', 'mistral');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "ApiKey" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" uuid NOT NULL REFERENCES "User" ("id") ON DELETE CASCADE,
    "provider" api_key_provider NOT NULL,
    "encryptedKey" text NOT NULL,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "unique_user_provider" UNIQUE ("userId", "provider")
);

-- Enable RLS
ALTER TABLE "ApiKey" ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can only view their own API keys"
    ON "ApiKey"
    FOR SELECT
    USING (auth.uid()::text = "userId"::text);

CREATE POLICY "Users can only insert their own API keys"
    ON "ApiKey"
    FOR INSERT
    WITH CHECK (auth.uid()::text = "userId"::text);

CREATE POLICY "Users can only update their own API keys"
    ON "ApiKey"
    FOR UPDATE
    USING (auth.uid()::text = "userId"::text);

CREATE POLICY "Users can only delete their own API keys"
    ON "ApiKey"
    FOR DELETE
    USING (auth.uid()::text = "userId"::text);

-- Trigger for updating updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_api_key_updated_at
    BEFORE UPDATE ON "ApiKey"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
