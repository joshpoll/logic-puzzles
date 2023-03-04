import { createResource, createSignal } from "solid-js";
import ask from "~/lib/llm-api";
import "./Counter.css";

export default function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <button class="increment" onClick={() => setCount(count() + 1)}>
      Clicks: {count()}
    </button>
  );
}
