import { EMBEDDING_MODEL, openai } from "@/lib/openAi";

export const convertTextToVectorEmbedding = async (
    input: string,
): Promise<number[]> => {
    try {
        const response = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
            input,
        });

        const embedding = response.data?.[0]?.embedding;

        if (!embedding) {
            throw new Error("Embedding not returned.");
        }
        return embedding;
    } catch (error) {
        console.error("While converting the user text to Vector embedding:", error)
        throw error;
    }
};