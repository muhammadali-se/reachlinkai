export interface APIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export type Mode = 'generate' | 'optimize';

export type Tone = 'neutral' | 'viral' | 'professional' | 'concise';

export interface FormData {
  mode: Mode;
  input: string;
  tone: Tone;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}