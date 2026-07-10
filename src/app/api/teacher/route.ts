import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { mentors } from "@/data/mentors";
import { asyncHandler } from "@/utils/asyncHandler";
import OpenAI from "openai";

const claudeAiClient = new Anthropic();

const openAiClient = new OpenAI()

export const POST = asyncHandler(async (req: NextRequest) => {
    const { mentorId, message, history } = await req.json();

    console.log("history", history)

    const mentor = mentors.find((m) => m.id === mentorId);

    console.log("mentor:",mentor)

    if (!mentor) {
        return NextResponse.json({ error: "Unknown mentor" }, { status: 400 });
    }

    // claude apis 
    // const response = await claudeAiClient.messages.create({
    //     model: "claude-haiku-4-5",
    //     max_tokens: 1024,
    //     system: `You are ${mentor.profile.name}. ${mentor.profile.tagline}`,
    //     messages: [
    //         ...history,
    //         { role: "user", content: message },
    //     ],
    // });

    const response = await openAiClient.responses.create({
        model: "gpt-5-nano",
        instructions: `You are ${mentor.profile.name}. ${mentor.profile.tagline}`,
        input: [
            ...history,
            { role: "user", content: message },
        ],
    });

    // const reply = response.content.find((b) => b.type === "text")?.text ?? "";
    const reply = response.output_text;
    return NextResponse.json({ reply });
});