import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.basePath('/api/v1').get('/book', (c) => {
    return c.json({
        code: 0,
        msg: 'this is book api'
    })
})
.post('/book', async c => {
    console.log(await c.req.json());
      return c.json({
        code: 0,
        msg: 'this is book api from post'
    }) 
})
.delete('/book', c => {
      return c.json({
        code: 0,
        msg: 'this is book api from delete'
    }) 
})

serve({
  fetch: app.fetch,
  port: 4001
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
