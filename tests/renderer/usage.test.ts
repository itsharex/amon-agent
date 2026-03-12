import { describe, expect, it } from "vitest";
import {
	getAssistantTurnUsage,
	getUsageContextTokens,
	getLatestAssistantUsageWithData,
	getUsageTotalInputTokens,
	hasUsageData,
} from "@/renderer/lib/usage";
import { createAssistantMessage, createUsage } from "../_helpers/mock-messages";

describe("renderer usage helpers", () => {
	it("uses the last assistant message usage for a visual turn", () => {
		const firstUsage = createUsage({ input: 120, output: 40, totalTokens: 160 });
		const lastUsage = createUsage({ input: 280, output: 90, totalTokens: 370 });

		const usage = getAssistantTurnUsage([
			createAssistantMessage([{ type: "text", text: "Calling tool" }], { usage: firstUsage }),
			createAssistantMessage([{ type: "text", text: "Final answer" }], { usage: lastUsage }),
		]);

		expect(usage).toBe(lastUsage);
	});

	it("returns null when the turn has no assistant messages", () => {
		expect(getAssistantTurnUsage([])).toBeNull();
	});

	it("counts cache read/write tokens in total input", () => {
		expect(
			getUsageTotalInputTokens(
				createUsage({
					input: 200,
					cacheRead: 50,
					cacheWrite: 25,
				}),
			),
		).toBe(275);
	});

	it("uses total tokens for context occupancy", () => {
		expect(
			getUsageContextTokens(
				createUsage({
					input: 200,
					output: 75,
					cacheRead: 50,
					cacheWrite: 25,
					totalTokens: 350,
				}),
			),
		).toBe(350);
	});

	it("falls back to input plus output when total tokens are missing", () => {
		expect(
			getUsageContextTokens(
				createUsage({
					input: 200,
					output: 75,
					cacheRead: 50,
					cacheWrite: 25,
					totalTokens: 0,
				}),
			),
		).toBe(350);
	});

	it("treats all-zero usage as missing streaming data", () => {
		expect(hasUsageData(createUsage({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0 }))).toBe(false);
	});

	it("keeps the latest non-zero assistant usage while a new turn is still streaming", () => {
		const previousUsage = createUsage({ input: 320, output: 80, totalTokens: 400 });
		const streamingUsage = createUsage({ input: 0, output: 0, totalTokens: 0 });

		const usage = getLatestAssistantUsageWithData([
			createAssistantMessage([{ type: "text", text: "Previous answer" }], { usage: previousUsage }),
			createAssistantMessage([{ type: "thinking", thinking: "Working..." }], { usage: streamingUsage }),
		]);

		expect(usage).toBe(previousUsage);
	});
});
