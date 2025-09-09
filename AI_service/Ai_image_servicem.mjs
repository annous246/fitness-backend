import dotenv from "dotenv";
dotenv.config();
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";

export async function runAi(url) {
  try {
    console.log("Starting AI request...");
    console.log("Endpoint:", endpoint);
    console.log("Model:", model);
    console.log("Image URL:", url);
    if (!token) {
      throw new Error("API token is not set in the environment variables.");
    }
    if (!url) {
      throw new Error("Image URL is not provided.");
    }

    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that can analyze images",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please identify this food (in a max of 15 to 20 characters) and provide nutritional macros and total estimated portion in grams (g), in JSON format: {name:'', protein:'', carbs:'', calories:'', portion:''}.",
              },
              {
                type: "image_url",
                image_url: {
                  url: url,
                },
              },
            ],
          },
        ],
        temperature: 1,
        top_p: 1,
        model: model,
      },
    });

    if (isUnexpected(response)) {
      console.error("Unexpected response:", JSON.stringify(response, null, 2));
      const error = response.body?.error || {
        message: "Unknown error occurred",
        status: response.status,
      };
      throw new Error(JSON.stringify(error));
    }

    return response.body.choices[0].message.content;
  } catch (error) {
    console.error("Error in runAi:", error.message);
    throw error;
  }
}
