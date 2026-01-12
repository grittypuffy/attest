import type { ChatRequest } from "../models/chat";
export const generateChatResponse = async ({
	store,
	body,
}: any) => {
    const data = body as typeof ChatRequest;
	const chatCompletion = await store.state.inferenceClient.chatCompletion({
		model: "meta-llama/Llama-3.1-8B-Instruct:cerebras",
		messages: [
			{
				role: "user",
				content: data.prompt,
			},
		],
	});
	return {
        error: null,
        success: true,
        message: "Chat completion successful",
        data: {
            content: chatCompletion.choices[0].message
        }
    }
}
