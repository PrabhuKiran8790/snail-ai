import Database from "@tauri-apps/plugin-sql";
import { SCHEMAS } from "./schemas";
import { defaultModelProviders } from "./llm-providers";

const DB_NAME = "snail-ai-svelte-tauri.db";

export interface Conversation {
  id: number;
  conversation_name: string;
  system_message: string;
  messages: string;
  model_name: string;
  model_provider: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
}

export interface RegisteredModelProvider {
  id: number;
  name: string;
  model_provider: string;
  api_key: string;
  api_url: string;
  is_enabled: boolean;
}

export type ConversationUpdates = Partial<
  Omit<Conversation, "id" | "created_at" | "updated_at">
>;

export type RegisteredModelProviderUpdates = Partial<
  Omit<RegisteredModelProvider, "id">
>;

class DB {
  private static instance: Database | null = null;

  static async init(): Promise<void> {
    if (!this.instance) {
      this.instance = await Database.load(`sqlite:${DB_NAME}`);
      await this.instance.execute(SCHEMAS.conversations);
      await this.instance.execute(SCHEMAS.registered_model_providers);
      for (const provider of defaultModelProviders) {
        await this.registeredModelProviders.create(
          provider.name,
          provider.model_provider,
          provider.api_key,
          provider.api_url,
          provider.is_enabled
        );
      }
      console.log("Database initialized and schemas created");
    }
  }

  private static async get(): Promise<Database> {
    if (!this.instance) {
      await this.init();
    }
    return this.instance!;
  }

  private static convertBooleans<T>(item: T): T {
    const converted: any = { ...item };
    for (const key in converted) {
      if (converted[key] === "false") {
        converted[key] = false;
      } else if (converted[key] === "true") {
        converted[key] = true;
      }
    }
    return converted as T;
  }

  static conversations = {
    async create(
      conversationName: string,
      systemMessage: string,
      modelName: string,
      modelProvider: string
    ): Promise<number> {
      const db = await DB.get();
      const result = await db.execute(
        `INSERT INTO conversations (conversation_name, system_message, messages, model_name, model_provider) 
         VALUES (?, ?, ?, ?, ?)`,
        [conversationName, systemMessage, "[]", modelName, modelProvider]
      );
      return result.lastInsertId as number;
    },

    async get(id: number): Promise<Conversation | null> {
      const db = await DB.get();
      const results = await db.select<Conversation[]>(
        "SELECT * FROM conversations WHERE id = ?",
        [id]
      );
      return results[0] ? DB.convertBooleans(results[0]) : null;
    },

    async update(id: number, updates: ConversationUpdates): Promise<number> {
      const db = await DB.get();
      const setParts = Object.keys(updates).map((key) => `${key} = ?`);
      const sql = `UPDATE conversations SET ${setParts.join(
        ", "
      )} WHERE id = ?`;
      const params = [...Object.values(updates), id];
      const result = await db.execute(sql, params);
      return result.rowsAffected;
    },

    async delete(id: number): Promise<number> {
      const db = await DB.get();
      const result = await db.execute(
        "DELETE FROM conversations WHERE id = ?",
        [id]
      );
      return result.rowsAffected;
    },

    async list(): Promise<Conversation[]> {
      const db = await DB.get();
      const results = await db.select<Conversation[]>(
        "SELECT * FROM conversations ORDER BY updated_at DESC"
      );
      return results.map(DB.convertBooleans);
    },
  };

  static registeredModelProviders = {
    async create(
      name: string,
      modelProvider: string,
      apiKey: string,
      apiUrl: string,
      isEnabled: boolean = false
    ): Promise<number> {
      const db = await DB.get();

      // First, check if the provider already exists
      const existingProvider = await this.getByProvider(modelProvider);
      if (existingProvider) {
        // If it exists, return its ID
        return existingProvider.id;
      }

      // If it doesn't exist, create a new entry
      const result = await db.execute(
        `INSERT INTO registered_model_providers (name, model_provider, api_key, api_url, is_enabled) 
         VALUES (?, ?, ?, ?, ?)`,
        [name, modelProvider, apiKey, apiUrl, isEnabled]
      );
      return result.lastInsertId as number;
    },

    async get(id: number): Promise<RegisteredModelProvider | null> {
      const db = await DB.get();
      const results = await db.select<RegisteredModelProvider[]>(
        "SELECT * FROM registered_model_providers WHERE id = ?",
        [id]
      );
      return results[0] ? DB.convertBooleans(results[0]) : null;
    },

    async update(
      id: number,
      updates: RegisteredModelProviderUpdates
    ): Promise<number> {
      const db = await DB.get();
      const setParts = Object.keys(updates).map((key) => `${key} = ?`);
      const sql = `UPDATE registered_model_providers SET ${setParts.join(
        ", "
      )} WHERE id = ?`;
      const params = [...Object.values(updates), id];
      const result = await db.execute(sql, params);
      return result.rowsAffected;
    },

    async delete(id: number): Promise<number> {
      const db = await DB.get();
      const result = await db.execute(
        "DELETE FROM registered_model_providers WHERE id = ?",
        [id]
      );
      return result.rowsAffected;
    },

    async list(): Promise<RegisteredModelProvider[]> {
      const db = await DB.get();
      const results = await db.select<RegisteredModelProvider[]>(
        "SELECT * FROM registered_model_providers"
      );
      return results.map(DB.convertBooleans);
    },

    async enable(name: string): Promise<number> {
      const db = await DB.get();
      const result = await db.execute(
        "UPDATE registered_model_providers SET is_enabled = 1 WHERE model_provider = ?",
        [name]
      );
      return result.rowsAffected;
    },

    async disable(name: string): Promise<number> {
      const db = await DB.get();
      const result = await db.execute(
        "UPDATE registered_model_providers SET is_enabled = 0 WHERE model_provider = ?",
        [name]
      );
      return result.rowsAffected;
    },

    async listEnabledModelProviders(): Promise<RegisteredModelProvider[]> {
      const db = await DB.get();
      const results = await db.select<RegisteredModelProvider[]>(
        "SELECT * FROM registered_model_providers WHERE is_enabled = 1"
      );
      return results.map(DB.convertBooleans);
    },

    async getByProvider(
      provider: string
    ): Promise<RegisteredModelProvider | null> {
      const db = await DB.get();
      const results = await db.select<RegisteredModelProvider[]>(
        "SELECT * FROM registered_model_providers WHERE model_provider = ?",
        [provider]
      );
      return results[0] ? DB.convertBooleans(results[0]) : null;
    },
  };

  static async executeQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
    const db = await this.get();
    const results = await db.select<T[]>(sql, params);
    return results.map(DB.convertBooleans);
  }
}

export default DB;
