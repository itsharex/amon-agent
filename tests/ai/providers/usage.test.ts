import { describe, expect, it } from "vitest";
import { mapGoogleGenerateContentUsage, mapOpenAICompletionsUsage } from "@/ai/providers/usage";

describe("provider usage mapping", () => {
	it("adds reasoning tokens to OpenAI Completions output accounting", () => {
		const usage = mapOpenAICompletionsUsage({
			prompt_tokens: 120,
			completion_tokens: 80,
			total_tokens: 200,
			prompt_tokens_details: { cached_tokens: 20 },
			completion_tokens_details: { reasoning_tokens: 30 },
		});

		expect(usage).toMatchObject({
			input: 100,
			output: 110,
			cacheRead: 20,
			cacheWrite: 0,
			totalTokens: 230,
		});
	});

	it("keeps Gemini prompt and cache token accounting separate", () => {
		const usage = mapGoogleGenerateContentUsage({
			promptTokenCount: 500,
			cachedContentTokenCount: 150,
			toolUsePromptTokenCount: 80,
			candidatesTokenCount: 60,
			thoughtsTokenCount: 20,
			totalTokenCount: 660,
		} as any);

		expect(usage).toMatchObject({
			input: 500,
			output: 80,
			cacheRead: 150,
			cacheWrite: 0,
			totalTokens: 660,
		});
	});
});
