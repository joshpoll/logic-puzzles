import { createResource, createSignal, createEffect } from "solid-js";
import { Title } from "solid-start";
import Counter from "~/components/Counter";
import { ask } from "~/lib/llm-api";

const data = {};

export default function Home() {
  const [question] = createSignal("What is the capital of France?");
  const [response] = createResource(question, ask);

  createEffect(() => console.log(response.loading));

  return (
    <main>
      <Title>Hello World</Title>
      <h1>Hello world!</h1>
      <Counter />
      <div>Question: {question()}</div>
      {response.loading && <div>Thinking...</div>}
      {response() && <div>Answer: {response()?.res}</div>}
      <p>
        Visit{" "}
        <a href="https://start.solidjs.com" target="_blank">
          start.solidjs.com
        </a>{" "}
        to learn how to build SolidStart apps.
      </p>
    </main>
  );
}
