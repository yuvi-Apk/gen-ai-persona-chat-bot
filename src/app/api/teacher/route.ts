import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { mentors } from "@/data/mentors";
import { asyncHandler } from "@/utils/asyncHandler";
import OpenAI from "openai";
import { convertTextToVectorEmbedding } from "@/utils/chat/convertTextToVectorEmbeding";
import { vectorEmbeddingSearch } from "@/utils/chat/vectorEmbeddingSearch";
import { buildSystemPrompt } from "@/utils/chat/buildSystemPrompt";
import { getRetrievedKnowledge } from "@/utils/chat/getRetrievedKnowledge";

const claudeAiClient = new Anthropic();

const openAiClient = new OpenAI()

export const POST = asyncHandler(async (req: NextRequest) => {
    const { mentorId, message, history } = await req.json();


    const mentor = mentors.find((m) => m.id === mentorId);
    if (!mentor) {
        return NextResponse.json({ error: "Unknown mentor" }, { status: 400 });
    }

    const userQueryVectorEmbedding = await convertTextToVectorEmbedding(message);

    const mentorVectorSearchedResult = await vectorEmbeddingSearch(mentorId, userQueryVectorEmbedding);

    const mentorConversationExample = await getRetrievedKnowledge(mentorId, mentorVectorSearchedResult)

    const SystemPrompt = await buildSystemPrompt({ mentor, knowledge: mentorConversationExample })
    console.log("SystemPrompt:", SystemPrompt)



    // claude apis 
    const response = await claudeAiClient.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        system: SystemPrompt,
        messages: [
            ...history,
            { role: "user", content: message },
        ],
    });

    // const response = await openAiClient.responses.create({
    //     model: "gpt-5-mini",
    //     instructions: SystemPrompt,
    //     input: [
    //         ...history,
    //         { role: "user", content: message },
    //     ],
    // });

    const reply = response.content.find((b) => b.type === "text")?.text ?? "";

    console.log("reply",JSON.stringify(reply));

    // const reply = response.output_text;
    return NextResponse.json({ reply });
});