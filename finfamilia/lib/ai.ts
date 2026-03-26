// AI chat utilities — calls go via Supabase Edge Functions, never direct from app
// Full implementation in Phase 7

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendChatMessage(
  _message: string,
  _conversationId: string | null,
): Promise<{ reply: string; conversationId: string } | null> {
  // Placeholder — real implementation in Phase 7
  return null;
}
