import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from "hono/logger";
import routes from './routes'
import { customLogger } from './lib/log';

const app = new Hono()

app.use(logger(customLogger));

app.route('api/v1', routes)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: typeof process.env.PORT === 'string'?  Number(process.env.PORT) : 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
