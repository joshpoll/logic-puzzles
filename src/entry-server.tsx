import {
  createHandler,
  renderAsync,
  StartServer,
} from "solid-start/entry-server";

import * as dotenv from "dotenv";
dotenv.config();

export default createHandler(
  renderAsync((event) => <StartServer event={event} />)
);
