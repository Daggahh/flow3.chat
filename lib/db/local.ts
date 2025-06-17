import Dexie, { type Table } from "dexie"

export interface LocalMessage {
  id: string
  chatId: string
  role: "user" | "assistant"
  parts: any
  attachments: any
  createdAt: Date
  synced: boolean
}

export interface LocalConversation {
  id: string
  userId?: string
  title: string
  createdAt: Date
  visibility: "public" | "private"
  isPinned: boolean
  synced: boolean
}

export type ApiKeyProvider = "openai" | "anthropic" | "google" | "mistral"

export interface LocalApiKey {
  id: string
  userId?: string
  provider: ApiKeyProvider
  encryptedKey: string
  createdAt: Date
  updatedAt: Date
  synced: boolean
}

export class Flow3Database extends Dexie {
  conversations!: Table<LocalConversation>
  messages!: Table<LocalMessage>
  api_keys!: Table<LocalApiKey>

  constructor() {
    super("Flow3Database")    
    this.version(1).stores({
      conversations: "id, userId, title, createdAt, visibility, isPinned, synced",
      messages: "id, chatId, role, createdAt, synced",
      api_keys: "id, userId, provider, createdAt, synced"
    })
  }
}

export const db = new Flow3Database()
