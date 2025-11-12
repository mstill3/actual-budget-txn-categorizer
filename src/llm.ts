import fetch from "node-fetch";
import { Config } from './configs.js';


/**
 * Queries local Ollama Large-Language-Model
 * @param prompt - input text for LLM
 * @returns LLM response
 */
export async function queryLocalLLM(prompt: string) {
    const response = await fetch(Config.llm.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: Config.llm.model, prompt })
    });

    if (!response.body) throw new Error("No response body");

    const decoder = new TextDecoder();
    let text = "";

    for await (const chunk of response.body as any) {
        const chunkText = decoder.decode(chunk);
        const lines = chunkText.split("\n").filter(Boolean);
        for (const line of lines) {
            const data = JSON.parse(line);
            if (data.response) text += data.response;
        }
    }

    return text;
}
