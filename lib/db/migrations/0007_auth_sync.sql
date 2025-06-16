-- Create a session variable to store the current user ID
CREATE OR REPLACE FUNCTION set_current_user_id(user_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id::text, false);
END;
$$ LANGUAGE plpgsql;

-- Function to get current user ID from session
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN nullif(current_setting('app.current_user_id', true), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Chat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message_v2" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Suggestion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vote_v2" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Stream" ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view own profile" ON "User"
  FOR SELECT USING (id = current_user_id());

CREATE POLICY "Users can update own profile" ON "User"
  FOR UPDATE USING (id = current_user_id());

-- Chat policies
CREATE POLICY "Users can view own chats" ON "Chat"
  FOR SELECT USING ("userId" = current_user_id() OR visibility = 'public');

CREATE POLICY "Users can create chats" ON "Chat"
  FOR INSERT WITH CHECK ("userId" = current_user_id());

CREATE POLICY "Users can update own chats" ON "Chat"
  FOR UPDATE USING ("userId" = current_user_id());

CREATE POLICY "Users can delete own chats" ON "Chat"
  FOR DELETE USING ("userId" = current_user_id());

-- Message policies
CREATE POLICY "Users can view messages in accessible chats" ON "Message"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Chat" 
      WHERE "Chat"."id" = "Message"."chatId" 
      AND ("Chat"."userId" = current_user_id() OR "Chat"."visibility" = 'public')
    )
  );

CREATE POLICY "Users can create messages in own chats" ON "Message"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Chat" 
      WHERE "Chat"."id" = "Message"."chatId" 
      AND "Chat"."userId" = current_user_id()
    )
  );

-- Document policies
CREATE POLICY "Users can view own documents" ON "Document"
  FOR SELECT USING ("userId" = current_user_id());

CREATE POLICY "Users can create documents" ON "Document"
  FOR INSERT WITH CHECK ("userId" = current_user_id());

CREATE POLICY "Users can update own documents" ON "Document"
  FOR UPDATE USING ("userId" = current_user_id());

-- Suggestion policies
CREATE POLICY "Users can view suggestions on accessible documents" ON "Suggestion"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Document"
      WHERE "Document"."id" = "Suggestion"."documentId"
      AND "Document"."userId" = current_user_id()
    )
  );

CREATE POLICY "Users can create suggestions" ON "Suggestion"
  FOR INSERT WITH CHECK ("userId" = current_user_id());

-- Vote policies
CREATE POLICY "Users can vote on messages in accessible chats" ON "Vote"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Vote"."chatId"
      AND ("Chat"."userId" = current_user_id() OR "Chat"."visibility" = 'public')
    )
  );

-- Stream policies
CREATE POLICY "Users can access streams in own chats" ON "Stream"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Stream"."chatId"
      AND "Chat"."userId" = current_user_id()
    )
  );
