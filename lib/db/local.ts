import Dexie, { type Table } from "dexie"

export interface LocalMessage {
  id: string
  conversation_id: string
  content: string
  role: "user" | "assistant"
  model?: string
  created_at: Date
  synced: boolean
  metadata?: any
  isComplete?: boolean
}

export interface LocalConversation {
  id: string
  user_id?: string
  title: string
  created_at: Date
  updated_at: Date
  is_pinned: boolean
  synced: boolean
  metadata?: any
}

export interface LocalApiKey {
  id: string
  provider: string
  encrypted_key: string
  created_at: Date
}

export class Flow3Database extends Dexie {
  conversations!: Table<LocalConversation>
  messages!: Table<LocalMessage>
  api_keys!: Table<LocalApiKey>

  constructor() {
    super("Flow3Database")
    this.version(1).stores({
      conversations: "id, user_id, title, created_at, updated_at, is_pinned, synced",
      messages: "id, conversation_id, role, created_at, synced",
      api_keys: "id, provider",
    })
  }
}

export const db = new Flow3Database()
