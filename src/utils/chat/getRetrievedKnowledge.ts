import { MentorConversationExample } from "@/data/mentors";
import fs from "node:fs";
import path from "node:path";


interface SearchResult {
    id: string;
    similarity: number;
}

interface PersonaData {
    [id: string]: {
        question: string;
        reply: string;
    };
}

export function getRetrievedKnowledge(
    mentorId: string,
    matches: SearchResult[],
): MentorConversationExample[] {

    const personaPath = path.join(
        process.cwd(), "src",
        "knowledge",
        mentorId,
        "persona.json",
    );

    if (!fs.existsSync(personaPath)) {
        throw new Error(`persona.json not found for ${mentorId}`);
    }

    const persona: PersonaData = JSON.parse(
        fs.readFileSync(personaPath, "utf8"),
    );

    return matches
        .map((match) => {

            const item = persona[match.id];

            if (!item) return null;

            return {
                user: item.question,
                mentor: item.reply,
            };

        })
        .filter(Boolean) as MentorConversationExample[];
}