import { type Collection, ObjectId } from "mongodb";
export const generateSummary = async ({
	store,
	params: { project_id },
	body,
}: any) => {
	const projectCollection: Collection = store.state.projectCollection;
	const projectData = await projectCollection.findOne({
		_id: new ObjectId(project_id),
	});
	if (!projectData) return null;
	const prompt = `For the given project details below:
Name: ${projectData?.project_name}
Description: ${projectData?.description}

A proposal has been made with the following data:
${body}

Generate a summary for the above data
`;
	const chatCompletion = await store.state.inferenceClient.chatCompletion({
		model: "meta-llama/Llama-3.1-8B-Instruct:cerebras",
		messages: [
			{
				role: "user",
				content: prompt,
			},
		],
	});
	return chatCompletion.choices[0].message;
}
