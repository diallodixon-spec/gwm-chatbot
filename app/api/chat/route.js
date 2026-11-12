import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "A message is required." },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5.6-sol",

      tools: [
        {
          type: "web_search",
          filters: {
            allowed_domains: ["gwmjamaica.com"],
          },
        },
      ],

      // Require a web search for every question.
      tool_choice: "required",

      instructions: `
        You are the GWM Jamaica virtual assistant.

        Help customers with GWM vehicles, specifications, pricing,
        warranty, servicing and dealership information.

        Always search gwmjamaica.com before answering.

        Only provide information supported by the website.
        Never invent specifications, prices, promotions or warranty terms.

        For vehicle-specific questions, include a link to the relevant vehicle page whenever one is available.

Linking guidelines:

- When mentioning a specific vehicle model, include a clickable link to its corresponding vehicle page on gwmjamaica.com whenever the URL is available from search results.
- Links must use valid Markdown hyperlink syntax: [Link text](URL).
- Never output a link label in square brackets without a URL, such as [View the Jolion Pro].
- Never invent or guess URLs.
- If you cannot find the vehicle's page URL, simply provide the answer without a link.

        If the information cannot be found, say so and recommend
        contacting GWM Jamaica.

        Be friendly, conversational and concise.
        Formatting guidelines:
        - Do not use bold formatting or Markdown bold markers (**).
        - Use numbered lists when presenting rankings or multiple options.
        - Use bullet points when listing features or specifications.
        - Keep paragraphs short and easy to read.
        - Remove unnecessary newline characters.
      `,

      input: message.trim(),
    });

    const messageOutput = response.output.find(
      (item) => item.type === "message"
    );

    const textContent = messageOutput?.content?.find(
      (item) => item.type === "output_text"
    );

const annotations = textContent?.annotations || [];

// Extract and clean the source URLs.
const citations = annotations
  .filter((item) => item.type === "url_citation")
  .map((item) => {
    const rawUrl = item.url;

    // Handle URLs returned in Markdown format.
    const match = rawUrl.match(/https?:\/\/[^\s)\]]+/);
    const url = match ? match[0] : rawUrl;

    return {
      title: item.title,
      url,
    };
  });

// Remove inline citations from the answer.
let reply = response.output_text;

annotations
  .slice()
  .sort((a, b) => b.start_index - a.start_index)
  .forEach((item) => {
    reply =
      reply.slice(0, item.start_index) +
      reply.slice(item.end_index);
  });

return NextResponse.json({
  reply,
  citations,
});

  } catch (error) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      { error: "Unable to process your request." },
      { status: 500 }
    );
  }
}
