// Shared data types for the Pronto! Chrome extension

// ─── Talk ───────────────────────────────────────────────────────────────────

export interface TalkAttributes {
  title: string;
  type: string;
  level: string;
  length: number;
  description: string;
  organizer_notes: string;
  slides: string;
  created_at?: string;
  updated_at?: string;
  public?: boolean;
}

export interface Talk {
  id: string;
  attributes: TalkAttributes;
}

// ─── Bio ────────────────────────────────────────────────────────────────────

export interface BioAttributes {
  nickname: string;
  body: string;
  created_at?: string;
  updated_at?: string;
}

export interface Bio {
  id: string;
  attributes: BioAttributes;
}

// ─── User ───────────────────────────────────────────────────────────────────

export interface UserAttributes {
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
}

export interface User {
  id: string;
  attributes: UserAttributes;
}

// ─── API Response wrappers ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
}

// ─── Chrome Messaging ────────────────────────────────────────────────────────

export interface FillTalkMessage {
  type: 'FILL_TALK';
  talk_data: Partial<TalkAttributes>;
}

export interface FillBioMessage {
  type: 'FILL_BIO';
  bio_data: { body: string };
}

export type ProntoMessage = FillTalkMessage | FillBioMessage;

export interface FillResponse {
  success: boolean;
  url: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

export interface ProntoConfig {
  base_url: string;
  client_id: string;
  client_secret: string;
  debug: boolean;
  analytics: boolean;
}
