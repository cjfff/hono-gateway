import { Hono } from "hono";
import { proxy } from "hono/proxy";
import gatewayService from "../service/gateway";
import {
  createGatewaySchema,
  updateGatewaySchema,
  idParamSchema,
  listQuerySchema,
  deleteQuerySchema,
} from "../schemas/gateway";
import { validateBody, validateParam, validateQuery, formatZodError } from "../lib/validator";

const gateway = new Hono();

// POST /api/v1/gateway/ - Create a new gateway
gateway.post("/", async (c) => {
  try {
    const validation = await validateBody(c, createGatewaySchema);
    
    if (!validation.success) {
      return c.json(formatZodError(validation.error), 400);
    }

    const result = await gatewayService.create(validation.data);

    return c.json({ code: 0, data: result, msg: "Gateway created successfully" }, 201);
  } catch (error: any) {
    return c.json(
      {
        code: -1,
        msg: error.message || "Failed to create gateway",
      },
      500
    );
  }
});

// GET /api/v1/gateway/ - List all gateways with pagination
gateway.get("/", async (c) => {
  try {
    const validation = validateQuery(c, listQuerySchema);
    
    if (!validation.success) {
      return c.json(formatZodError(validation.error), 400);
    }

    const { includeDeleted, page, pageSize } = validation.data;
    const [gateways, total] = await Promise.all([
      gatewayService.list(includeDeleted ?? false, page, pageSize),
      gatewayService.count(includeDeleted ?? false),
    ]);
    
    const totalPages = Math.ceil(total / pageSize);
    
    return c.json({ 
      code: 0, 
      data: gateways, 
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    }, 200);
  } catch (error: any) {
    return c.json(
      {
        code: -1,
        msg: error.message || "Failed to list gateways",
      },
      500
    );
  }
});

// GET /api/v1/gateway/:id - Get gateway by ID
gateway.get("/:id", async (c) => {
  try {
    const validation = validateParam(c, idParamSchema);
    
    if (!validation.success) {
      return c.json(formatZodError(validation.error), 400);
    }

    const gateway = await gatewayService.getById(validation.data.id);
    
    if (!gateway) {
      return c.json(
        {
          code: -1,
          msg: "Gateway not found",
        },
        404
      );
    }

    return c.json({ code: 0, data: gateway }, 200);
  } catch (error: any) {
    return c.json(
      {
        code: -1,
        msg: error.message || "Failed to get gateway",
      },
      500
    );
  }
});

// PUT /api/v1/gateway/:id - Update gateway by ID
gateway.put("/:id", async (c) => {
  try {
    const paramValidation = validateParam(c, idParamSchema);
    
    if (!paramValidation.success) {
      return c.json(formatZodError(paramValidation.error), 400);
    }

    const bodyValidation = await validateBody(c, updateGatewaySchema);
    
    if (!bodyValidation.success) {
      return c.json(formatZodError(bodyValidation.error), 400);
    }

    const result = await gatewayService.updateById(paramValidation.data.id, bodyValidation.data);
    
    if (!result) {
      return c.json(
        {
          code: -1,
          msg: "Gateway not found",
        },
        404
      );
    }

    return c.json({ code: 0, data: result, msg: "Gateway updated successfully" }, 200);
  } catch (error: any) {
    return c.json(
      {
        code: -1,
        msg: error.message || "Failed to update gateway",
      },
      500
    );
  }
});

// DELETE /api/v1/gateway/:id - Delete gateway by ID
gateway.delete("/:id", async (c) => {
  try {
    const paramValidation = validateParam(c, idParamSchema);
    
    if (!paramValidation.success) {
      return c.json(formatZodError(paramValidation.error), 400);
    }

    const queryValidation = validateQuery(c, deleteQuerySchema);
    
    if (!queryValidation.success) {
      return c.json(formatZodError(queryValidation.error), 400);
    }

    const result = await gatewayService.deleteById(
      paramValidation.data.id,
      queryValidation.data.hardDelete ?? false
    );
    
    if (!result) {
      return c.json(
        {
          code: -1,
          msg: "Gateway not found",
        },
        404
      );
    }

    return c.json({ 
      code: 0, 
      data: result, 
      msg: queryValidation.data.hardDelete ? "Gateway deleted permanently" : "Gateway deleted successfully" 
    }, 200);
  } catch (error: any) {
    return c.json(
      {
        code: -1,
        msg: error.message || "Failed to delete gateway",
      },
      500
    );
  }
});

// Proxy routes - forward requests to registered servers
gateway.all("/proxy/:server/*", async (c) => {
  const name = c.req.param("server");

  if (!name) {
    return c.notFound()
  }

  const server = await gatewayService.getByName(name);

  if (!server) {
    return c.json(
      {
        code: -1,
        msg: "server not found",
      },
      {
        status: 404,
      }
    );
  }

  let path = c.req.path.replace(/.*gateways/, "")

  if (server.isRewrite) {
    path = path.replace(`/proxy/${name}`, "");
  }

  const target = `${server.target}${path}`;


  return proxy(target, {
    ...c.req, // optional, specify only when forwarding all the request data (including credentials) is necessary.
    headers: {
      ...c.req.header(),
      // Authorization: undefined, // do not propagate request headers contained in c.req.header('Authorization')
    },
  });
});

export { gateway };
