
import OpenAI from "openai";

console.log(process.env.OPENAI_API_KEY)

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const response = await client.responses.create({
    model: "gpt-5",
    instructions: "",
    input: [
        {
            role: "user",
            content: [
                {
                    type: "input_text",
                    text: "Hello"
                },

            ]
        }
    ]

});

const response2 = await client.chat.completions.create({
    model: "gpt-4",
    messages: [{
        role: "user",
        content: [
            {
                type: "text",
                text: "hello"
            },
        ]
    }
    ]
})

console.log(response.output_text);