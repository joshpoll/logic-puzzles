import { isServer } from "solid-js/web";
import { OpenAI } from "langchain/llms";
import server$ from "solid-start/server";

export const ask = server$(async (question: string) => {
  try {
    const model = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.1,
      modelName: "gpt-3.5-turbo",
    });
    const answer = await model.call(question);
    return { res: answer };
  } catch (e) {
    return { res: JSON.stringify(e) };
  }
});
