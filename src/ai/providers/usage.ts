import type { GenerateContentResponseUsageMetadata } from "@google/genai";
import type { ChatCompletionChunk } from "openai/resources/chat/completions.js";
import type { Usage } from "../types";

function createEmptyCost(): Usage["cost"] {
	return { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 };
}

export function mapOpenAICompletionsUsage(
	chunkUsage: NonNullable<ChatCompletionChunk["usage"]>,
): Usage {
	const cachedTokens = chunkUsage.prompt_tokens_details?.cached_tokens || 0;
	const reasoningTokens = chunkUsage.completion_tokens_details?.reasoning_tokens || 0;
	const input = Math.max((chunkUsage.prompt_tokens || 0) - cachedTokens, 0);
	const output = (chunkUsage.completion_tokens || 0) + reasoningTokens;

	return {
		input,
		output,
		cacheRead: cachedTokens,
		cacheWrite: 0,
		totalTokens: input + output + cachedTokens,
		cost: createEmptyCost(),
	};
}

export function mapGoogleGenerateContentUsage(
	usageMetadata: GenerateContentResponseUsageMetadata,
): Usage {
	const input = usageMetadata.promptTokenCount || 0;
	const cacheRead = usageMetadata.cachedContentTokenCount || 0;
	const output = (usageMetadata.candidatesTokenCount || 0) + (usageMetadata.thoughtsTokenCount || 0);

	return {
		input,
		output,
		cacheRead,
		cacheWrite: 0,
		totalTokens: usageMetadata.totalTokenCount || 0,
		cost: createEmptyCost(),
	};
}
