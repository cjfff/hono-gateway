import type { Context, Env } from "hono";
import { stream } from "hono/streaming";
import type { ReadStream } from "node:fs";
import fs, { createReadStream, existsSync } from "node:fs";

export const createStreamBody = (stream: ReadStream) => {
  const body = new ReadableStream({
    start(controller): void {
      stream.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      stream.on("end", () => {
        controller.close();
      });
    },
    cancel(): void {
      stream.destroy();
    },
  });
  return body;
};

export const sendFileStream = async (
  path: string,
  c: Context<Env, any, object>
) => {
  if (!existsSync(path)) {
    return c.body("404 not find at " + path, 404);
  }
  const inputStream = fs.createReadStream(path);
  c.header('Content-Type', 'text/html')
  return stream(c, async (stream) => {
    return new Promise((resolve, reject) => {
      inputStream.on("data", (chunk) => {
        stream.write(chunk);
      });
      inputStream.on("end", () => {
        stream.close();
        resolve();
      });
      inputStream.on('error', (error) => {
        inputStream.destroy()
        reject(error)
      })
    });
  });
};
