import { cosineSimilarity } from "./cosineSimilarity";
import fs from "node:fs";
import path from "node:path";

interface SearchResult {
    id: string;
    similarity: number;
}

interface EmbeddingData {
    model: string;
    dimension: number;
    createdAt: string;
    total: number;
    vectors: Record<string, number[]>;
}

export function vectorEmbeddingSearch(
    mentorId: string,
    userEmbedding: number[],
    topK: number = 10,
    minSimilarity: number = 0.2,
): SearchResult[] {
    const embeddingPath = path.join(
        process.cwd(),"src",
        "knowledge",
        mentorId,
        "embeddings.json",
    );

    console.log("embeddingPath",embeddingPath)

    if (!fs.existsSync(embeddingPath)) {
        throw new Error(`Embeddings not found for mentor: ${mentorId}`);
    }

    const embeddingData: EmbeddingData = JSON.parse(
        fs.readFileSync(embeddingPath, "utf8"),
    );

    const vectors = embeddingData.vectors;

    const results: SearchResult[] = [];

    for (const [id, embedding] of Object.entries(vectors)) {
        const similarity = cosineSimilarity(userEmbedding, embedding);

        if (similarity >= minSimilarity) {
            results.push({
                id,
                similarity,
            });
        }
    }

    results.sort((a, b) => b.similarity - a.similarity);

    const topMatches = results.slice(0, topK);
    return topMatches;
}

