import OpenAI from "openai";

export function formatBase64ToDataURL(base64String: string) {
  return `data:image/jpeg;base64,${base64String}`;
}

const openai = new OpenAI({
  apiKey: "ollama",
  baseURL: "http://localhost:11434/v1",
  dangerouslyAllowBrowser: true,
});

async function main() {
  const list = await openai.models.list();

  for await (const model of list) {
    console.log(model);
  }
}

main();

export async function getStreamOpenAI(base64String: string) {
  // Format the base64 string into a data
  console.log("in getStreamOpenAI");
  const imageUrl = formatBase64ToDataURL(base64String);

  // Create a stream with the formatted image URL
  const stream = await openai.chat.completions.create({
    model: "llava:7b",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "What’s in this image?",
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
    stream: true,
  });

  let responseContent = "";

  for await (const chunk of stream) {
    responseContent += chunk.choices[0]?.delta?.content || "";
  }

  console.log(responseContent);
}
