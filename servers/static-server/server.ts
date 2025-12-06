import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import path from "path";
// import { sendFileStream } from "./lib/sendFileStream";

const __dirname = path.dirname(import.meta.filename);

const app = new Hono();

app.use(
  "/static/*",
  serveStatic({
    root: path.resolve(__dirname, "./"),
  })
);

app.get("/", (c) => {
  return c.html("static server");
});

// app.use('*', async (c) => {
//     return sendFileStream(path.join(__dirname, './client/index.html'), c)
// })

serve(
  {
    fetch: app.fetch,
    port: 4002,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
