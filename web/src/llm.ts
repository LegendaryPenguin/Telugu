// Thin client for the server proxy that holds the LLM key.
// The server is provider-agnostic (Anthropic native OR any OpenAI-compatible
// endpoint incl. 0G's router), so the frontend just posts messages.

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmReply {
  content: string;
}

export async function chat(messages: ChatMessage[]): Promise<LlmReply> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages })
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LLM request failed (${res.status}): ${text || res.statusText}`);
  }
  return (await res.json()) as LlmReply;
}

export async function llmHealth(): Promise<{ ok: boolean; provider?: string }> {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) return { ok: false };
    return await res.json();
  } catch {
    return { ok: false };
  }
}
