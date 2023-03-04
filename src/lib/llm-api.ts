import { isServer } from "solid-js/web";
import { OpenAI } from "langchain/llms";

const model = new OpenAI({ temperature: 0.1 });

export default async function ask(question: string): Promise<{ res: string }> {
  const res = await model.call(question);
  return { res };
}
