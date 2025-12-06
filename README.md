# Hono Gateway

A lightweight, high-performance API gateway built with [Hono](https://hono.dev/) for routing and proxying requests to multiple backend services. Features a database-backed service registry with full CRUD operations.

If you want a more powerful production ready proxy server, could refer to [redbird](https://github.com/OptimalBits/redbird)

## Features

- 🚀 **Lightweight**: Built on Hono, one of the fastest web frameworks
- 💾 **Database-Backed Registry**: Persistent service registry using SQLite with Drizzle ORM
- 🔄 **Full CRUD API**: Create, read, update, and delete gateway configurations via REST API
- 🔀 **Request Proxying**: Seamlessly proxy requests to registered backend services
- ✅ **Input Validation**: Comprehensive request validation using Zod schemas
- 📄 **Pagination Support**: List gateways with pagination and filtering
- 🗑️ **Soft Delete**: Soft delete functionality with optional hard delete
- 📊 **Status Management**: Enable/disable gateways without deletion
- 🛠️ **TypeScript**: Full TypeScript support with type safety
- 📝 **Logging**: Structured logging with log4js (file logging in production)
- ⚡ **Fast**: Minimal overhead for request routing

## Installation

```bash
# Install dependencies
npm install
# or
pnpm install

# Set up the database (optional - will be created automatically)
# Set DB_FILE_NAME environment variable or it defaults to 'file:local.db'
```

## Database Setup

The gateway uses SQLite for persistent storage. The database file is specified via the `DB_FILE_NAME` environment variable (defaults to `file:local.db`), feel free to change to to other db driver.

To generate and run migrations:

```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate
```

## Quick Start

### 1. Start the Gateway

```bash
npm run dev
```

The gateway will start on `http://localhost:3000` by default. You can change the port by setting the `PORT` environment variable:

```bash
PORT=8080 npm run dev
```

### 2. Register Services

Register backend services using the REST API:

```bash
# Register a service (book-api)
curl -X POST "http://localhost:3000/api/v1/gateways/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "book-api",
    "description": "Book API service",
    "target": "http://localhost:4001",
    "isRewrite": 1
  }'

# Register another service (static-server)
curl -X POST "http://localhost:3000/api/v1/gateways/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "static-server",
    "description": "Static file server",
    "target": "http://localhost:4002",
    "isRewrite": 1
  }'
```

### 3. Route Requests Through Gateway

Once registered, you can access services through the gateway:

```bash
# Access book-api service
curl http://localhost:3000/api/v1/gateways/proxy/book-api/api/v1/book

# Access static-server
curl http://localhost:3000/api/v1/gateways/proxy/static-server/static/index.html
```

## API Reference

### Create a Gateway

Register a new gateway configuration.

**Endpoint:** `POST /api/v1/gateways/`

**Request Body:**
```json
{
  "name": "string (required, 1-100 chars)",
  "description": "string (required, 1-500 chars)",
  "target": "string (required, valid URL)",
  "isRewrite": "number (optional, 0 or 1, default: 0)",
  "status": "number (optional, 0=DISABLE, 1=ENABLE, 2=DELETED, default: 1)"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/v1/gateways/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-service",
    "description": "My backend service",
    "target": "http://localhost:5000",
    "isRewrite": 0
  }'
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "name": "my-service",
    "description": "My backend service",
    "target": "http://localhost:5000",
    "isRewrite": 0,
    "status": 1,
    "createTime": "2024-01-01 12:00:00",
    "updateTime": "2024-01-01 12:00:00"
  },
  "msg": "Gateway created successfully"
}
```

### List Gateways

Get a paginated list of all gateways.

**Endpoint:** `GET /api/v1/gateways/`

**Query Parameters:**
- `includeDeleted` (optional, boolean, default: false): Include deleted gateways
- `page` (optional, number, default: 1): Page number
- `pageSize` (optional, number, default: 10, max: 100): Items per page

**Example:**
```bash
curl "http://localhost:3000/api/v1/gateways/?page=1&pageSize=10&includeDeleted=false"
```

**Response:**
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "my-service",
      "description": "My backend service",
      "target": "http://localhost:5000",
      "isRewrite": 0,
      "status": 1,
      "createTime": "2024-01-01 12:00:00",
      "updateTime": "2024-01-01 12:00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### Get Gateway by ID

Retrieve a specific gateway configuration.

**Endpoint:** `GET /api/v1/gateways/:id`

**Example:**
```bash
curl "http://localhost:3000/api/v1/gateways/1"
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "name": "my-service",
    "description": "My backend service",
    "target": "http://localhost:5000",
    "isRewrite": 0,
    "status": 1,
    "createTime": "2024-01-01 12:00:00",
    "updateTime": "2024-01-01 12:00:00"
  }
}
```

### Update Gateway

Update an existing gateway configuration.

**Endpoint:** `PUT /api/v1/gateways/:id`

**Request Body:** (all fields optional, but at least one required)
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "target": "string (optional)",
  "isRewrite": "number (optional, 0 or 1)",
  "status": "number (optional, 0=DISABLE, 1=ENABLE, 2=DELETED)"
}
```

**Example:**
```bash
curl -X PUT "http://localhost:3000/api/v1/gateways/1" \
  -H "Content-Type: application/json" \
  -d '{
    "target": "http://localhost:6000",
    "status": 0
  }'
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "name": "my-service",
    "description": "My backend service",
    "target": "http://localhost:6000",
    "isRewrite": 0,
    "status": 0,
    "createTime": "2024-01-01 12:00:00",
    "updateTime": "2024-01-01 12:01:00"
  },
  "msg": "Gateway updated successfully"
}
```

### Delete Gateway

Delete a gateway (soft delete by default, or hard delete).

**Endpoint:** `DELETE /api/v1/gateways/:id`

**Query Parameters:**
- `hardDelete` (optional, boolean, default: false): Permanently delete instead of soft delete

**Example:**
```bash
# Soft delete (default)
curl -X DELETE "http://localhost:3000/api/v1/gateways/1"

