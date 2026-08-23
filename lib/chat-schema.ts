import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(50),
  model: z.string().min(1).max(100),
  knowledgeBaseId: z.string().min(1).max(200),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export function parseChatRequest(payload: unknown): ChatRequest {
  return chatRequestSchema.parse(payload);
}
