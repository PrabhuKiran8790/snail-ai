export const SCHEMAS = {
  conversations: `
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_name TEXT NOT NULL,
  system_message TEXT,
  messages TEXT NOT NULL,
  model_name TEXT NOT NULL,
  model_provider TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_favorite BOOLEAN NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_conversation_name ON conversations(conversation_name);
CREATE INDEX IF NOT EXISTS idx_model_name ON conversations(model_name);
CREATE INDEX IF NOT EXISTS idx_updated_at ON conversations(updated_at);
CREATE TRIGGER IF NOT EXISTS update_conversations_timestamp 
AFTER UPDATE ON conversations
BEGIN
    UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;`,

  registered_model_providers: `
CREATE TABLE IF NOT EXISTS registered_model_providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  model_provider TEXT NOT NULL UNIQUE,
  api_key TEXT,
  api_url TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_model_provider ON registered_model_providers(model_provider);`,
};