# Hard delete (permanent)
curl -X DELETE "http://localhost:3000/api/v1/gateways/1?hardDelete=true"
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "name": "my-service",
    "description": "My backend service",
    "target": "http://localhost:5000",
    "isRewrite": 0,
    "status": 2,
    "createTime": "2024-01-01 12:00:00",
    "updateTime": "2024-01-01 12:02:00"
  },
  "msg": "Gateway deleted successfully"
}
```

### Proxy Requests

Proxy requests to registered services.

**Endpoint:** `ALL /api/v1/gateways/:server/*`

**Path Parameters:**
- `server`: The registered service name
- `*`: The path to forward to the backend service

**Example:**
```bash
# GET request
curl http://localhost:3000/api/v1/gateways/proxy/book-api/api/v1/book

# POST request
curl -X POST http://localhost:3000/api/v1/gateways/proxy/book-api/api/v1/book \
  -H "Content-Type: application/json" \
  -d '{"title": "My Book"}'

# DELETE request
curl -X DELETE http://localhost:3000/api/v1/gateways/proxy/book-api/api/v1/book
```

**Response:**
- If gateway is found and enabled: Proxies the response from the backend service
- If gateway is not found or disabled:
  ```json
  {
    "code": -1,
    "msg": "server not found"
  }
  ```
  Status: `404`

**Note:** The gateway name in the URL path must match the `name` field of a registered gateway. The path after the gateway name is forwarded to the target service.

## Example Setup

The project includes example servers to demonstrate the gateway functionality.

### Start Example Servers

**Terminal 1 - Book API Server:**
```bash
npm run demo:book
```
Runs on `http://localhost:4001`

**Terminal 2 - Static Server:**
```bash
npm run demo:static
```
Runs on `http://localhost:4002`

**Terminal 3 - Gateway:**
```bash
npm run dev
```
Runs on `http://localhost:3000`

### Complete Example Workflow

1. **Start all servers** (gateway + example servers)

2. **Register the services:**
   ```bash
   # Register book-api
   curl -X POST "http://localhost:3000/api/v1/gateways/" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "book-api",
       "description": "Book API service",
       "target": "http://localhost:4001",
       "isRewrite": 0,
       "status": 1
     }'
   
   # Register static-server
   curl -X POST "http://localhost:3000/api/v1/gateways/" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "static-server",
       "description": "Static file server",
       "target": "http://localhost:4002",
       "isRewrite": 0,
       "status": 1
     }'
   ```

3. **Test the gateway:**
   ```bash
   # List all registered gateways
   curl "http://localhost:3000/api/v1/gateways/"
   
   # Access book API through gateway
   curl http://localhost:3000/api/v1/gateways/proxy/book-api/api/v1/book
   
   # POST to book API
   curl -X POST http://localhost:3000/api/v1/gateways/proxy/book-api/api/v1/book \
     -H "Content-Type: application/json" \
     -d '{"title": "Test Book"}'
   
   # Access static files
   curl http://localhost:3000/api/v1/gateways/proxy/static-server/static/index.html
   ```

## How It Works

1. **Service Registration**: Gateway configurations are stored in a SQLite database with the following fields:
   - `name`: Unique identifier for the gateway
   - `description`: Human-readable description
   - `target`: Target URL of the backend service
   - `isRewrite`: Whether to rewrite paths (0 = no rewrite, 1 = rewrite)
   - `status`: Gateway status (0 = DISABLE, 1 = ENABLE, 2 = DELETED)

2. **Request Routing**: When a request comes in matching `/api/v1/gateway/:server/*`, the gateway:
   - Extracts the gateway name (`server`) from the URL
   - Looks up the gateway configuration in the database (excluding deleted/disabled)
   - Constructs the target URL by combining the gateway's target with the remaining path
   - Proxies the request to the target service
   - Returns the response from the backend service

3. **Path Construction**: The gateway constructs the target URL:
   - Request: `/api/v1/gateways/proxy/book-api/api/v1/book`
   - Gateway config: `target = "http://localhost:4001"`
   - Forwarded to: `http://localhost:4001/api/v1/book`

## Configuration

### Environment Variables

- `PORT`: Port number for the gateway server (default: `3000`)
- `DB_FILE_NAME`: SQLite database file path (default: `file:local.db`)
- `NODE_ENV`: Environment mode (`development` or `production`, affects logging)

### Gateway Status

Gateways can have three status values:
- `0` (DISABLE): Gateway is disabled and won't proxy requests
- `1` (ENABLE): Gateway is active and will proxy requests
- `2` (DELETED): Gateway is soft-deleted (excluded from normal queries)

### Path Rewrite

The `isRewrite` field controls path rewriting behavior:
- `0` (NO_REWRITE): Paths are forwarded as-is
- `1` (YES): Path rewriting is enabled (implementation-specific behavior)

## Development

### Scripts

- `npm run dev`: Start the gateway in development mode with hot reload
- `npm run demo:book`: Start the example book API server
- `npm run demo:static`: Start the example static file server
- `npm run build`: Build the TypeScript project
- `npm start`: Start the production server (requires build first)
- `npm run db:generate`: Generate database migration files
- `npm run db:migrate`: Run database migrations

### Project Structure

```
node-gateway/
├── src/
│   ├── index.ts           # Main entry point
│   ├── config/            # Configuration utilities
│   ├── routes/
│   │   ├── index.ts       # Route aggregator
│   │   └── gateway.ts     # Gateway routes (CRUD + proxy)
│   ├── service/
│   │   └── gateway.ts     # Gateway business logic
│   ├── schemas/
│   │   └── gateway.ts     # Zod validation schemas
│   ├── lib/
│   │   ├── validator.ts   # Request validation utilities
│   │   └── log.ts         # Logging configuration
│   └── db/
│       ├── index.ts       # Database connection
│       ├── drizzle.config.ts  # Drizzle configuration
│       └── schema/
│           └── gateway.ts # Database schema definitions
├── servers/               # Example servers
│   ├── book-api/          # Example REST API
│   └── static-server/     # Example static file server
├── drizzle/               # Database migration files
├── log/                   # Log files (production)
├── local.db               # SQLite database file
└── package.json
```

## Use Cases

- **Microservices Architecture**: Route requests to different microservices
- **Development**: Proxy requests to local development servers
- **API Aggregation**: Provide a single entry point for multiple APIs
- **Service Discovery**: Simple service registry and routing
- **Load Balancing Preparation**: Foundation for adding load balancing logic

## Limitations

- **No Authentication**: Currently no built-in authentication/authorization
- **No Load Balancing**: Routes to a single target URL per gateway
- **No Health Checks**: Doesn't verify if backend services are available
- **SQLite Database**: Uses SQLite which may not scale for high-concurrency scenarios

## Future Enhancements

- Health checks for registered services
- Load balancing across multiple instances
- Authentication and authorization middleware
- Rate limiting
- Request/response logging and monitoring
- Path rewrite implementation
- Gateway configuration import/export
- Metrics and analytics dashboard

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
