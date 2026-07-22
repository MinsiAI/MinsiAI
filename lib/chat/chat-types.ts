export type ChatContextRole = "user" | "assistant";

export interface ChatContextTurn {
  role: ChatContextRole;
  content: string;
}
