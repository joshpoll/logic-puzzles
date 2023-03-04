import { isServer } from "solid-js/web";
import { OpenAI } from "langchain/llms";
import server$ from "solid-start/server";
import { FewShotPromptTemplate, PromptTemplate } from "langchain";
import { DynamicTool } from "langchain/tools";
import {
  AgentExecutor,
  initializeAgentExecutor,
  ZeroShotAgent,
} from "langchain/agents";

export const getModel = server$(async () => {
  const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.1,
    modelName: "gpt-3.5-turbo",
  });
  return model;
});

export const ask = server$(
  ({ model, question }: { model: OpenAI; question: string }) => {
    return model.call(question);
  }
);

export const getCapital = server$(
  async ({ model, country }: { model: OpenAI; country: string }) => {
    // const template = `What is the capital of {country}?`;
    // const promptTemplate = new PromptTemplate({
    //   inputVariables: ["country"],
    //   template,
    // });

    const examples = [
      { country: "United States", capital: "Washington, D.C." },
      { country: "Canada", capital: "Ottawa" },
    ];

    const examplesTemplate = "Country: {country}\nCapital: {capital}\n";
    const examplePrompt = new PromptTemplate({
      inputVariables: ["country", "capital"],
      template: examplesTemplate,
    });

    const fewShotPrompt = new FewShotPromptTemplate({
      examples,
      examplePrompt,
      prefix: "What is the capital of the country below?",
      suffix: "Country: {country}\nCapital:",
      inputVariables: ["country"],
      exampleSeparator: "\n\n",
      templateFormat: "f-string",
    });

    const question = await fewShotPrompt.format({
      country,
    });

    return ask({ model, question });
  }
);

export type LogicGrid = {
  rows: {
    [key: string]: {
      [key: string]: {
        [key: string]: {
          [key: string]: boolean | null;
        };
      };
    };
  };
  cols: {
    [key: string]: {
      [key: string]: {
        [key: string]: {
          [key: string]: boolean | null;
        };
      };
    };
  };
};

export let logicGrid: LogicGrid = { rows: {}, cols: {} };
// initialize logic grid
export const initializeLogicGrid = (names: [string, string[]][]): LogicGrid => {
  logicGrid = { rows: {}, cols: {} };

  // columns are list of names excluding 0th
  // rows are list of names excluding 1st
  const columns = names.slice(1);
  const rows = names.slice(0, 1).concat(names.slice(2));

  // initialize logic grid
  for (let i = 0; i < rows.length; i++) {
    const [name, values] = rows[i];
    logicGrid.rows[name] = {};
    for (const value of values) {
      logicGrid.rows[name][value] = {};
      for (let j = 0; j < columns.length - i; j++) {
        const [name2, values2] = columns[j];
        logicGrid.rows[name][value][name2] = {};
        for (const value2 of values2) {
          logicGrid.rows[name][value][name2][value2] = null;
        }
      }
    }
  }

  for (let i = 0; i < columns.length; i++) {
    const [name, values] = columns[i];
    logicGrid.cols[name] = {};
    for (const value of values) {
      logicGrid.cols[name][value] = {};
      for (let j = 0; j < rows.length - i; j++) {
        const [name2, values2] = rows[j];
        logicGrid.cols[name][value][name2] = {};
        for (const value2 of values2) {
          logicGrid.cols[name][value][name2][value2] = null;
        }
      }
    }
  }

  return logicGrid;
};

// mark
export const mark = (
  path: [{ field: string; value: string }, { field: string; value: string }],
  value: boolean
): /* LogicGrid */ any => {
  const name1 = path[0];
  const name2 = path[1];

  // propagate false
  if (value === true) {
    if (name1.field in logicGrid.rows) {
      const field = logicGrid.rows[name1.field][name1.value][name2.field];
      for (const key in field) {
        field[key] = false;
      }
    } else {
      const field = logicGrid.rows[name2.field][name2.value][name1.field];
      for (const key in field) {
        field[key] = false;
      }
    }

    if (name1.field in logicGrid.cols) {
      const field = logicGrid.cols[name1.field][name1.value][name2.field];
      for (const key in field) {
        field[key] = false;
      }
    } else {
      const field = logicGrid.cols[name2.field][name2.value][name1.field];
      for (const key in field) {
        field[key] = false;
      }
    }
  }

  if (name1.field in logicGrid.rows) {
    logicGrid.rows[name1.field][name1.value][name2.field][name2.value] = value;
  } else {
    logicGrid.rows[name2.field][name2.value][name1.field][name1.value] = value;
  }

  if (name1.field in logicGrid.cols) {
    logicGrid.cols[name1.field][name1.value][name2.field][name2.value] = value;
  } else {
    logicGrid.cols[name2.field][name2.value][name1.field][name1.value] = value;
  }

  return logicGrid;
};

export const dynamicToolsTest = server$(
  async ({ model }: { model: OpenAI }) => {
    try {
      const tools = [
        new DynamicTool({
          name: "FOO",
          description:
            "call this to get the value of foo. input should be an empty string.",
          func: () =>
            new Promise((resolve) => {
              resolve("foo");
            }),
        }),
        new DynamicTool({
          name: "BAR",
          description:
            "call this to get the value of bar. input should be an empty string.",
          func: () =>
            new Promise((resolve) => {
              resolve("baz1");
            }),
        }),
      ];

      const executor = await initializeAgentExecutor(
        tools,
        model,
        "zero-shot-react-description"
      );

      // const executor = AgentExecutor.fromAgentAndTools({
      //   agent: ZeroShotAgent.fromLLMAndTools(model, tools),
      //   tools,
      //   returnIntermediateSteps: true,
      // });

      const input = "What is the value of foo?";

      const result = await executor.call({ input });

      return result;
    } catch (e) {
      console.error(e);
    }

    // return input;
    // return await model.call(input);
  }
);
