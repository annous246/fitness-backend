import dotenv from "dotenv";
dotenv.config();
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";

export async function runAi(url) {
  console.log("hi");
  const client = ModelClient(endpoint, new AzureKeyCredential(token));

  console.log("hi");
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
              text: "Please identify this food (in a max of 15 to 20 caracters) and provide nutritional macros in JSON format: {name:'', protein:'', carbs:'', calories:''}.(only response with the json object ONLY!)",
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

  console.log("hi");
  if (isUnexpected(response)) {
    throw response.body.error;
  }

  //console.log(response.body.choices[0].message.content);
  return response.body.choices[0].message.content;
}
